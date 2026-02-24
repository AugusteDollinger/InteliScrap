from urllib.parse import quote_plus
from .base_scraper import BaseScraper

class AmazonScraper(BaseScraper):

    def __init__(self, query: str):
        encoded_query = quote_plus(query.strip())
        super().__init__(url=f"https://www.amazon.fr/s?k={encoded_query}")

    def parse_data(self):
        """Parse the Amazon search results page and extract product information."""
        products = []
        if not self.soup:
            return products

        for item in self.soup.find_all("div", {"data-component-type": "s-search-result"}):
            # Title is in h2
            title_wrapper = item.find("h2")
            if not title_wrapper:
                continue
            title_tag = title_wrapper.find("span")
            if not title_tag:
                continue
            
            # Link is a.s-no-outline in the item
            link_tag = item.find("a", class_="s-no-outline")
            if not link_tag:
                continue
            
            # Price from a-offscreen span
            price_full = item.select_one("span.a-offscreen")
            
            # Image from img tag
            img_tag = item.find("img")
            image_url = img_tag.get("src", "") if img_tag else ""

            title = title_tag.get_text(strip=True)
            link = link_tag.get("href", "")
            if link and not link.startswith("http"):
                link = f"https://www.amazon.fr{link}"

            price = price_full.get_text(strip=True) if price_full else ""
            
            # Extract currency symbol from price
            currency = ""
            if price:
                for ch in price.strip():
                    if not ch.isdigit() and ch not in [".", ",", " "]:
                        currency = ch
                        break

            products.append({
                "title": title,
                "price": price,
                "currency": currency,
                "link": link,
                "image": image_url,
            })

        return products
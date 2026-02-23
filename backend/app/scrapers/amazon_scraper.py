from bs4 import BeautifulSoup
from base_scraper import BaseScraper
import json

class AmazonScraper(BaseScraper):

    def __init__(self):
        super().__init__(url="https://www.amazon.fr/s?k=wireless+headphones")

    def parse(self):
        """Parse the Amazon search results page and extract product information."""
        products = []
        if not self.soup:
            print("No soup to parse.")
            return products
        
        for item in self.soup.find_all("div", {"data-component-type": "s-search-result"}):
            title_tag = item.find("h2", attrs={"aria-label": True})
            price_whole = item.find("span", class_="a-price-whole")
            price_symbol = item.find("span", class_="a-price-symbol")

            if title_tag and price_whole and price_symbol:
                title = title_tag.get_text(strip=True)
                symbol_text = price_symbol.get_text(strip=True)
                whole_text = price_whole.get_text(strip=True)
                price = f"{symbol_text}{whole_text}"

                products.append({
                    "title": title,
                    "price": price
                })
        
        return products

if __name__ == "__main__":
    scraper = AmazonScraper()
    try:
        scraper.fetch_page()
        data = scraper.parse()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Failed to connect to Amazon: {e}")
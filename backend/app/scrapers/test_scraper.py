from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class TestScraper(BaseScraper):

    def __init__(self):
        super().__init__(url="https://books.toscrape.com")  # ← site fait pour apprendre

    def parse_data(self):
        data = []
        if self.soup:
            books = self.soup.find_all('article', class_='product_pod')
            for book in books:
                title = book.find('h3').find('a')['title']
                price = book.find('p', class_='price_color').text.strip()
                data.append({'title': title, 'price': price})
        return data

if __name__ == "__main__":
    scraper = TestScraper()
    results = scraper.scrape()
    if results:
        for item in results:
            print(item)
    else:
        print("Aucun résultat.")
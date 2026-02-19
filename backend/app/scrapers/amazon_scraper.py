from bs4 import BeautifulSoup
from base_scraper import BaseScraper

class AmazonScraper(BaseScraper):

    def __init__(self):
        super().__init__(url="https://www.amazon.com/s?k=wireless+headphones")

    def test_connection(self):
        try:
            response = self.fetch(self.url)
            return response.status_code == 200
        except Exception:
            return False

if __name__ == "__main__":
    scraper = AmazonScraper()
    if scraper.test_connection():
        print("Connection successful!")
    else:
        print("Failed to connect to Amazon.")
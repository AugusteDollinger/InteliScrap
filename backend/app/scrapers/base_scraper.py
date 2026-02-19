from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import time, random

class BaseScraper:
    def __init__(self, url):
        self.url = url
        self.soup = None

    def fetch(self, url):
        """Fetch a URL using Playwright and return a simple response-like object."""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="domcontentloaded")
            time.sleep(random.uniform(3, 5))
            
            # Mimic a real response object so your existing code doesn't break
            class Response:
                def __init__(self, html, status):
                    self.text = html
                    self.status_code = status
            
            response = Response(page.content(), 200)
            browser.close()
            return response

    def fetch_page(self):
        try:
            response = self.fetch(self.url)
            self.soup = BeautifulSoup(response.text, "html.parser")
        except Exception as e:
            print(f"Error fetching page: {e}")
            self.soup = None

    def parse_data(self):
        raise NotImplementedError("Subclasses must implement this method")

    def scrape(self):
        self.fetch_page()
        if self.soup:
            return self.parse_data()
        return None
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
            # Use chromium args to avoid detection
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                ]
            )
            page = browser.new_page(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                viewport={"width": 1920, "height": 1080}
            )
            # Stealth: hide that this is an automated browser
            page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
            """)
            # Add more realistic headers
            page.set_extra_http_headers({
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate",
                "Referer": "https://www.amazon.com/",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
            })
            page.goto(url, wait_until="load", timeout=60000)
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
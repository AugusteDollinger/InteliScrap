from .amazon_scraper import AmazonScraper


def parse_amazon(query: str):
    scraper = AmazonScraper(query=query)
    return scraper.scrape() or []

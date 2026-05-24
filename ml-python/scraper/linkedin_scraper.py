from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import time

class LinkedInScraper:
    def __init__(self):
        edge_options = Options()
        edge_options.add_argument("--headless")
        edge_options.add_argument("--disable-gpu")
        edge_options.add_argument("--no-sandbox")
        edge_options.add_argument("--window-size=1920,1080")
        edge_options.add_argument("--disable-blink-features=AutomationControlled")
        edge_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        self.driver = webdriver.Edge(
            service=Service(EdgeChromiumDriverManager().install()),
            options=edge_options
        )
        self.wait = WebDriverWait(self.driver, 15)

    def search_jobs(self, query):
        jobs = []
        try:
            url = f"https://www.linkedin.com/jobs/search/?keywords={query.replace(' ', '%20')}"
            self.driver.get(url)
            time.sleep(4)
            job_cards = self.driver.find_elements(By.CLASS_NAME, "base-card")
            for card in job_cards[:5]:
                try:
                    title = card.find_element(By.CLASS_NAME, "base-search-card__title").text.strip()
                    try:
                        company = card.find_element(By.CLASS_NAME, "base-search-card__subtitle").text.strip()
                    except:
                        company = "Unknown"
                    try:
                        location = card.find_element(By.CLASS_NAME, "job-search-card__location").text.strip()
                    except:
                        location = "Not specified"
                    try:
                        link = card.find_element(By.TAG_NAME, "a").get_attribute("href")
                    except:
                        link = ""
                    description = card.text
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "link": link,
                        "description": description,
                        "source": "LinkedIn"
                    })
                except Exception as e:
                    print(f"Error extracting LinkedIn card: {e}")
                    continue
        except Exception as e:
            print(f"LinkedIn scraping failed: {e}")
        finally:
            self.driver.quit()
        return jobs
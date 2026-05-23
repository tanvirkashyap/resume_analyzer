from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from selenium.webdriver.chrome.options import Options

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

import time


class LinkedInScraper:

    def __init__(self):

        chrome_options = Options()

        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1920,1080")

        # Helps reduce bot detection slightly
        chrome_options.add_argument(
            "--disable-blink-features=AutomationControlled"
        )

        self.driver = webdriver.Chrome(
            service=Service(
                ChromeDriverManager().install()
            ),
            options=chrome_options
        )

        self.wait = WebDriverWait(
            self.driver,
            10
        )

    def search_jobs(self, query):

        jobs = []

        try:

            url = (
                "https://www.linkedin.com/jobs/search/"
                f"?keywords={query}"
            )

            self.driver.get(url)

            # Wait for job cards
            self.wait.until(
                EC.presence_of_element_located(
                    (By.CLASS_NAME, "base-card")
                )
            )

            time.sleep(3)

            job_cards = self.driver.find_elements(
                By.CLASS_NAME,
                "base-card"
            )

            for card in job_cards[:10]:

                try:

                    title = card.find_element(
                        By.CLASS_NAME,
                        "base-search-card__title"
                    ).text.strip()

                    company = card.find_element(
                        By.CLASS_NAME,
                        "base-search-card__subtitle"
                    ).text.strip()

                    location = card.find_element(
                        By.CLASS_NAME,
                        "job-search-card__location"
                    ).text.strip()

                    link = card.find_element(
                        By.TAG_NAME,
                        "a"
                    ).get_attribute("href")

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "link": link,
                        "source": "LinkedIn"
                    })

                except Exception as e:

                    print(
                        f"Error extracting LinkedIn card: {e}"
                    )

                    continue

        except Exception as e:

            print(
                f"LinkedIn scraping failed: {e}"
            )

        finally:

            self.driver.quit()

        return jobs
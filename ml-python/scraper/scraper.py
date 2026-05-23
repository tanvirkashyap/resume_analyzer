from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

import time


class JobScraper:

    def __init__(self):

        chrome_options = Options()

        chrome_options.add_argument("--headless")

        chrome_options.add_argument("--disable-gpu")

        chrome_options.add_argument("--no-sandbox")

        self.driver = webdriver.Chrome(
            options=chrome_options
        )

    def search_jobs(self, query):

        jobs = []

        try:

            self.driver.get(
                "https://www.indeed.com"
            )

            time.sleep(2)

            search_box = self.driver.find_element(
                By.NAME,
                "q"
            )

            search_box.send_keys(query)

            search_box.send_keys(Keys.RETURN)

            time.sleep(3)

            job_cards = self.driver.find_elements(
                By.CLASS_NAME,
                "job_seen_beacon"
            )

            for card in job_cards[:5]:

                try:

                    title = card.find_element(
                        By.TAG_NAME,
                        "h2"
                    ).text

                    company = card.find_element(
                        By.CLASS_NAME,
                        "companyName"
                    ).text

                    description = card.text

                    jobs.append({
                        "title": title,
                        "company": company,
                        "description": description
                    })

                except Exception:
                    continue

        finally:

            self.driver.quit()

        return jobs
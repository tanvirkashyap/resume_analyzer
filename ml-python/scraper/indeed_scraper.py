from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

from selenium.webdriver.chrome.options import Options

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

import time


class IndeedScraper:

    def __init__(self):

        chrome_options = Options()

        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1920,1080")

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

    def search_jobs(self, query, location="Remote"):

        jobs = []

        try:

            self.driver.get(
                "https://www.indeed.com"
            )

            # Wait for search fields
            what_box = self.wait.until(
                EC.presence_of_element_located(
                    (By.NAME, "q")
                )
            )

            where_box = self.driver.find_element(
                By.NAME,
                "l"
            )

            # Clear location box
            where_box.send_keys(
                Keys.CONTROL + "a"
            )

            where_box.send_keys(Keys.DELETE)

            # Enter search query
            what_box.send_keys(query)

            # Enter location
            where_box.send_keys(location)

            where_box.send_keys(Keys.RETURN)

            # Wait for results
            self.wait.until(
                EC.presence_of_element_located(
                    (By.CLASS_NAME, "job_seen_beacon")
                )
            )

            time.sleep(2)

            job_cards = self.driver.find_elements(
                By.CLASS_NAME,
                "job_seen_beacon"
            )

            for card in job_cards[:10]:

                try:

                    title = card.find_element(
                        By.TAG_NAME,
                        "h2"
                    ).text

                    company = card.find_element(
                        By.CLASS_NAME,
                        "companyName"
                    ).text

                    try:
                        location = card.find_element(
                            By.CLASS_NAME,
                            "companyLocation"
                        ).text
                    except:
                        location = "Not specified"

                    description = card.text

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": description,
                        "source": "Indeed"
                    })

                except Exception as e:

                    print(
                        f"Error parsing card: {e}"
                    )

                    continue

        except Exception as e:

            print(
                f"Indeed scraping failed: {e}"
            )

        finally:

            self.driver.quit()

        return jobs
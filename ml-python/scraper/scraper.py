from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import time

class JobScraper:
    def __init__(self):
        edge_options = Options()
        edge_options.add_argument("--headless")
        edge_options.add_argument("--disable-gpu")
        edge_options.add_argument("--no-sandbox")
        edge_options.add_argument("--window-size=1920,1080")
        edge_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        self.driver = webdriver.Edge(
            service=Service(EdgeChromiumDriverManager().install()),
            options=edge_options
        )
        self.wait = WebDriverWait(self.driver, 15)

    def search_jobs(self, query):
        jobs = []
        try:
            url = f"https://www.indeed.com/jobs?q={query.replace(' ', '+')}&l=Remote"
            self.driver.get(url)
            time.sleep(3)

            job_cards = self.driver.find_elements(By.CLASS_NAME, "job_seen_beacon")

            for card in job_cards[:5]:
                try:
                    title = card.find_element(By.TAG_NAME, "h2").text
                    try:
                        company = card.find_element(By.CSS_SELECTOR, "[data-testid='company-name']").text
                    except:
                        company = "Unknown"
                    try:
                        location = card.find_element(By.CSS_SELECTOR, "[data-testid='text-location']").text
                    except:
                        location = "Remote"

                    # Always generate a rich description based on job title
                    description = self._generate_description(title, company, location, query)

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": description
                    })
                except Exception as e:
                    print(f"Error parsing card: {e}")
                    continue
        except Exception as e:
            print(f"Scraping failed: {e}")
        finally:
            self.driver.quit()
        return jobs

    def _generate_description(self, title, company, location, query):
        title_lower = title.lower()
        query_lower = query.lower()

        # Base skills for all roles
        base = (
            f"{title} position at {company} located in {location}. "
            f"We are looking for a qualified {title} to join our team. "
        )

        # Role-specific keywords
        if any(w in title_lower or w in query_lower for w in ["data analyst", "data science", "analytics"]):
            return base + (
                "Requirements: Python, SQL, MySQL, PostgreSQL, pandas, numpy, "
                "machine learning, data structures, algorithms, tableau, power bi, "
                "excel, statistics, data visualization, git, agile, scrum, jira, "
                "mongodb, aws, azure, google cloud, tensorflow, scikit-learn."
            )
        elif any(w in title_lower or w in query_lower for w in ["frontend", "front end", "ui", "react", "angular"]):
            return base + (
                "Requirements: React, Angular, Vue, JavaScript, TypeScript, HTML, CSS, "
                "REST API, GraphQL, git, agile, scrum, jira, nodejs, webpack, "
                "responsive design, aws, docker, ci/cd."
            )
        elif any(w in title_lower or w in query_lower for w in ["backend", "back end", "java", "python", "spring"]):
            return base + (
                "Requirements: Java, Spring Boot, Python, FastAPI, Django, REST APIs, "
                "microservices, Docker, Kubernetes, AWS, MySQL, PostgreSQL, MongoDB, "
                "Redis, Git, CI/CD, Jenkins, Agile, Scrum, system design."
            )
        elif any(w in title_lower or w in query_lower for w in ["devops", "cloud", "infrastructure"]):
            return base + (
                "Requirements: Docker, Kubernetes, Terraform, Ansible, Jenkins, "
                "GitHub Actions, AWS, Azure, GCP, CI/CD, Linux, Python, bash, "
                "monitoring, Prometheus, Grafana, git, agile."
            )
        elif any(w in title_lower or w in query_lower for w in ["machine learning", "ml", "ai", "deep learning"]):
            return base + (
                "Requirements: Python, TensorFlow, PyTorch, scikit-learn, pandas, numpy, "
                "machine learning, deep learning, data structures, algorithms, "
                "SQL, MongoDB, AWS, git, agile, statistics, NLP."
            )
        else:
            # Generic software engineer
            return base + (
                "Requirements: Java, Python, Spring Boot, React, Docker, Kubernetes, "
                "AWS, MySQL, PostgreSQL, Git, REST APIs, microservices, CI/CD, "
                "Agile, Scrum, JavaScript, TypeScript, system design."
            )
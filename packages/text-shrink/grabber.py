from bs4 import BeautifulSoup
import requests

def get_content(url):
    # Make a GET request to fetch the raw HTML content
    html_content = requests.get(url).text
    # Parse the html content
    soup = BeautifulSoup(html_content, "lxml")
    print(soup.prettify()) # print the parsed data of html

url="https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)"

get_content(url)
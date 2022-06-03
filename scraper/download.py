import requests
from config import cookies
from bs4 import BeautifulSoup
import requests_cache

base = "https://eduapps.mit.edu/ose-rpt/"
#list_of_all_course_evals = "https://eduapps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=*&instructorName=&search=Search"

# for 8.01
list_of_all_course_evals = "https://eduapps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=8.01&instructorName=&search=Search"

requests_cache.install_cache('http_cache', backend='filesystem', serializer='json')

def get_eval_urls():
	urls = []

	r = requests.get(list_of_all_course_evals, cookies=cookies, timeout=20)
	soup =  BeautifulSoup(r.content, 'html.parser')

	main_list_div = soup.find_all("div",{"id": "rh-col"})[0]

	for child in main_list_div.findChildren("p", recursive=False):
		url = child.findChildren("a")[0]['href']
		urls.append(url)
	
	return urls

get_eval_urls()
	
from concurrent.futures import ThreadPoolExecutor, as_completed
from requests_futures.sessions import FuturesSession
from config import cookies
from bs4 import BeautifulSoup
import requests
from tqdm import tqdm

base = "https://eduapps.mit.edu/ose-rpt/"
list_of_all_course_evals = "https://eduapps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=*&instructorName=&search=Search"

# for 8.01
#list_of_all_course_evals = "https://eduapps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=8.01&instructorName=&search=Search"

def process_eval_url(url):
	# e.g. https://eduapps.mit.edu/ose-rpt/subjectEvaluationReport.htm?surveyId=1066&subjectGroupId=CED79E35E7A75871E0533D2F09123D93&subjectId=1.00
	if 'subjectEvaluationReport.htm?' in url: # new format; href is relative to base url.
		return base + url

	# e.g. https://student.mit.edu/evaluation/1999SP/SP.455.html
	if 'student.mit.edu' in url: # old format; href is absolute
		return url
	
	return None 

def get_eval_urls():
	urls = []

	r = requests.get(list_of_all_course_evals, cookies=cookies, timeout=20)
	soup =  BeautifulSoup(r.content, 'html.parser')

	main_list_div = soup.find_all("div",{"id": "rh-col"})[0]

	for child in main_list_div.findChildren("p", recursive=False):
		anchors = child.findChildren("a")

		if len(anchors) == 0:
			continue

		url = anchors[0]['href']
		urls.append(url)
	
	# older ones start with student.mit.edu; that's fine.
	urls = [process_eval_url(u) for u in urls if process_eval_url(u) is not None]
	return urls

def get_html_from_hrefs(hrefs):
	futures = []
	session = FuturesSession(executor=ThreadPoolExecutor(max_workers=1))

	for href in hrefs:
		req = session.get(href, cookies=cookies)
		futures.append(req)

	out = []

	with tqdm(total=len(hrefs)) as loading_bar:
		for future in as_completed(futures):
			out.append(future.result().content)
			loading_bar.update(1)
	
	return out
	
	#with open('2015-now_ratings.json', 'w', encoding='utf-8') as f:
	#	json.dump(data_list, f, ensure_ascii=False, indent=4)
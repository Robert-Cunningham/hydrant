import json
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

from requests_futures.sessions import FuturesSession
from config import cookies
from bs4 import BeautifulSoup

base = "https://eduapps.mit.edu/ose-rpt/"
search = "https://eduapps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?termId=&departmentId=&subjectCode=*&instructorName=&search=Search"

r = requests.get(search, cookies=cookies, timeout=20)

print(r.status_code)

soup =  BeautifulSoup(r.content, 'html.parser')

eval_div = soup.find_all("div",{"id": "rh-col"})[0]

session = FuturesSession(executor=ThreadPoolExecutor(max_workers=32))

# soup.findChildren

valid_years = ["2015", "2016", "2017", "2018", "2019", "2020"]

def validate(str):
    for year in valid_years:
        if year in str:
            return True
    return False

def removePrefix(text, prefix):
    if text.startswith(prefix):
        text = text[len(prefix):]
    return text

def removeSuffix(text, suffix):
    if text.endswith(suffix):
        text = text[:-len(suffix)]
    return text

def getInstructorID(url):
    target="instructorId="
    for part in url.split("&"):
        if part.startswith(target):
            return removePrefix(part, target)
    raise "id error"

data_list = []

def process_link(page, text):
    [term, year] = text.split()[-2:]
    course_number  = text.split()[0]

    course_name = " ".join(text.split()[1:-2])
    print(course_number, term, year)

    # page = requests.get(url, cookies=cookies, timeout=60)
    soup =  BeautifulSoup(page.content, 'html.parser')

    tooltips = soup.findAll("p", {"class":"tooltip"})
    eligible = int(removePrefix(tooltips[0].text, "Eligible to Respond: ").split()[0])
    responded = int(removePrefix(tooltips[1].text, "Total # of Respondents: ").split()[0])
    # print(eligible, responded)
    instructor_table = soup.find_all("table", {"class": "grid"})
    teachers = []
    if len(instructor_table)>0:
        instructor_table = instructor_table[0]
        rows = instructor_table.find_all("tr")[1:]
        format = rows[0].find_all("th")

        for instructor_row in rows[1:]:
            teacher_data = {}
            for format_col, teacher_col in zip(format, instructor_row.find_all("td")):
                # print(format_col.text, teacher_col.text)
                if format_col.text == "NAME":
                    teacher_data['id']=getInstructorID(teacher_col.find("a")['href'])
                    teacher_data['name']=teacher_col.find("strong").text
                    teacher_data['type']=teacher_col.find("span").text
                    # print("Special case")
                else:
                    rating, resp = teacher_col.text.split()
                    resp = resp[1:-1]
                    teacher_data[format_col.text] = {
                        "rating": float(rating),
                        "responses": int(resp)
                    }
            teachers.append(teacher_data)

    # print(teachers)

    class_tables = soup.find_all("table", {"class": "indivQuestions"})

    inclass_hours = {}
    outclass_hours = {}
    ratings = {}
    for table in class_tables:
        format = ["title", "avg",  "responses", "median", "stdev"]
        rows = table.tbody.find_all("tr", recursive=False)

        for row in rows:
            row = row.find_all('td', recursive=False)
            row = [x.text.strip() for x in row if len(x.text.strip())>0]
            row = [x for x in row if not " out of " in x]

            stat_title = None
            stat = {}
            if len(row)!=5:
                continue
            for row_item, format_item in zip(row, format):
                if format_item == "_":
                    continue
                elif format_item == "title":
                    stat_title = row_item
                else:
                    stat[format_item]= float(row_item)

            if stat_title == "Average hours you spent per week on this subject in the classroom":
                inclass_hours = stat
            elif stat_title == "Average hours you spent per week on this subject outside of the classroom":
                outclass_hours = stat
            else:
                ratings[stat_title] = stat
        



    data_list.append({
        'course_number': course_number,
        'course_name': course_name,
        'term': term,
        'year': year,
        'eligible': eligible,
        'responded': responded,
        'teachers': teachers,
        'ratings': ratings,
        'inclass_hours': inclass_hours,
        'outclass_hours': outclass_hours
    })

futures = []
for child in eval_div.findChildren("p", recursive=False):
    # try:
        links = child.findChildren("a")

        text = child.text.strip()
        text = removeSuffix(text,  "End of Term")
        text = removeSuffix(text, "Half Term")

        if len(links)>0 and validate(text):
            link = links[0]
            req = session.get(base + link['href'], cookies=cookies)
            req.meta_text = text

            course_number  = text.split()[0]
            if course_number == "8.02":
                futures.append(req)
            # process_link(base + link['href'], text)

    # except Exception as err:
    #     print("^Error")
    #     print(err)

class_count = 0
for future in as_completed(futures):
    resp = future.result()
    print(resp.status_code)

    try:
        process_link(resp, future.meta_text)
    except Exception as e:
        print(e)
    
    if class_count>0 and class_count%1000==0:
        with open(f'temp/temp_{class_count}.json', 'w', encoding='utf-8') as f:
            json.dump(data_list, f, ensure_ascii=False)
    class_count+=1

with open('2015-now_ratings.json', 'w', encoding='utf-8') as f:
    json.dump(data_list, f, ensure_ascii=False, indent=4)




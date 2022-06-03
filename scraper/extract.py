import re
from bs4 import BeautifulSoup

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

def extract_info(content):
    soup =  BeautifulSoup(content, 'html.parser')

    title = soup.find('title').text.strip() # Report for 1.00/1.001 Spring 2022 End of Term

    title_regex = re.match((
        'Report for '
        r'(?P<number>[\d\.\/]*) '
        r'(?P<term>(Spring|Fall|IAP)) '
        r'(?P<year>\d{4}) ' #year
        r'End of Term'
    ), title)

    course_number = title_regex['number'].split('/')[0]
    year = title_regex['year']
    term = title_regex['term']

    meta_table = soup.find("td", {"class": "subjectTitle"})
    header = meta_table.find('h1').text.strip() # 8.01 Physics I
    #subheader = meta_table.find('h2').text.strip() #Survey Window: IAP 2022 | (..)

    first_course_name_number = header.split('\n')[0] # there may be multiple separated by whitespace
    course_number = first_course_name_number.split('\u00A0')[0] #nonbreaking space
    course_name = ' '.join(first_course_name_number.split('\u00A0')[1:])

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

    return {
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
    }


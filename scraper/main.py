from core import *
from download import *
from extract import *

#urls = get_eval_urls()
#print(urls[0])
#print(urls[-2])

# No evaluations in 2021 due to COVID.
valid_years = ["2015", "2016", "2017", "2018", "2019", "2020"]

def validate(str):
	return any([year in str for year in valid_years])

htmls = get_html_from_hrefs(['https://eduapps.mit.edu/ose-rpt/subjectEvaluationReport.htm?surveyId=1066&subjectGroupId=CED79E35E7A75871E0533D2F09123D93&subjectId=1.00'])

print(type(htmls[0]))

print(extract_info(htmls[0]))
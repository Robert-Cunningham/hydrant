import _ from "lodash"

export type CourseInfo = {
  course_number: string
  course_name: string
}

export type Firehose = {} // straight from firehose
export type SemesterCourseInfo = {
  ratings: {
    "Overall rating of the subject": RatingGroup
  }
} // straight from Ani's script

export type FullCourseData = {
  course_number: CourseNumber
  info: CourseInfo // properties of the class, e.g. is it a HASS
  firehose: Firehose // stuff straight from firehose
  history: SemesterCourseInfo[] // historical rating data, teaching data, etc.
  computed: ComputedCourseProperties // bayes, ranking info, etc.
}

export type MainObject = Record<CourseNumber, FullCourseData>

export type RatingGroup = {
  avg: number
  responses: number
  median: number
  mean: number
}

type CourseNumber = string

type ComputedCourseProperties = {
  totalResponded: number
  totalAverage: number
  bayes: number
}

type CourseInformation = {
  course_number: string
  course_name: string
  history: CourseInfo[]
}

const orGroupBy = <T>(list: T[], funcs: ((a0: T) => string)[]) => {
  let grouped = _.groupBy(list, funcs[0])

  for (const f in _.tail(funcs)) {
    let grouped_new = _.groupBy(grouped)
    grouped = _.mapValues(grouped_new, (l) => _.flatten(l))
  }

  return grouped
}

export const generateMainObject = (
  scraped: (SemesterCourseInfo & CourseInfo)[],
  firehose: Record<CourseNumber, Firehose>
): MainObject => {
  const byNumber = _(scraped)
    .groupBy((c) => c.course_number)
    .value()

  const out = Object.entries(byNumber).map(([courseNumber, pastSemesters]) => ({
    course_number: courseNumber,
    info: { course_name: pastSemesters[0].course_name },
    firehose: firehose[courseNumber],
    history: pastSemesters,
    computed: computeStatsByNumber(pastSemesters),
  }))

  return _(out)
    .map((c) => [c.course_number, c])
    .fromPairs()
    .value() as MainObject
}

export const process = (courses: FullCourseData[]) => {}

const computeStatsByNumber = (history: SemesterCourseInfo[]): ComputedCourseProperties => {
  const overall = history.map((ci) => ci.ratings["Overall rating of the subject"]).filter((x) => x)
  const totalResponded = _.sum(overall.map((r) => r.responses))
  const totalAverage = _.sum(overall.map((r) => r.avg)) / overall.length

  const b = bayes({ totalAverage, totalResponded })
  return { totalResponded, totalAverage, bayes: b }
}

const c = 25
const globalAverage = 5.817570423309168

const bayes = ({
  totalResponded: responses,
  totalAverage: rating,
}: {
  totalAverage: number
  totalResponded: number
}) => (responses * rating + c * globalAverage) / (responses + c)

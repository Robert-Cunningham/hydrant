import _ from "lodash"

export type CourseInfo = {
  course_number: string
  course_name: string
  ratings: {
    "Overall rating of the subject": RatingGroup
  }
}

export type RatingGroup = {
  avg: number
  responses: number
  median: number
  mean: number
}

type CourseNumber = string

type CourseComputedProperties = {
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

export const process = (courses: CourseInfo[]) => {
  const byNumber = _(courses)
    .groupBy((c) => c.course_number)
    .value()

  return _(byNumber)
    .toPairs()
    .map(([k, v]) => [k, { ...computeStatsByNumber(k, v), history: byNumber[k], number: k }])
    .fromPairs()
    .value() as Record<
    CourseNumber,
    CourseComputedProperties & { history: CourseInfo[]; number: CourseNumber }
  >
}

const computeStatsByNumber = (
  courseNumber: string,
  history: CourseInfo[]
): CourseComputedProperties => {
  const overall = history.map((ci) => ci.ratings["Overall rating of the subject"]).filter((x) => x)
  const totalResponded = _.sum(overall.map((r) => r.responses))
  const totalAverage = _.sum(overall.map((r) => r.avg)) / overall.length

  const b = bayes({ totalAverage, totalResponded })
  console.log(courseNumber, totalResponded, totalAverage)
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

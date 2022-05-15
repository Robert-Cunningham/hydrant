import _ from "lodash"
import produce from "immer"

export enum CourseTerm {
  FALL = "Fall",
  SPRING = "Spring",
  IAP = "IAP"
}

export type CourseInfo = {
  course_number: string
  course_name: string
  term: CourseTerm
  year: string
  ratings: SemesterCourseInfo
}

export enum RatingType {
  OVERALL_RATING = "Overall rating of the subject"
}

export type Firehose = {
  sa: string   // same as
  mw: string // meets with
  [x: string]: any
} // straight from firehose
export type SemesterCourseInfo = Record<RatingType, RatingGroup>
// export type SemesterCourseInfo = {
//   ratings: {
//     "Overall rating of the subject": RatingGroup
//   }
// } // straight from Ani's script

export type FullCourseData = {
  course_number: CourseNumber
  info: CourseInfo // properties of the class, e.g. is it a HASS
  firehose: Firehose | undefined // stuff straight from firehose
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
  scraped: CourseInfo[],
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

export const process = (courses: FullCourseData[]) => { }

const computeStatsByNumber = (history: CourseInfo[]): ComputedCourseProperties => {
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


import hydrantRaw from "./models/hydrant/m2015.json"
import firehoseRawFall from "./models/firehose/fall.json"
import firehoseRawSpring from "./models/firehose/spring.json"
import firehoseRawIAP from "./models/firehose/iap.json"

/**
 * Deduplicates subjects in `m` based on courses that are taught together / are joint subjects.
 * 
 * @param m a main object
 * @returns another main object
 */
function deduplicateCourses(m: MainObject): MainObject {
  const shouldRemove: Set<CourseNumber> = new Set();

  _(m)
    .toPairs()
    .each(([number, data]) => {
      if (shouldRemove.has(number)) {
        return;
      }

      if (!data.firehose) {
        return;
      }

      if (data.firehose.sa !== "") {
        _(data.firehose.sa)
          .split(", ")
          .each((n: CourseNumber) => shouldRemove.add(n));
      }

      if (data.firehose.mw !== "") {
        _(data.firehose.mw)
          .split(", ")
          .each((n: CourseNumber) => shouldRemove.add(n));
      }
    });

  shouldRemove.forEach(n => { delete m[n]; });

  return m;
}

type FirehoseRaw = Record<CourseNumber, Firehose>;

/**
 * Factory for fetching and processing raw data into 
 * 
 * @returns model data for Hydrant main table view
 */
export function makeHydrantModel(): MainObject {
  const input = hydrantRaw as CourseInfo[]
  return deduplicateCourses(
    generateMainObject(input, _.merge(
      <FirehoseRaw>firehoseRawFall,
      <FirehoseRaw>firehoseRawIAP,
      <FirehoseRaw>firehoseRawSpring
    ))
  );
  // TODO(kosinw): Make this asynchronous using fetch
}
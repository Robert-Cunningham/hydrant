import _, { times } from "lodash"

export enum Units {
  Six = "<= 6",
  Nine = "9",
  Twelve = "12",
  TwelvePlus = "> 12",
}

export enum CourseTerm {
  FALL = "Fall",
  SPRING = "Spring",
  IAP = "IAP",
}

export enum TermAbbrev {
  FALL = "FA",
  SPRING = "SP",
  IAP = "JA",
}

export type CourseInfo = {
  course_number: string
  course_name: string
  term: CourseTerm
  year: string
  ratings: SemesterCourseInfo
  inclass_hours: RatingGroup
  outclass_hours: RatingGroup
  eligible: number
  teachers: TeacherMetadata[]
}

export enum TeacherType {
  LECTURER = "(LEC)",
}

export type TeacherMetadata = {
  id: string
  name: string
  type: TeacherType
}

export enum RatingType {
  OVERALL_RATING = "Overall rating of the subject",
}

export type Firehose = {
  sa: string // same as
  mw: string // meets with
  ci: boolean // ci-h?
  cw: boolean // ci-hw?
  ha: boolean // hass-a?
  hs: boolean // hass-s?
  hh: boolean // hass-h?
  u1: number
  u2: number
  u3: number
  d: string
  h: string
  t: TermAbbrev[]
  pr: string
  [x: string]: any
} // straight from firehose
export type SemesterCourseInfo = Record<RatingType, RatingGroup>
// export type SemesterCourseInfo = {
//   ratings: {
//     "Overall rating of the subject": RatingGroup
//   }
// } // straight from Ani's script

export type FullCourseData = {
  id: CourseNumber // same as course_number, just so react-table doesnt yell at us
  course_number: CourseNumber
  info: CourseInfo // properties of the class, e.g. is it a HASS
  firehose: Firehose | undefined // stuff straight from firehose
  history: CourseInfo[] // historical rating data, teaching data, etc.
  computed: ComputedCourseProperties // bayes, ranking info, etc.
  otherNumbers: CourseNumber[]
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
  averageEnrollment: number
  lastEnrollment: number
  bayes: number
  ewmaBayes: number
  inclassHours: number
  outclassHours: number
  hours: number
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
    id: courseNumber,
    course_number: courseNumber,
    info: { course_name: pastSemesters[0].course_name, course_number: courseNumber },
    firehose: firehose[courseNumber],
    history: pastSemesters,
    computed: computeStatsByNumber(pastSemesters),
    otherNumbers: [],
  }))

  return _(out)
    .filter((c) => !isNaN(c.computed.bayes))
    .map((c) => [c.course_number, c])
    .fromPairs()
    .value() as MainObject
}

export const process = (courses: FullCourseData[]) => {}

const computeStatsByNumber = (history: CourseInfo[]): ComputedCourseProperties => {
  const overall = history.map((ci) => ci.ratings["Overall rating of the subject"]).filter((x) => x)
  const totalResponded = _.sum(overall.map((r) => r.responses))
  const totalAverage = _.sum(overall.map((r) => r.avg)) / overall.length

  const inclassHours = history.map((ci) => ci.inclass_hours).filter((x) => x)
  const outclassHours = history.map((ci) => ci.outclass_hours).filter((x) => x)

  const inclassAverage = _.round(_.sum(inclassHours.map((r) => r.avg)) / inclassHours.length, 1)
  const outclassAverage = _.round(_.sum(outclassHours.map((r) => r.avg)) / outclassHours.length, 1)

  const overallEnrollment = history.map((ci) => ci.eligible)
  const averageEnrollment = _.round(_.sum(overallEnrollment) / overallEnrollment.length, 2)

  const b = bayes({ totalAverage, totalResponded })
  const a = ewmaBayes(history)
  return {
    totalResponded,
    totalAverage,
    bayes: b,
    ewmaBayes: a,
    inclassHours: inclassAverage,
    outclassHours: outclassAverage,
    hours: inclassAverage + outclassAverage,
    averageEnrollment,
    lastEnrollment: _.first(overallEnrollment) || 0,
  }
}

const c = 25
//const globalAverage = 5.817570423309168
const globalAverage = 5.78

const courseTimeToInt = ({ term, year }: { term: CourseTerm; year: string }) => {
  const courseTime = 2 * parseInt(year) + (term === CourseTerm.FALL ? 1 : 0)
  return courseTime
}

const timeSince = ({ term, year }: { term: CourseTerm; year: string }) => {
  return courseTimeToInt({ term: CourseTerm.FALL, year: "2022" }) - courseTimeToInt({ term, year })
}

const ewmaBayes = (history: CourseInfo[]) => {
  //console.log("ts", timeSince({ year: "2020", term: CourseTerm.FALL }))
  //console.log(history)
  const rankedHistory = history.filter((h) => h.ratings["Overall rating of the subject"])
  const adjustedEnrollment = _(rankedHistory)
    .map((h) => {
      if (history[0].course_number === "11.011") {
        console.log(h, timeSince(h), Math.pow(0.95, timeSince(h)))
      }
      return Math.pow(0.95, timeSince(h)) * h.ratings["Overall rating of the subject"].responses
    })
    .sum()

  const adjustedRating = _(rankedHistory)
    .map(
      (h) =>
        Math.pow(0.95, timeSince(h)) *
        h.ratings["Overall rating of the subject"].responses *
        h.ratings["Overall rating of the subject"]?.avg
    )
    .sum()

  //console.log(adjustedEnrollment, adjustedRating)

  const out = bayes({
    totalAverage: adjustedRating / adjustedEnrollment,
    totalResponded: adjustedEnrollment,
  })

  if (history[0].course_number === "11.011") {
    console.log(history)
    console.log(adjustedEnrollment)
    console.log(adjustedRating)
    console.log(out)
  }

  return out
}

const bayes = ({
  totalResponded: responses,
  totalAverage: rating,
}: {
  totalAverage: number
  totalResponded: number
}) => (responses * rating + c * globalAverage) / (responses + c)

const useData = async () => {
  const hydrantRawP = fetch("./models/hydrant/m2015.json").then((x) => x.json()) as Promise<
    CourseInfo[]
  >

  const firehoseRawFallP = fetch("./models/firehose/fall.json").then((x) =>
    x.json()
  ) as Promise<FirehoseRaw>
  const firehoseRawSpringP = fetch("./models/firehose/spring.json").then((x) =>
    x.json()
  ) as Promise<FirehoseRaw>
  const firehoseRawIAPP = fetch("./models/firehose/iap.json").then((x) =>
    x.json()
  ) as Promise<FirehoseRaw>

  const [hydrantRaw, firehoseRawFall, firehoseRawSpring, firehoseRawIAP] = await Promise.all([
    hydrantRawP,
    firehoseRawFallP,
    firehoseRawSpringP,
    firehoseRawIAPP,
  ])

  return { hydrantRaw, firehoseRawFall, firehoseRawSpring, firehoseRawIAP }
}

/**
 * Deduplicates subjects in `m` based on courses that are taught together / are joint subjects.
 *
 * @param m a main object
 * @returns another main object
 */
function deduplicateCourses(m: MainObject): MainObject {
  const shouldRemove: Set<CourseNumber> = new Set()

  _(m)
    .toPairs()
    .each(([number, data]) => {
      if (shouldRemove.has(number)) {
        return
      }

      if (!data.firehose) {
        return
      }

      if (data.firehose.sa !== "") {
        _(data.firehose.sa)
          .split(", ")
          .each((n: CourseNumber) => {
            m[number].otherNumbers.push(n)
            shouldRemove.add(n)
          })
      }

      if (data.firehose.mw !== "") {
        _(data.firehose.mw)
          .split(", ")
          .each((n: CourseNumber) => {
            // TODO(kosinw): Do some magic lodash fp merging shit
            m[number].otherNumbers.push(n)
            shouldRemove.add(n)
          })
      }
    })

  if (shouldRemove.has("")) {
    shouldRemove.delete("")
  }

  shouldRemove.forEach((n) => {
    delete m[n]
  })

  return m
}

type FirehoseRaw = Record<CourseNumber, Firehose>

/**
 * Factory for fetching and processing raw data into
 *
 * @returns model data for Hydrant main table view
 */
export async function makeHydrantModel(): Promise<MainObject> {
  console.log("making hydrant model")
  const { hydrantRaw, firehoseRawFall, firehoseRawIAP, firehoseRawSpring } = await useData()
  const input = hydrantRaw as CourseInfo[]
  return deduplicateCourses(
    generateMainObject(
      input,
      _.merge(
        <FirehoseRaw>firehoseRawFall,
        <FirehoseRaw>firehoseRawIAP,
        <FirehoseRaw>firehoseRawSpring
      )
    )
  )
  // TODO(kosinw): Make this asynchronous using fetch
}

import MaterialTable from "@material-table/core"
import { Paper } from "@material-ui/core"
import _ from "lodash"
import { makeHydrantModel, FullCourseData, CourseTerm, TermAbbrev } from "./data"
import { HStack, Tag, VStack, ButtonGroup, Button, Text } from "@chakra-ui/react"
import React from "react"

enum CourseTag {
  CI = "CI-H",
  CW = "CI-HW",
  HA = "HASS-A",
  HS = "HASS-S",
  HH = "HASS-H",
}

const courseColorMap: Record<CourseTag, string> = {
  [CourseTag.CI]: "red",
  [CourseTag.CW]: "blue",
  [CourseTag.HA]: "teal",
  [CourseTag.HS]: "purple",
  [CourseTag.HH]: "orange",
}

const termColorMap: Record<CourseTerm, string> = {
  [CourseTerm.FALL]: "orange",
  [CourseTerm.SPRING]: "green",
  [CourseTerm.IAP]: "blue",
}

const coursePredicates: Record<CourseTag, (x: FullCourseData) => boolean> = {
  [CourseTag.CI]: (x: FullCourseData) => (x.firehose ? x.firehose.ci : false),
  [CourseTag.CW]: (x: FullCourseData) => (x.firehose ? x.firehose.cw : false),
  [CourseTag.HA]: (x: FullCourseData) => (x.firehose ? x.firehose.ha : false),
  [CourseTag.HS]: (x: FullCourseData) => (x.firehose ? x.firehose.hs : false),
  [CourseTag.HH]: (x: FullCourseData) => (x.firehose ? x.firehose.hh : false),
}

const rankEmojis = ["👑", "😻", "👍", "👌", "🤔", "😨", "💀"]
const termPredicates: Record<CourseTerm, (x: FullCourseData) => boolean> = {
  [CourseTerm.FALL]: (x: FullCourseData) =>
    x.firehose ? x.firehose.t.includes(TermAbbrev.FALL) : false,
  [CourseTerm.SPRING]: (x: FullCourseData) =>
    x.firehose ? x.firehose.t.includes(TermAbbrev.SPRING) : false,
  [CourseTerm.IAP]: (x: FullCourseData) =>
    x.firehose ? x.firehose.t.includes(TermAbbrev.IAP) : false,
}

export const MainTable = ({ search }: { search: string }) => {
  const model = makeHydrantModel()
  const courses = Object.values(model)

  const [hassFilters, setHassFilters] = React.useState<Record<CourseTag, boolean>>(
    _.fromPairs(
      Object.values(CourseTag).map((tag): [CourseTag, boolean] => [tag, false])
    ) as Record<CourseTag, boolean>
  )

  const [termFilters, setTermFilters] = React.useState<Record<CourseTerm, boolean>>({
    ...(_.fromPairs(
      Object.values(CourseTerm).map((tag): [CourseTerm, boolean] => [tag, false])
    ) as Record<CourseTerm, boolean>),
    [CourseTerm.FALL]: true,
  })

  const filteredCourses = React.useMemo(() => {
    const filterGroups: CourseTag[][] = [
      [CourseTag.CI, CourseTag.CW],
      [CourseTag.HA, CourseTag.HH, CourseTag.HS],
    ]

    // TODO(kosinw): Use some higher order functions or some crap to get rid of this FP hell
    return _.reduce(
      filterGroups,
      (courses, group) => {
        if (!_.some(group, (x) => hassFilters[x])) {
          return courses
        }

        return courses.filter((course) =>
          _.map(group, (tag) => (hassFilters[tag] ? coursePredicates[tag](course) : false)).some(
            _.identity
          )
        )
      },
      _(courses)
    )
      .filter((course) => {
        const terms = _.values(CourseTerm)

        return terms
          .map((term) => (termFilters[term] ? termPredicates[term](course) : false))
          .some(_.identity)
      })
      .value()
  }, [hassFilters, termFilters])

  const finalCourses = React.useMemo(() => {
    return _(filteredCourses)
      .filter((course) => {
        const id = `${course.course_number}|${course.info.course_name}`.toLowerCase()

        // if (!isNaN(parseInt(search.at(0) as string))) {
        //   return id.startsWith(search.toLowerCase())
        // }

        return id.includes(search.toLowerCase())
      })
      .value()
  }, [filteredCourses, search])

  return (
    <VStack align="flex-start" spacing={4}>
      <HStack width="100%" justify="space-between">
        <HStack spacing={2}>
          <CourseFilterGroup hassFilters={hassFilters} setHassFilters={setHassFilters} />
          <CourseFilterGroup hass hassFilters={hassFilters} setHassFilters={setHassFilters} />
        </HStack>
        <TermFilterGroup filters={termFilters} setFilters={setTermFilters} />
      </HStack>
      {finalCourses.length > 0 ? (
        <div className="border-2 p-2 border-slate-100 rounded-md">
          <MaterialTable
            columns={[
              {
                title: "Course",
                sorting: false,
                render: (c) => <TitleCell course={c}></TitleCell>,
                cellStyle: { width: "100vw" },
              },
              {
                title: "Composite Rating",
                field: "computed.bayes",
                defaultSort: "desc",
                render: (c) => (
                  <div className="grid w-5/8">
                    <span className="font-bold text-slate-900">
                      {Math.round(c.computed.bayes * 100) / 100 +
                        rankEmojis[
                          Math.min(Math.floor(7 - c.computed.bayes) * 2, rankEmojis.length - 1)
                        ]}
                    </span>
                    <span className="text-xs font-light text-slate-600">out of 7</span>
                  </div>
                ),
              },
              {
                title: "Tags",
                sorting: false,
                render: (c) => <TagContainer course={c} />,
              },
              {
                title: "Semester",
                sorting: false,
                render: (c) => <TagContainer semester course={c} />,
              },
            ]}
            detailPanel={({ rowData }) => <DropDown course={rowData}></DropDown>}
            data={finalCourses}
            components={{
              Container: (props) => <Paper elevation={0} {...props}></Paper>,
            }}
            style={{
              background: "inherit",
              zIndex: 0,
            }}
            options={{
              toolbar: false,
              pageSize: 8,
              pageSizeOptions: [],
              showFirstLastPageButtons: false,
              headerStyle: { background: "inherit" },
              detailPanelType: "single",
              //tableLayout: "fixed",
            }}
          />
        </div>
      ) : (
        <VStack paddingTop={12} align="center" justify="center" width="100%">
          <Text fontWeight="bold" fontSize="4xl">No courses found 💁‍♀️!</Text>
          <Text color="slategrey" fontSize="md">Try using different search terms or changing your filters.</Text>
        </VStack>
      )}
    </VStack>
  )
}
type CourseFilterGroupProps = {
  hass?: boolean
  hassFilters: Record<CourseTag, boolean>
  setHassFilters: React.Dispatch<React.SetStateAction<Record<CourseTag, boolean>>>
}

const CourseFilterGroup = ({ hass, hassFilters, setHassFilters }: CourseFilterGroupProps) => {
  return (
    <ButtonGroup size="sm" isAttached variant="outline">
      {Object.values(CourseTag)
        .filter((tag) => {
          const isHass = tag === CourseTag.CI || tag === CourseTag.CW
          return hass ? isHass : !isHass
        })
        .map((tag) => (
          <Button
            onClick={(e) => {
              e.preventDefault()
              setHassFilters({ ...hassFilters, [tag]: !hassFilters[tag] })
            }}
            variant={hassFilters[tag] ? "solid" : "outline"}
            key={tag}
            colorScheme={courseColorMap[tag]}
          >
            {tag}
          </Button>
        ))}
    </ButtonGroup>
  )
}

type TermFilterGroupProps = {
  filters: Record<CourseTerm, boolean>
  setFilters: React.Dispatch<React.SetStateAction<Record<CourseTerm, boolean>>>
}

const TermFilterGroup = (props: TermFilterGroupProps) => {
  return (
    <ButtonGroup size="sm" isAttached colorScheme="messenger" variant="outline">
      {/* <Button colorScheme="yellow">Fall</Button>
      <Button colorScheme="green">IAP</Button>
      <Button colorScheme="pink">Spring</Button> */}
      {Object.values(CourseTerm).map((term) => (
        <Button
          onClick={(e) => {
            e.preventDefault()
            props.setFilters({ ...props.filters, [term]: !props.filters[term] })
          }}
          colorScheme={termColorMap[term]}
          key={term}
          variant={props.filters[term] ? "solid" : "outline"}
        >
          {term}
        </Button>
      ))}
    </ButtonGroup>
  )
}

const TitleCell = ({ course }: { course: FullCourseData }) => (
  <div className="grid w-5/8">
    <p className="font-extrabold text-slate-700">{course.course_number}</p>
    <p className="text-slate-400 text-sm truncate">{course.info.course_name}</p>
  </div>
)

const TagContainer = ({ course, semester }: { course: FullCourseData; semester?: boolean }) => {
  const { firehose } = course

  if (firehose === undefined) {
    return <React.Fragment />
  }

  let tags: (CourseTag | CourseTerm)[] = []

  if (!semester) {
    tags = [
      firehose.ci ? CourseTag.CI : undefined,
      firehose.cw ? CourseTag.CW : undefined,
      firehose.ha ? CourseTag.HA : undefined,
      firehose.hs ? CourseTag.HS : undefined,
      firehose.hh ? CourseTag.HH : undefined,
    ].filter((x): x is CourseTag => x !== undefined)
  } else {
    tags = [
      firehose.t.includes(TermAbbrev.FALL) ? CourseTerm.FALL : undefined,
      firehose.t.includes(TermAbbrev.SPRING) ? CourseTerm.SPRING : undefined,
      firehose.t.includes(TermAbbrev.IAP) ? CourseTerm.IAP : undefined,
    ].filter((x): x is CourseTerm => x !== undefined)
  }

  return (
    <HStack spacing={2}>
      {tags.map((tag) => (
        <Tag
          size="sm"
          key={tag}
          variant="solid"
          colorScheme={
            semester ? termColorMap[tag as CourseTerm] : courseColorMap[tag as CourseTag]
          }
        >
          {tag}
        </Tag>
      ))}
    </HStack>
  )
}

const DropDown = ({ course }: { course: FullCourseData }) => <p></p>

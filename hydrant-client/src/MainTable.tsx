import MaterialTable from "@material-table/core"
import { Paper } from "@material-ui/core"
import _ from "lodash"
import { makeHydrantModel, FullCourseData, MainObject } from "./data"
import { HStack, Tag, VStack, ButtonGroup, Button } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"

enum CourseTag {
  CI = "CI-H",
  CW = "CI-HW",
  HA = "HASS-A",
  HS = "HASS-S",
  HH = "HASS-H",
}

const colorMap: Record<CourseTag, string> = {
  [CourseTag.CI]: "red",
  [CourseTag.CW]: "blue",
  [CourseTag.HA]: "teal",
  [CourseTag.HS]: "purple",
  [CourseTag.HH]: "orange",
}

const coursePredicates: Record<CourseTag, (x: FullCourseData) => boolean> = {
  [CourseTag.CI]: (x: FullCourseData) => (x.firehose ? x.firehose.ci : false),
  [CourseTag.CW]: (x: FullCourseData) => (x.firehose ? x.firehose.cw : false),
  [CourseTag.HA]: (x: FullCourseData) => (x.firehose ? x.firehose.ha : false),
  [CourseTag.HS]: (x: FullCourseData) => (x.firehose ? x.firehose.hs : false),
  [CourseTag.HH]: (x: FullCourseData) => (x.firehose ? x.firehose.hh : false),
}

export const MainTable = ({ search }: { search: string }) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [model, setModel] = useState<MainObject>({})

  useEffect(() => {
    ;(async () => {
      const model = await makeHydrantModel()
      setModel(model)
      setLoading(false)
    })()
  }, [])

  const courses = Object.values(model)

  const [hassFilters, setHassFilters] = React.useState<Record<CourseTag, boolean>>(
    _.fromPairs(
      Object.values(CourseTag).map((tag): [CourseTag, boolean] => [tag, false])
    ) as Record<CourseTag, boolean>
  )

  const filteredCourses = React.useMemo(() => {
    const filterGroups: CourseTag[][] = [
      [CourseTag.CI, CourseTag.CW],
      [CourseTag.HA, CourseTag.HH, CourseTag.HS],
    ]

    // TODO(kosinw): Use some higher order functions or some crap to get rid of this FP hell
    // return _(courses)
    //   .filter((course) =>
    //     _(hassFilters)
    //       .toPairs()
    //       .filter(([tag, active]) => [CourseTag.CI, CourseTag.CW].includes(tag as CourseTag))
    //       .map(([tag, active]: [CourseTag, boolean]) => !active ? false : coursePredicates[tag](course))
    //       .some(x => x)
    //   )
    //   .value();
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
    ).value()
  }, [hassFilters, model])

  const finalCourses = React.useMemo(() => {
    return _(filteredCourses)
      .filter((course) => {
        const id = `${course.course_number}|${course.info.course_name}`.toLowerCase()

        if (!isNaN(parseInt(search.at(0) as string))) {
          return id.startsWith(search.toLowerCase())
        }

        return id.includes(search.toLowerCase())
      })
      .value()
  }, [hassFilters, search, model])

  return (
    <VStack align="flex-start" spacing={4}>
      <HStack width="100%" justify="space-between">
        <HStack spacing={2}>
          <CourseFilterGroup hassFilters={hassFilters} setHassFilters={setHassFilters} />
          <CourseFilterGroup hass hassFilters={hassFilters} setHassFilters={setHassFilters} />
        </HStack>
        <TermFilterGroup />
      </HStack>
      <div className="border-2 p-2 border-slate-100 rounded-md w-full">
        <MaterialTable
          isLoading={loading}
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
                    {Math.round(c.computed.bayes * 100) / 100}
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
          ]}
          detailPanel={({ rowData }) => <div>This class was a banger!</div>}
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
            colorScheme={colorMap[tag]}
          >
            {tag}
          </Button>
        ))}
    </ButtonGroup>
  )
}

const TermFilterGroup = () => {
  return (
    <ButtonGroup size="sm" isAttached colorScheme="messenger" variant="outline">
      <Button colorScheme="yellow">Fall</Button>
      <Button colorScheme="green">IAP</Button>
      <Button colorScheme="pink">Spring</Button>
    </ButtonGroup>
  )
}

const TitleCell = ({ course }: { course: FullCourseData }) => (
  <div className="grid w-5/8">
    <p className="font-extrabold text-slate-700">{course.course_number}</p>
    <p className="text-slate-400 text-sm truncate">{course.info.course_name}</p>
  </div>
)

const TagContainer = ({ course }: { course: FullCourseData }) => {
  const { firehose } = course

  if (firehose === undefined) {
    return <React.Fragment />
  }

  const tags: CourseTag[] = [
    firehose.ci ? CourseTag.CI : undefined,
    firehose.cw ? CourseTag.CW : undefined,
    firehose.ha ? CourseTag.HA : undefined,
    firehose.hs ? CourseTag.HS : undefined,
    firehose.hh ? CourseTag.HH : undefined,
  ].filter((x): x is CourseTag => x !== undefined)

  return (
    <HStack spacing={2}>
      {tags.map((tag) => (
        <Tag size="sm" key={tag} variant="solid" colorScheme={colorMap[tag]}>
          {tag}
        </Tag>
      ))}
    </HStack>
  )
}

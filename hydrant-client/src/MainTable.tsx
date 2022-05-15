import MaterialTable from "@material-table/core"
import { Paper } from "@material-ui/core"
import _ from "lodash"
import { makeHydrantModel, FullCourseData } from "./data"
import invariant from "invariant"
import { HStack, Tag } from "@chakra-ui/react";
import React from "react"

export const MainTable = ({ search }: { search: string }) => {
  // const input = d as (SemesterCourseInfo & CourseInfo)[]
  // let mainObject = useMemo(() => generateMainObject(input, {}), [])
  // const mainObject = 
  // let courses = Object.values(mainObject)

  // courses = _(courses)
  //   .filter((course) =>
  //     JSON.stringify(course.info.course_name + course.course_number)
  //       .toLowerCase()
  //       .includes(search.toLowerCase())
  //   )
  //   .value()
  const model = makeHydrantModel()
  const courses = _(Object.values(model))
    .filter((course) =>
      JSON.stringify(course.info.course_name + course.course_number)
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .value()

  return (
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
              <span className="text-slate-900">{Math.round(c.computed.bayes * 100) / 100}</span>
            ),
          },
          {
            title: "Tags",
            sorting: false,
            render: (c) => (
              <TagContainer course={c} />
            ),
          }
        ]}
        detailPanel={({ rowData }) => <div>This class was a banger!</div>}
        data={courses}
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
  )
}

const TitleCell = ({ course }: { course: FullCourseData }) => (
  <div className="grid w-5/8 bg-slate-50">
    <p className="text-slate-700">{course.course_number}</p>
    <p className="text-slate-400 text-sm truncate">{course.info.course_name}</p>
  </div>
)

enum CourseTag {
  CI = "CI-H",
  CW = "CI-HW",
  HA = "HASS-A",
  HS = "HASS-S",
  HH = "HASS-H"
}

const TagContainer = ({ course }: { course: FullCourseData }) => {
  const { firehose } = course;

  if (firehose === undefined) {
    return <React.Fragment />;
  }

  const tags: CourseTag[] = [
    firehose.ci ? CourseTag.CI : undefined,
    firehose.cw ? CourseTag.CW : undefined,
    firehose.ha ? CourseTag.HA : undefined,
    firehose.hs ? CourseTag.HS : undefined,
    firehose.hh ? CourseTag.HH : undefined,
  ].filter((x): x is CourseTag => x !== undefined);

  const colorMap: Record<CourseTag, string> = {
    [CourseTag.CI]: "red",
    [CourseTag.CW]: "blue",
    [CourseTag.HA]: "teal",
    [CourseTag.HS]: "purple",
    [CourseTag.HH]: "orange"
  };

  return (
    <HStack spacing={2}>
      {tags.map((tag) => (
        <Tag size='sm' key={tag} variant='solid' colorScheme={colorMap[tag]}>
          {tag}
        </Tag>
      ))}
    </HStack>
  );
}


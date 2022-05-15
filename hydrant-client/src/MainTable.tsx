import MaterialTable from "@material-table/core"
import { Paper } from "@material-ui/core"
import { extractEventInfo } from "framer-motion/types/events/event-info"
import _ from "lodash"
import { useMemo } from "react"
import d from "./2018ish_data.json"
import { CourseInfo, generateMainObject, process, SemesterCourseInfo } from "./data"

export const MainTable = ({ search }: { search: string }) => {
  const input = d as (SemesterCourseInfo & CourseInfo)[]
  let mainObject = useMemo(() => generateMainObject(input, {}), [])

  let courses = Object.values(mainObject)

  courses = _(courses)
    .filter((course) =>
      JSON.stringify(course.info.course_name + course.course_number)
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .value()

  return (
    <div className="border-2 p-2 border-slate-200 rounded-md">
      <MaterialTable
        columns={[
          {
            title: "Course",
            sorting: false,
            render: (c) => <TitleCell course={c.info}></TitleCell>,
            cellStyle: { width: "100vw" },
          },
          {
            title: "Composite Rating",
            field: "bayes",
            defaultSort: "desc",
            render: (c) => Math.round(c.computed.bayes * 100) / 100,
          },
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
          pageSize: 10,
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

const TitleCell = ({ course }: { course: CourseInfo }) => (
  <div className="grid w-5/8 bg-slate-100">
    <p className="text-slate-700">{course.course_number}</p>
    <p className="text-slate-400 text-sm truncate">{course.course_name}</p>
  </div>
)

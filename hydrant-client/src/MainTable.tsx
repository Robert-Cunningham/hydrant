import MaterialTable from "@material-table/core"
import { Paper } from "@material-ui/core"
import _ from "lodash"
import d from "./test_data.json"

type CourseInfo = {
  course_number: string
  course_name: string
}

export const MainTable = ({ search }: { search: string }) => {
  const headerStyle = { background: "inherit" }

  const filtered = _(d)
    .filter((course) =>
      JSON.stringify(course.course_name + course.course_number)
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .value() as CourseInfo[]

  return (
    <div className="border-2 p-2 border-slate-200 rounded-md">
      <MaterialTable
        columns={[
          {
            title: "Course",
            sorting: false,
            render: (p: CourseInfo) => (
              <div className="grid w-5/8 bg-slate-100">
                <p className="text-slate-700">{p.course_number}</p>
                <p className="text-slate-400 text-sm truncate">{p.course_name}</p>
              </div>
            ),
            cellStyle: { width: "100vw" },
          },
          {
            title: "Composite Rating",
            field: "eligible",
            defaultSort: "desc",
          },
        ]}
        detailPanel={({ rowData }: { rowData: CourseInfo }) => <div>This class was a banger!</div>}
        data={filtered}
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
          headerStyle,
          detailPanelType: "single",
          //tableLayout: "fixed",
        }}
      />
    </div>
  )
}

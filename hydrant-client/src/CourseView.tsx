import { CourseTerm, FullCourseData, RatingType } from "./data"
import { VStack, HStack, Text, Select, Box } from "@chakra-ui/react"
import {
  LineChart,
  LineSeries,
  PointSeries,
  TooltipArea,
  ChartTooltip,
  PieChart,
  PieArcSeries,
} from "reaviz"
import _ from "lodash"
import React from "react"

function termToMonth(term: CourseTerm) {
  switch (term) {
    case CourseTerm.IAP:
      return 1
    case CourseTerm.FALL:
      return 9
    case CourseTerm.SPRING:
      return 2
  }
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

type ChartInfoEntry = {
  text: string
  component: JSX.Element
}

type ChartInfoTable = Record<string, ChartInfoEntry>

function htmlDecode(input: string): string {
  const e = document.createElement("div")
  e.innerHTML = input
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue!
}

export const CourseView = ({ course }: { course: FullCourseData }) => {
  const ratingHistorical = _(course.history)
    .filter((h) => {
      return h.ratings[RatingType.OVERALL_RATING] !== undefined
    })
    .map((h) => {
      return {
        key: new Date(parseInt(h.year), termToMonth(h.term)),
        data: h.ratings[RatingType.OVERALL_RATING].avg,
        metadata: `Taught by ${h.teachers
          .slice(0, 3)
          .map((t) => t.name)
          .map((t) => t.split(", "))
          .map((v) => `${v[1].slice(0, 1)}. ${v[0]}`)
          .join(", ")}`,
      }
    })
    .sortBy(_.property("key"))
    .value()

  const enrollmentHistorical = _(course.history)
    .map((h) => {
      return {
        key: new Date(parseInt(h.year), termToMonth(h.term)),
        data: h.eligible,
        metadata: `Taught by ${h.teachers
          .slice(0, 3)
          .map((t) => t.name)
          .map((t) => t.split(", "))
          .map((v) => `${v[1].slice(0, 1)}. ${v[0]}`)
          .join(", ")}`,
      }
    })
    .sortBy(_.property("key"))
    .value()

  const { firehose } = course

  const [chart, setChart] = React.useState<string | undefined>(undefined)

  if (!firehose) {
    return <React.Fragment />
  }

  const chartInfo: ChartInfoTable = {
    // hours: {
    //   text: `Hours spent inside vs. outside of class`,
    //   component: (
    //     <React.Fragment>
    //       <PieChart
    //         // width={300}
    //         // height={350}
    //         data={[
    //           { key: "Inside", data: course.computed.inclassHours },
    //           { key: "Outside", data: course.computed.outclassHours },
    //         ]}
    //         series={
    //           <PieArcSeries
    //             cornerRadius={4}
    //             padAngle={0.02}
    //             padRadius={200}
    //             doughnut={true}
    //             colorScheme="Set2"
    //           />
    //         }
    //       />
    //       <Text fontWeight="normal" fontSize="xs">
    //         Avg. hours spent inside vs. outside class
    //       </Text>
    //     </React.Fragment>
    //   ),
    // },
    enrollment: {
      text: `Enrollment since ${enrollmentHistorical[0].key.getFullYear().toString()}`,
      component: (
        <React.Fragment>
          <LineChart
            // width={300}
            // height={350}
            series={
              <LineSeries
                tooltip={
                  <TooltipArea
                    tooltip={
                      <ChartTooltip
                        followCursor={true}
                        modifiers={{
                          offset: "5px, 50px",
                        }}
                        content={(d: any) => (
                          <VStack spacing={2}>
                            <Text fontSize="xs">
                              {monthNames[d.key.getMonth()]} {d.key.getFullYear()}
                            </Text>
                            <Text fontSize="xs">{d.value}</Text>
                            <Text fontSize="xs">{d.metadata}</Text>
                          </VStack>
                        )}
                      />
                    }
                  />
                }
                interpolation="smooth"
                symbols={<PointSeries show={true} />}
              />
            }
            data={enrollmentHistorical}
          />
          <Text fontWeight="normal" fontSize="xs">
            Enrollment since {enrollmentHistorical[0].key.getFullYear().toString()}
          </Text>
        </React.Fragment>
      ),
    },
    rating: {
      text: `Course rating since ${ratingHistorical[0].key.getFullYear().toString()}`,
      component: (
        <React.Fragment>
          <LineChart
            // width={300}
            // height={350}
            series={
              <LineSeries
                tooltip={
                  <TooltipArea
                    tooltip={
                      <ChartTooltip
                        followCursor={true}
                        modifiers={{
                          offset: "5px, 50px",
                        }}
                        content={(d: any) => (
                          <VStack spacing={2}>
                            <Text fontSize="xs">
                              {monthNames[d.key.getMonth()]} {d.key.getFullYear()}
                            </Text>
                            <Text fontSize="xs">{d.value}</Text>
                            <Text fontSize="xs">{d.metadata}</Text>
                          </VStack>
                        )}
                      />
                    }
                  />
                }
                interpolation="smooth"
                symbols={<PointSeries show={true} />}
              />
            }
            data={ratingHistorical}
          />
          <Text fontWeight="normal" fontSize="xs">
            Avg. course rating since {ratingHistorical[0].key.getFullYear().toString()}
          </Text>
        </React.Fragment>
      ),
    },
  }

  return (
    <VStack
      align="center"
      justify="center"
      minHeight="40vh"
      paddingY={4}
      maxWidth="87%"
      marginX="auto"
    >
      <VStack marginTop={2} spacing={8} align="center" width="100%">
        <HStack spacing={6} width="100%" align="flex-start">
          <Text fontSize="sm">
            <Text display="inline" fontWeight="bold">
              Prereqs
            </Text>
            : {firehose.pr}
          </Text>
          <Text fontSize="sm">
            <Text display="inline" fontWeight="bold">
              Hours
            </Text>
            : {firehose.h}
          </Text>
          {course.otherNumbers.length > 0 ? (
            <Text fontSize="sm">
              <Text display="inline" fontWeight="bold">
                Meets with
              </Text>
              : {course.otherNumbers.join(", ")}
            </Text>
          ) : (
            <React.Fragment />
          )}
          <Text fontSize="sm">
            <Text display="inline" fontWeight="bold">
              Units
            </Text>
            : {firehose.u1 + firehose.u2 + firehose.u3}
          </Text>
        </HStack>
        <VStack width="100%" align="flex-start">
          <Text fontWeight="bold" fontSize="md">
            Summary
          </Text>
          <Text fontSize="sm" dangerouslySetInnerHTML={{ __html: htmlDecode(firehose.d) }} />
        </VStack>
        <Select
          value={chart}
          onChange={(e) => setChart(e.target.value)}
          colorScheme="messenger"
          size="md"
          variant="flushed"
          placeholder="Chart"
        >
          {_.keys(chartInfo).map((chart) => (
            <option key={chart} value={chart}>
              {_.get(chartInfo, chart).text}
            </option>
          ))}
          {/* <option value="hours">Hours spent inside vs. outside of class</option>
          <option value="hours">Enrollment since {enrollmentHistorical[0].key.getFullYear().toString()}</option>
          <option value='hours'>Course rating since {ratingHistorical[0].key.getFullYear().toString()}</option> */}
        </Select>
        {chart !== undefined && chartInfo.hasOwnProperty(chart) && (
          <VStack width="40vw" height="50vh" marginX="auto" spacing={6}>
            {chartInfo[chart].component}
          </VStack>
        )}
      </VStack>
    </VStack>
  )
}

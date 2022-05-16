import { CourseTerm, FullCourseData, RatingType } from "./data"
import { VStack, HStack, Text } from "@chakra-ui/react"
import { LineChart, LineSeries, PointSeries, TooltipArea, ChartTooltip } from "reaviz"
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

  if (!firehose) {
    return <React.Fragment />
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
        <HStack spacing={10} width="100%" align="flex-start">
          <Text fontSize="sm">
            <Text display="inline" fontWeight="bold">
              Prereqs
            </Text>
            : {firehose.pr}
          </Text>
          <Text fontSize="sm">
            <Text display="inline" fontWeight="bold">
              Hours (in/out)
            </Text>
            : {course.computed.inclassHours}/{course.computed.outclassHours}
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
        </HStack>
        <VStack align="flex-start">
          <Text fontWeight="bold" fontSize="md">
            Summary
          </Text>
          <Text fontSize="sm" dangerouslySetInnerHTML={{ __html: htmlDecode(firehose.d) }} />
        </VStack>
        <HStack spacing={12}>
          <VStack>
            {/* <PieChart
              width={400}
              height={350}
              data={[
                { key: "Inside", data: course.computed.inclassHours },
                { key: "Outside", data: course.computed.outclassHours },
              ]}
              series={
                <PieArcSeries
                  cornerRadius={4}
                  padAngle={0.02}
                  padRadius={200}
                  doughnut={true}
                  colorScheme="Set2"
                />
              }
            />
            <Text fontWeight="normal" fontSize="xs">
              Avg. hours spent inside vs. outside class
            </Text> */}
            <LineChart
              width={400}
              height={350}
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
              Avg. enrollment since {enrollmentHistorical[0].key.getFullYear().toString()}
            </Text>
          </VStack>
          <VStack>
            <LineChart
              width={400}
              height={350}
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
          </VStack>
        </HStack>
      </VStack>
    </VStack>
  )
}

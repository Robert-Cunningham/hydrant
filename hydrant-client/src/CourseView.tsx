import React from "react"
import { CourseTerm, FullCourseData, RatingType } from "./data"
import { Box, VStack, HStack, Text } from "@chakra-ui/react"
import { PieArcSeries, PieChart, LineChart, LineSeries, ChartDataShape, PointSeries } from "reaviz"
import _ from "lodash"

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

export const CourseView = ({ course }: { course: FullCourseData }) => {
  const ratingHistorical = _(course.history)
    .filter((h) => {
      return h.ratings[RatingType.OVERALL_RATING] !== undefined
    })
    .map((h) => {
      return {
        key: new Date(parseInt(h.year), termToMonth(h.term)),
        data: h.ratings[RatingType.OVERALL_RATING].avg,
        metadata: `${h.term} ${h.year}`,
      }
    })
    .sortBy(_.property("key"))
    .value()

  return (
    <VStack
      align="center"
      justify="center"
      minHeight="40vh"
      paddingY={4}
      maxWidth="87%"
      marginX="auto"
    >
      <VStack align="center" width="100%">
        {/* <Text fontWeight="bold" fontSize="xl">
          Statistics (from Fall 2019 to Spring 2022)
        </Text> */}
        <HStack spacing={4}>
          <VStack>
            <PieChart
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
            </Text>
          </VStack>
          <VStack>
            <LineChart
              width={400}
              height={350}
              series={<LineSeries interpolation="smooth" symbols={<PointSeries show={true} />} />}
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

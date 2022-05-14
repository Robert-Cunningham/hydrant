import { useState } from "react"
import logo from "./logo.svg"
import "./App.css"
import {
  Box,
  Button,
  Center,
  ChakraProvider,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
} from "@chakra-ui/react"
import { PhoneIcon, SearchIcon } from "@chakra-ui/icons"

const App = () => {
  return (
    <Grid w="100vw" h="100vh" templateColumns={"280px 1fr"}>
      <GridItem pr={8} pb={6} pl={6} pt={4} bg="red">
        <Box w="100%" h="100%" bg="white">
          {["a", "b", "c", "d"].map((a) => (
            <Box w="100%">
              <Button w="100%">{a}</Button>
            </Box>
          ))}
        </Box>
      </GridItem>
      <GridItem bg="blue">
        <Center>
          <Stack spacing={4}>
            {["a", "b", "c", "d"].map((a) => (
              <p>{a}</p>
            ))}
          </Stack>
        </Center>
      </GridItem>
    </Grid>
  )
}

export default App

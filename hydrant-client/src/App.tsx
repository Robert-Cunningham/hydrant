import { SearchIcon } from "@chakra-ui/icons"
import { InputGroup, InputLeftElement, Input } from "@chakra-ui/react"
import React from "react"
import { Route, Routes } from "react-router-dom"

const App = () => {
  return (
    <div className="h-screen w-full grid grid-cols-12">
      <Sidebar></Sidebar>
      <div className="col-span-10 bg-slate-100">
        <Routes>
          <Route path="/" element={<MainList></MainList>}></Route>
          <Route path="/hass-a" element={<MainList></MainList>}></Route>
        </Routes>
      </div>
    </div>
  )
}

const Sidebar = () => <div className="col-span-2 bg-slate-200"></div>

const MainList = () => {
  return (
    <div className="p-4 bg">
      <Search></Search>
    </div>
  )
}
const Search = () => (
  <InputGroup>
    <InputLeftElement>
      <SearchIcon color="gray.300" />
    </InputLeftElement>
    <Input></Input>
  </InputGroup>
)

export default App

import { SearchIcon } from "@chakra-ui/icons"
import { InputGroup, InputLeftElement, Input, Stack } from "@chakra-ui/react"
import React, { useState } from "react"
import { Route, Routes } from "react-router-dom"
import { MainTable } from "./MainTable"
import { Post } from "./Post"

const App = () => {
  return (
    <div className="h-screen w-full grid grid-cols-12">
      <Sidebar></Sidebar>
      <div className="col-span-10 bg-slate-100">
        <Routes>
          <Route path="/" element={<MainList></MainList>}></Route>
          <Route path="/post/:id" element={<Post></Post>}></Route>
        </Routes>
      </div>
    </div>
  )
}

const Sidebar = () => <div className="col-span-2 bg-slate-200"></div>

const MainList = () => {
  const [search, setSearch] = useState<string>("")
  return (
    <div className="p-4 bg">
      <Stack spacing={4}>
        <Search {...{ search, setSearch }}></Search>
        <MainTable {...{ search }}></MainTable>
      </Stack>
    </div>
  )
}
const Search = ({
  search,
  setSearch,
}: {
  search: string
  setSearch: (a0: string) => void
}) => (
  <InputGroup>
    <InputLeftElement>
      <SearchIcon color="gray.300" />
    </InputLeftElement>
    <Input value={search} onChange={(e) => setSearch(e.target.value)}></Input>
  </InputGroup>
)

export default App

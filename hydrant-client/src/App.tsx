import React, { useState } from "react"
import { Route, Routes } from "react-router-dom"
import { MainTable } from "./MainTable"
import { Post } from "./Post"
import { Box } from "@chakra-ui/react";

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
    // <div className="p-4 bg">
    <Box p={4}>
      <Box maxW="4xl" marginY={16} marginX="auto">
        <div className="grid gap-4">
          <Search {...{ search, setSearch }}></Search>
          <MainTable {...{ search }}></MainTable>
        </div>
      </Box>
    </Box>
    // </div>
  )
}

const Search = ({ search, setSearch }: { search: string; setSearch: (a0: string) => void }) => (
  <input
    className="w-full rounded h-8 p-2 bg-slate-100 border-2"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    autoFocus
    placeholder="Search"
  ></input>
)

export default App

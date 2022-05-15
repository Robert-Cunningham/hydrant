import React, { useState } from "react"
import { Route, Routes } from "react-router-dom"
import { MainTable } from "./MainTable"
import { Post } from "./Post"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

const App = () => {
  return (
    <div className="w-screen">
      <Header />
      <div className="w-full grid grid-cols-12">
        <Sidebar></Sidebar>
        <div className="col-span-10 bg-slate-50">
          <Routes>
            <Route path="/" element={<MainList></MainList>}></Route>
            <Route path="/post/:id" element={<Post></Post>}></Route>
          </Routes>
        </div>
      </div>
    </div>
  )
}

const MainList = () => {
  const [search, setSearch] = useState<string>("")
  return (
    <div className="p-4 h-[calc(100vh-theme(space.16))] overflow-auto">
      <div className="grid gap-4">
        <Search {...{ search, setSearch }}></Search>
        <MainTable {...{ search }}></MainTable>
      </div>
    </div>
  )
}

const Search = ({ search, setSearch }: { search: string; setSearch: (a0: string) => void }) => (
  <input
    className="w-full rounded h-8 p-2 bg-slate-50 border-2 border-slate-200"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    autoFocus
    placeholder="Search"
  ></input>
)

export default App

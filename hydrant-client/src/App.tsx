import React, { useState, useMemo, useEffect } from "react"
import { Route, Routes } from "react-router-dom"
import { MainTable } from "./MainTable"
import { Post } from "./Post"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import _ from "lodash"

const App = () => {
  return (
    <div className="w-screen">
      <Header />
      <div className="w-full grid grid-cols-12">
        <Sidebar></Sidebar>
        <div className="col-span-12 lg:col-span-10 bg-slate-50">
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
  const [delayedSearch, setDelayedSearch] = useState<string>("")

  const searchHandler = (v: string) => {
    setDelayedSearch(v)
  }
  const debouncedSearch = useMemo(() => _.debounce(searchHandler, 500), [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [])

  useEffect(() => {
    debouncedSearch(search)
  }, [search])

  return (
    <div className="p-1 sm:p-4 overflow-auto h-[calc(100vh-theme(space.16))]">
      <div className="max-w-5xl mt-1 sm:mt-6 mx-auto">
        <div className="grid sm:gap-4 gap-2">
          <Search {...{ search, setSearch }}></Search>
          <MainTable {...{ search: delayedSearch }}></MainTable>
        </div>
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

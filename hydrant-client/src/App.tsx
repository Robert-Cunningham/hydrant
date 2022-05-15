import React, { useState } from "react"
import { Route, Routes } from "react-router-dom"
import { MainTable } from "./MainTable"
import { Post } from "./Post"
import { Sidebar } from "./Sidebar"

const Logo = () => (
  <a href="/" className="flex cursor-pointer w-min">
    <svg
      className="text-slate-900 mr-1"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      width="3em"
      height="3em"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 1024 1024"
    >
      <path
        fill="currentColor"
        d="M834.1 469.2A347.49 347.49 0 0 0 751.2 354l-29.1-26.7a8.09 8.09 0 0 0-13 3.3l-13 37.3c-8.1 23.4-23 47.3-44.1 70.8c-1.4 1.5-3 1.9-4.1 2c-1.1.1-2.8-.1-4.3-1.5c-1.4-1.2-2.1-3-2-4.8c3.7-60.2-14.3-128.1-53.7-202C555.3 171 510 123.1 453.4 89.7l-41.3-24.3c-5.4-3.2-12.3 1-12 7.3l2.2 48c1.5 32.8-2.3 61.8-11.3 85.9c-11 29.5-26.8 56.9-47 81.5a295.64 295.64 0 0 1-47.5 46.1a352.6 352.6 0 0 0-100.3 121.5A347.75 347.75 0 0 0 160 610c0 47.2 9.3 92.9 27.7 136a349.4 349.4 0 0 0 75.5 110.9c32.4 32 70 57.2 111.9 74.7C418.5 949.8 464.5 959 512 959s93.5-9.2 136.9-27.3A348.6 348.6 0 0 0 760.8 857c32.4-32 57.8-69.4 75.5-110.9a344.2 344.2 0 0 0 27.7-136c0-48.8-10-96.2-29.9-140.9z"
      />
    </svg>
    <div className="text-3xl text-slate-800 font-bold place-self-center">Hydrant</div>
  </a>
)

const App = () => {
  return (
    <div className="w-screen">
      <div className="bg-slate-50 h-16 p-2 border-b">
        <Logo></Logo>
      </div>
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
    <div className="p-4 h-[calc(100vh-theme(space.16))]">
      <div className="grid gap-4">
        <Search {...{ search, setSearch }}></Search>
        <MainTable {...{ search }}></MainTable>
      </div>
    </div>
  )
}

const Search = ({ search, setSearch }: { search: string; setSearch: (a0: string) => void }) => (
  <input
    className="w-full rounded h-8 p-2 bg-slate-50 border-2 border-slate-100"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    autoFocus
    placeholder="Search"
  ></input>
)

export default App

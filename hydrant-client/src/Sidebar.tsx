import React from "react"
import { BeakerIcon, HomeIcon, MusicNoteIcon, PencilIcon } from "@heroicons/react/solid"

const iconStyles = "h-6 w-6 m-2 text-slate-400 group-hover:text-slate-600"

const links = [
  { text: "Home", link: "/", icon: <HomeIcon className={iconStyles}></HomeIcon> },
  { text: "GIRs", link: "/post/gir", icon: <PencilIcon className={iconStyles}></PencilIcon> },
  {
    text: "HASS-A",
    link: "/post/hassa",
    icon: <MusicNoteIcon className={iconStyles}></MusicNoteIcon>,
  },
]

export const Sidebar = () => (
  <div className="col-span-2 bg-slate-50 border-r">
    {links.map(({ text, link, icon }) => (
      <div className="group m-2 h-10 rounded-lg hover:bg-slate-100 transition duration-75 grid cursor-pointer grid-flow-col items-center justify-items-start">
        {icon}
        <a href={link} className="text-slate-900">
          {text}
        </a>
      </div>
    ))}
  </div>
)

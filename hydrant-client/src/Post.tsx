import React from "react"
import { useParams } from "react-router-dom"
import Bestpost from "../posts/hassa.mdx"

export const Post = () => {
  const { id } = useParams<{ id: string }>()

  return <Bestpost></Bestpost>
}

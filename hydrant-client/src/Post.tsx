import React from "react"
import { useParams } from "react-router-dom"
import HASSAPost from "../posts/hassa.mdx"

export const Post = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <article className="prose p-8">
      <HASSAPost></HASSAPost>
    </article>
  )
}

import React from "react"
import { useParams } from "react-router-dom"
import HASSAPost from "../posts/hassa.mdx"

import Review6115 from "../reviews/6.115.mdx"

export const Post = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <article className="prose p-8">
      <Review6115></Review6115>
    </article>
  )
}

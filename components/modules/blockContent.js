import React from 'react'

import { PortableText } from "@portabletext/react";

const BlockContent = ({ data = {} }) => {
  const { content } = data

  return (
    <div>
      {content && (
        <PortableText value={content} />
      )}
    </div>
  )
}

export default BlockContent
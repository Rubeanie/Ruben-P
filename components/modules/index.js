import React from 'react'
import dynamic from 'next/dynamic'

/* const Hero = dynamic(() => import('./hero')) */
const BlockContent = dynamic(() => import('./blockContent'))
const Skills = dynamic(() => import('./skills'))


export const Module = ({
  index,
  module,
}) => {
  const type = module._type;
  /* const type = 'null'; */

  switch (type) {
    /* case 'hero':
      return <Hero index={index} data={module} /> */
    case 'htmll':
      return <BlockContent index={index} data={module} />
    case 'skills':
      return <Skills index={index} data={module} />
    default:
      return null
  }
}

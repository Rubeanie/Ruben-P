'use client'

import { preconnect } from 'react-dom'

export function PreloadResources() {
  preconnect('https://api.sanity.com', { crossOrigin: 'anonymous' })
  preconnect('https://cdn.sanity.io', { crossOrigin: 'anonymous' })
  preconnect('https://res.cloudinary.com', { crossOrigin: 'anonymous' })
  preconnect('https://www.gstatic.com', { crossOrigin: 'anonymous' })

  return null
}
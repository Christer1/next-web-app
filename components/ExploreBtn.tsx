'use client'
import React from 'react'
import Image from 'next/image'
import posthog from 'posthog-js'
const ExploreBtn = () => {
  const handleClick = () => {
    console.log('ExploreBtn')
    posthog.capture('explore_events_clicked')
  }
  return (
    <button type='button' id='explore-btn' className='mt-7 mx-auto' onClick={handleClick}>
    <a href="#events">Explore Events
        <Image src="/icons/arrow-down.svg" alt="arrow-right" width={24} height={24} />
    </a>
    </button>
  )
} 

export default ExploreBtn
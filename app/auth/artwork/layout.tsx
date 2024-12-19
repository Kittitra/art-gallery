import Navbar from '@/app/components/Navbar';
import React from 'react'

interface ArtworkLayoutProps {
    children: React.ReactNode;
}

const ArtworkLayout = ({children}: ArtworkLayoutProps) => {
  return (
    <div className='h-full'>
        <Navbar />
        <div >
          {children}
        </div>
    </div>
  )
}

export default ArtworkLayout
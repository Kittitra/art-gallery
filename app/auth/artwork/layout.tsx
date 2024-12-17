import Navbar from '@/app/components/Navbar';
import React from 'react'

interface profileLayoutProps {
    children: React.ReactNode;
}

const ProfileLayout = ({children}: profileLayoutProps) => {
  return (
    <div className='h-full'>
        <Navbar />
        <div >
          {children}
        </div>
    </div>
  )
}

export default ProfileLayout
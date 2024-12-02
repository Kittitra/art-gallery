import Navbar from '@/app/components/Navbar';
import React from 'react'

interface profileLayoutProps {
    children: React.ReactNode;
}

const ProfileLayout = ({children}: profileLayoutProps) => {
  return (
    <div className=''>
        <Navbar />
        <div className='h-screen'>
          {children}
        </div>
    </div>
  )
}

export default ProfileLayout
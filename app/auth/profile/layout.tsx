import Navbar from '@/app/components/Navbar';
import React from 'react'

interface profileLayoutProps {
    children: React.ReactNode;
}

const ProfileLayout = ({children}: profileLayoutProps) => {
  return (
    <div className=''>
        <Navbar />
        {children}
    </div>
  )
}

export default ProfileLayout
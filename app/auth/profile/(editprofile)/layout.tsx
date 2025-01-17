import React from 'react'

interface profileLayoutProps {
    children: React.ReactNode;
}

const ProfileLayout = ({children}: profileLayoutProps) => {
  return (
    <div className='h-screen'>
        {children}
    </div>
  )
}

export default ProfileLayout
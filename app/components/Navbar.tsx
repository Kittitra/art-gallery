"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input'
import { useCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link'
import React, { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { FaUser } from "react-icons/fa"
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'

const Navbar = () => {
    const [url, setUrl] = useState('');
    const router = useRouter();
  
    const handleRedirect = () => {
      if (url) {
        router.push(`/auth/search/${url}`); // Redirect ไปยัง URL
      } else {
        alert('กรุณากรอก URL ที่ต้องการ'); // แจ้งเตือนเมื่อไม่มีค่า
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          handleRedirect(); // เรียกใช้ฟังก์ชันเมื่อกด Enter
        }
      };

    const items = [
        {
            name: "Logo",
            path: "/"
        },
        {
            name: "Home",
            path: "/"
        },
        {
            name: "Create",
            path: "/auth/create"
        },
    ]

    const submit = () => {
        signOut();
    }

    const user = useCurrentUser();


  return (
    <div className='flex justify-between items-center p-9 text-xl font-medium px-16'>
        <div className='flex gap-10  '>
            {items.map((item, index) => (
                <div key={index} className='cursor-pointer pb-1 border-b-2 border-transparent hover:border-b-white transition duration-300  '>
                    <Link href={item.path}>
                        {item.name}
                    </Link>
                </div>
            ))}
        </div>

        <div className='relative'>
            <Input className=' rounded-2xl pl-10 w-[450px] border-slate-500 hover:border-white'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Search' />
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="text-gray-500" /> 
            </span>
        </div>

        <div className='flex gap-10 '>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger >
                        <Avatar className='w-14 h-14'>
                            <AvatarImage src={user?.image || ""} />
                                <AvatarFallback className='bg-white'>
                                    <FaUser className='text-black' />
                                </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='mt-2 mr-10 bg-[#1f1f1f] border-none text-white'>
                        <DropdownMenuLabel className='text-lg font-light pb-5'>
                            <div className='flex flex-row gap-5 justify-start items-center'>
                                    <Avatar className='w-12 h-12'>
                                        <AvatarImage src={user?.image || ""} />
                                        <AvatarFallback className='bg-white'>
                                            <FaUser className='text-black '/>
                                        </AvatarFallback>
                                    </Avatar>
                                <div className='flex flex-col justify-center items-start'>
                                    <div className='font-bold'>
                                        {user.name}
                                    </div>
                                    <div className='flex justify-start items-center gap-3 text-gray-500'>
                                        <div className='hover-text'>
                                            <Link href={`/auth/profile/${user.id}`}>
                                                View Profile
                                            </Link>
                                        </div>
                                        <div className=' hover-text'>
                                            <Link href="/auth/profile/edit">
                                                Edit Profile
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuItem className='DropdownMenuItem-bg'>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className='DropdownMenuItem-bg'
                        onClick={submit}>
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                    <Link href="/auth/register">
                        <Button className='text-xl p-6 bg-slate-600 hover:bg-slate-400 ' >
                            SignUp
                        </Button>
                    </Link>
                    
                    <Link href="/auth/login">
                        <Button className='text-xl p-6 bg-blue-700 hover:bg-blue-500 '>
                            SignIn
                        </Button>
                    </Link>                                                 
                </>
            )}

        </div>
    </div>
  )
}

export default Navbar
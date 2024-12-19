"use client";

import React, { useEffect, useState } from 'react'
import Navbar from '@/app/components/Navbar';
import { ArtStatus } from '@prisma/client';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaUser } from 'react-icons/fa';

interface Artwork {
    id: string;
    userId: string;
    image: string;
    title: string;
    description: string;
    status: ArtStatus;
    tags: string[]
  }

  interface User {
    id: string;
    image: string;
    name: string;
    email: string;
    createdAt: string;
  }

const SearchPage = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [user, setUser] = useState<User[]>([])
    const [search, setSearch] = useState(() => {
        return sessionStorage.getItem("search") || "Artwork" ;
    });
    const [loading, setLoading] = useState(true)
    const params = useParams();
    const slug = params.slug as string;

    const fetchArtwork = async() => {
        try {
            const result = await axios.get('/api/artwork')
            setArtworks(result.data)

        }catch(error) {
            console.log("fetching error :", error)
        }
    }

    const fetchUser = async () => {
        try {
          const response = await fetch('/api/user');
          const result = await response.json();
          setUser(result);
        } catch (error) {
          console.log(error);
        }
      };

      const artworksFilter = artworks.filter(
        item =>
          item.title.toLocaleLowerCase().includes(slug.toLocaleLowerCase()) || // ตรวจสอบ slug กับ title
          item.tags.some(tag => tag.toLocaleLowerCase() === slug.toLocaleLowerCase()) // ตรวจสอบ slug กับ tags
      );
    const usersFilter = user.filter(item => 
        item.name.toLocaleLowerCase().includes(slug.toLocaleLowerCase())
    )

    console.log(artworksFilter)
    
    useEffect(() => {
        fetchArtwork();
        fetchUser();
        setLoading(false);
    } ,[])

    useEffect(() => {
    // บันทึกค่าลง localStorage ทุกครั้งที่ value เปลี่ยน
        sessionStorage.setItem('search', search);
    }, [search]);

    if(loading) {
        return(
            <div className='w-full h-screen p-10'>
                Loading...
            </div>
        )
    }


  return (
    <div className='w-full h-screen'>
        <Navbar />
        <div className=' flex flex-col items-center justify-end  bg-[#212121] h-[12rem]'>
            <div className='flex flex-row gap-[10rem] text-3xl font-medium '>
                <div className={`cursor-pointer text-gray-500 pb-5 ${search === "Artwork" ? "border-b-2 border-sky-500  text-white" : ""}`}
                onClick={() => setSearch("Artwork")}>
                    Artwork
                </div>

                <div className={`cursor-pointer  text-gray-500 ${search === "Artist" ? "border-b-2 border-sky-500 text-white" : ""}`}
                onClick={() => setSearch("Artist")}>
                    Artist
                </div>
            </div>

        </div>
        {search === "Artwork"  ? (
            <div className='flex flex-col items-start text-3xl font-semibold w-full p-3 pt-10'>
                <div>
                    Search for {slug}
                </div>
                <div className=' text-lg font-light py-2'>
                    {artworksFilter.filter(item => item.status !== "Private").length} results
                </div>

                <div className='flex flex-row gap-1 flex-wrap'>
                {artworksFilter.map((items, index) => {
                    if(items.status !== "Private") {
                        const imageUrl = items.image.split(',')[0]
                        return(
                        <Link href={`/auth/artwork/${items.id}`} key={index}>
                            <div key={items.id} className='relative group '>
                                <div className='w-[25rem] h-[20rem] relative overflow-hidden'>
                                    <Image src={imageUrl} alt='' fill className="object-cover rounded-md"/>
                                </div>

                                <div className="absolute flex items-end inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-70 transition-opacity duration-300" key={index}>
                                    <span className="text-white text-lg font-semibold p-4">{items.title}</span>
                                </div>
                            </div>
                        </Link>
                        )
                    }
                })}
                </div>
            </div>
        ) : (
            <div className='flex flex-col items-start text-3xl font-semibold w-full p-3 pt-10'>
                <div>
                    Search for {slug}
                </div>
                <div className=' text-lg font-light py-2'>
                    {usersFilter.length} results 
                </div>

                <div className='flex flex-row gap-3 flex-wrap'>
                {usersFilter.map((items, index) => (
                    <Link href={`/auth/profile/${items.id}`} key={index}>
                        <div key={items.id} className='group relative'>
                            <div className=' relative overflow-hidden'>
                            <Avatar className='w-[15rem] h-[15rem] object-cover'>
                                    <AvatarImage src={items.image || ''} 
                                    className='object-cover'/> {/* แสดงเฉพาะภาพแรก */}
                                    <AvatarFallback className='bg-white'>
                                        <FaUser className='text-black text-[3rem]' />
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="absolute flex items-end inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-70 transition-opacity duration-300" key={index}>
                                <span className="text-white text-lg font-semibold p-4">{items.name}</span>
                            </div>
                        </div>
                    </Link>
                ))}
                </div>
            </div>
        )}

    </div>
  )
}

export default SearchPage
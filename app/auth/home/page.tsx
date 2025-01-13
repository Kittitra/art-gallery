"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArtStatus } from '@prisma/client';
import Link from 'next/link';

interface Artwork {
  id: string;
  userId: string;
  image: string;
  title: string;
  description: string;
  status: ArtStatus;
}

function Homepage() {
  const [artWorks, setArtworks] = useState<Artwork[]>([]);
  const [error, setError] = useState<string | null>(null);


  const getArtwork = async () => {
    try {
        const response = await fetch(`/api/artwork`, {
          credentials: "include",
        });
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        // ตรวจสอบว่า response เป็น JSON หรือไม่
        if (contentType && contentType.includes("application/json")) {
            const result = await response.json(); // กำหนดประเภทข้อมูล
            console.log(result)
            setArtworks(result);
        } else {
            throw new TypeError("Expected JSON response but received HTML");
        }
    } catch (err) {
        setError("Failed to fetch data");
        console.error("Fetch error:", err); // แสดงข้อผิดพลาดใน console
    }
  };
      
  const dataWithFirstImage = artWorks.map(item => ({
    ...item,
    firstImage: item.image.split(',')[0]
  }));


  useEffect(() => {
    getArtwork();
  }, []);

  if(error != null) {
    return <div> {error} </div>
  }

  return (
    <div className="w-full h-screen flex flex-col p-5 gap-5">
      <div className="text-2xl font-semibold">
        All Channels
      </div>
      <div className='flex flex-row gap-1 flex-wrap'>
        {dataWithFirstImage.map((items, index) => {
          if(items.status !== "Private") {
            return(
              <Link key={index} href={`/auth/artwork/${items.id}`}>
                <div key={items.id} className='relative group '>
                    <div className='w-[28.8rem] h-[25rem] relative overflow-hidden'>

                      <Image src={items.firstImage} alt='' fill
                      className="object-cover"
                  />
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
  );
}

export default Homepage;

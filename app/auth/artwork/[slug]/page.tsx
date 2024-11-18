"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArtStatus, UrlType } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link';
import { InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { FaDeviantart, FaFacebook, FaUser } from 'react-icons/fa';
import FormSuccess from '@/app/components/formSuccess';


interface Artwork {
  id: string;
  userId: string;
  image: string;
  title: string;
  description: string;
  status: ArtStatus;
}

interface Social {
  link: string;
  id: string;
  type: string;
  userId: string;
}

interface User {
  id: string;
  image: string;
  name: string;
  email: string;
  headline: string;
}

const ArtworkPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [url, setUrl] = useState<Social[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | undefined>("");
  const params = useParams();
  const slug = params.slug as string;

  const currentUser = useCurrentUser();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/user');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error(err);
    }
  };

  const fetchUrl = async () => {
    try {
      const response = await fetch('/api/social');
      const result = await response.json();
      setUrl(result);
      console.log(result)
    } catch (error) {
      console.log(error);
    }
  };

  const fetchArtworks = async () => {
    try {
      const response = await axios.get('/api/artwork');
      setArtworks(response.data);
    } catch (err) {
      setError('Failed to fetch artwork data');
      console.error(err);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await axios.put('/api/artwork', { id: slug });
      console.log("Update successful:", response.data.message);
      setSuccess("Publish Success");

      fetchArtworks();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  

  const GenerateUrl = (type: string) => {
    if(type === UrlType.Facebook){
        return  <FaFacebook style={{ width: "25px", height: "25px" }} /> 
    }else if(type === UrlType.Instagram) {
        return   <InstagramLogoIcon style={{ width: "25px", height: "25px" }} /> 
    }else if(type === UrlType.X){
        return  <TwitterLogoIcon style={{ width: "25px", height: "25px" }} />
    }else if(type === UrlType.Deviantart){
        return   <FaDeviantart style={{ width: "25px", height: "25px" }} /> 
    }
};

  useEffect(() => {
    fetchArtworks();
    fetchUsers();
    fetchUrl();
  }, []);

  return (
      <div className="flex flex-row w-full h-fit gap-3 p-5">
        <div className="w-full">
          <div className="font-bold text-2xl">
            {error && <p className="text-red-500">{error}</p>}
            {artworks.length > 0 ? (
              artworks.map((item) => {
                if (item.id === slug) {
                  return (
                    <div key={item.id}>
                      <Image 
                        src={item.image} 
                        alt={item.title}
                        width={1920} 
                        height={0} 
                        className="w-full"
                      />
                    </div>
                  );
                }
                return null;
              })
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>

          <div className="flex flex-col bg-[#282828] rounded-md items-center gap-5 p-10 w-[70vh]">
            {artworks.map((item) => {
              if(item.id === slug) {
                const user = users.find((u) => u.id === item.userId);

                return(
                  <div className='flex justify-center items-center flex-col gap-5'>
                    {user && (
                      <Link href={`/auth/profile/${user.id}`}>
                          <Avatar className='w-24 h-24'>
                              <AvatarImage src={user?.image || ""} />
                                  <AvatarFallback className='bg-white'>
                                      <FaUser className='text-black' />
                                  </AvatarFallback>
                          </Avatar>
                      </Link>
                        )}
                    <div className='text-xl font-semibold'>
                      {user?.name}
                    </div>
                    <div>
                      {user?.headline}
                    </div>
                    {item.userId !== currentUser?.id && (
                      <Button>
                        Follow
                      </Button>
                    )}
                    <div>
                      <Button>
                        Like
                      </Button>
                    </div>
                  </div>
                )
              }
            })}
            <div className="text-xl">
              <i>Contract</i>
            </div>
            <div className='flex flex-row gap-5 justify-around'>
                    {url.map((url, index) => (
                        <Link href={url.link} key={index} target='_blank'>
                            <div > 
                                {GenerateUrl(url.type)}
                            </div>
                        </Link>
                    ))}
            </div>
          {artworks.map((art, index) => {
            if(art.status !== "Publish") {
              return (
                <div key={index}>
                  <Button onClick={handleUpdateStatus}
                  className='border border-white'>
                    Change Artwork to Public
                  </Button>

                </div>
              )
            }
          })}
          <FormSuccess message={success} />
        </div>

      </div>
     
  );
};

export default ArtworkPage;

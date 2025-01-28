"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ArtStatus, Follow, UrlType } from '@prisma/client';
import { InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { FaDeviantart, FaFacebook, FaUser } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { toggleFollow } from '@/action/follow';


interface User {
    id: string;
    image: string;
    name: string;
    email: string;
}

interface Social {
    link: string;
    id: string;
    type: string;
    userId: string;
  }
  

interface Artwork {
    id: string;
    userId: string;
    image: string;
    title: string;
    description: string;
    status: ArtStatus;
}

export default function Page() {
    const [user, setUser] = useState<User | null>(null);
    const [artWorks, setArtworks] = useState<Artwork[]>([]);
    const [url, setUrl] = useState<Social[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [follow, setFollow] = useState<Follow[]>([]);
    const [isFollowPending, startFollowTransition] = useTransition();

    const router = useRouter();
    
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = useCurrentUser();

    const params = useParams();
    const slug = params.slug as string;
    const userId = currentUser?.id as string;



    const getUser = async () => {
        try {
            const response = await fetch(`/api/user/${slug}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const result: User = await response.json();
            setUser(result);
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

    const getArtwork = async () => {
        try {
            const response = await fetch(`/api/artwork`);
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            setArtworks(result);
        } catch (err) {
            setError('Failed to fetch artwork data');
            console.error(err);
        }
    };
    
    const dataWithFirstImage = artWorks.map(item => ({
    ...item,
    firstImage: item.image.split(',')[0]
    }));
      

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await getUser();
            await getArtwork();
            setIsLoading(false);
        };
        fetchData();
        fetchUrl();
    }, []);

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

    const handleFollow = async (targetUserId: string) => {
        if(currentUser === undefined) {
          router.push('/auth/login');
        }
    
        startFollowTransition( async() => {
    
          // Optimistic UI update
          setFollow((prevFollow) => {
            const isFollowing = prevFollow.some(
              (item) => item.followingId === targetUserId
            );
          
            if (isFollowing) {
              return prevFollow.filter((item) => item.followingId !== targetUserId);
            } else {
              return [
                ...prevFollow,
                {
                  id: uuidv4(),
                  followerId: userId,
                  followingId: targetUserId,
                  createdAt: new Date(),
                },
              ];
            }
          });
    
          try {
            await toggleFollow({ followerId: userId, followingId: targetUserId });
          } catch (error) {
            console.error("Error toggling follow:", error);
            // Revert optimistic update if API fails
            setFollow((prevFollow) => {
              const isFollowing = prevFollow.some(
                (item) => item.followingId === targetUserId
              );
            
              if (isFollowing) {
                return prevFollow.filter((item) => item.followingId !== targetUserId);
              } else {
                return [
                  ...prevFollow,
                  {
                    id: uuidv4(),
                    followerId: userId,
                    followingId: targetUserId,
                    createdAt: new Date(),
                  },
                ];
              }
            });
          }
        })
      
      
      };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }


    return (
        <div className="flex flex-row w-full min-h-screen">
          <div className="w-full p-10">
            <div className="font-bold text-2xl">Portfolio</div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex flex-row gap-1 flex-wrap">
                {dataWithFirstImage.map((item, index) => {
                  
                    if (item.userId === user?.id) {
                        return (
                          <div>
                            {slug != userId ? (
                              <div>
                                {item.status === "Publish" && (
                                  <Link key={item.id} href={`/auth/artwork/${item.id}`}> 
                                      <div className="relative group">
                                          <div className='w-[27.2rem] h-[25rem] relative overflow-hidden'>
                                              <Image key={index} src={item.firstImage} alt={item.title} fill className=" object-cover" 
                                              />
                                          </div>
                                          <div className="absolute flex items-end inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                                              <span className="text-white text-lg font-semibold p-4">{item.title}</span>
                                          </div>
                                          {user.id === currentUser?.id && (
                                              <div className="absolute flex items-start inset-0 justify-end opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                                                  <span className="text-black font-semibold p-4">{item.status}</span>
                                              </div>
                                          )}
                                      </div>
                                  </Link>
                                )}
                              </div>
                            ) : (
                              <div>
                                {item.status === "Private" && (
                                  <Link key={item.id} href={`/auth/artwork/${item.id}`}> 
                                      <div className="relative group">
                                          <div className='w-[27.2rem] h-[25rem] relative overflow-hidden'>
                                              <Image key={index} src={item.firstImage} alt={item.title} fill className=" object-cover" 
                                              />
                                          </div>
                                          <div className="absolute flex items-end inset-0 bg-gradient-to-b from-transparent to-black opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                                              <span className="text-white text-lg font-semibold p-4">{item.title}</span>
                                          </div>
                                          {user.id === currentUser?.id && (
                                              <div className="absolute flex items-start inset-0 justify-end opacity-0 group-hover:opacity-70 transition-opacity duration-300">
                                                  <span className="text-black font-semibold p-4">{item.status}</span>
                                              </div>
                                          )}
                                      </div>
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        );
                    }
                })}
            </div>
          </div>
          <div className="flex flex-col bg-[#282828] rounded-md items-center gap-5 p-10 w-[70vh]">
            <Avatar className="w-24 h-24">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback className="bg-white">
                    <FaUser className="text-black text-2xl" />
                </AvatarFallback>
            </Avatar>
            <div>{user?.name}</div>
            {currentUser?.id !== user?.id && (
                <Button onClick={() => handleFollow(slug)} 
                disabled={isFollowPending}>
                    {follow.some(
                        (item) => item.followingId === slug && userId // fix
                        ) ? (
                        <div>Unfollow</div>
                        ) : (
                        <div>Follow</div>
                    )}
                </Button>
            )}
            <div className="text-xl">
                Contact
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
          </div>
        </div>
    );
}

"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AiFillLike } from "react-icons/ai";
import axios from 'axios';
import { ArtStatus, UrlType } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link';
import { InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { FaDeviantart, FaFacebook, FaUser } from 'react-icons/fa';
import FormSuccess from '@/app/components/formSuccess';
import { MdOutlineComment } from "react-icons/md";


interface Artwork {
  id: string;
  userId: string;
  image: string;
  title: string;
  description: string;
  status: ArtStatus;
  createdAt: string;
  like: number;
  software: string;
  tags: string;
  comment: Comment[]
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

interface Comment {
  comment: string;
  like: number;
  reply: string
}

const ArtworkPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [artworks, setArtworks] = useState<Artwork>();
  const [url, setUrl] = useState<Social[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | undefined>("");
  const params = useParams();
  const slug = params.slug as string;

  const currentUser = useCurrentUser();

  const fetchData = async () => {
    try {
      const [artworkRes, userRes, urlRes] = await Promise.all([
        axios.get(`/api/artwork/${slug}`),
        axios.get('/api/user'),
        fetch('/api/social').then((res) => res.json()),
      ]);
      setArtworks(artworkRes.data);
      setUsers(userRes.data);
      setUrl(urlRes);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await axios.put(`/api/artwork/${slug}`, { id: slug });
      console.log("Update successful:", response.data.message);
      setSuccess("Publish Success");
      fetchData();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

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


  if (error) return <p className="text-red-500">{error}</p>;
  if (!artworks) return <p className="h-screen p-10 text-xl font-bold">Loading...</p>;

  const user = users.find((u) => u.id === artworks.userId);

  const formattedDate = new Date(artworks.createdAt).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });


  return (
    <div className="flex flex-row w-full h-fit gap-3 p-5">
      {/* Artwork Content */}
      <div className="w-full">
        <Image
          src={artworks.image}
          alt={artworks.title}
          width={1920}
          height={1080}
          className="object-cover"
        />
      </div>
      {/* Sidebar */}
      <div className="flex justify-center relative w-[70vh] bg-[#282828]">
        <div className="flex flex-col rounded-md items-center gap-5 p-10 absolute w-full h-full overflow-y-scroll">
          {user && (
            <Link href={`/auth/profile/${user.id}`}>
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-white">
                  <FaUser className="text-black" />
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          <div className="text-xl font-semibold">{user?.name}</div>
          <div>{user?.headline}</div>
          {artworks.userId !== currentUser?.id && <Button>Follow</Button>}

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

          <Button onClick={handleUpdateStatus}>
            {artworks.status !== "Publish" ? "Make Public" : "Published"}
          </Button>
          <FormSuccess message={success} />

          <div className=" self-start">
            <i className=' text-gray-500 font-semibold'>
              Post At {formattedDate}
            </i>
          </div>

          <p className='py-3'></p>

          <div className="flex flex-row justify-betwwen items-center gap-14">
            <div className='flex flex-row items-center gap-3'>
              <AiFillLike style={{ width: "30px", height: "30px" }} /> {artworks.like} 2099
            </div>

            <div className='flex flex-row items-center gap-3'>
              <MdOutlineComment style={{ width: "30px", height: "30px" }} /> {artworks.like} 2099
            </div>
          </div>

          <p className='py-3'></p>

          <div className=" self-start text-xl font-bold">
            Software used
            <div className='pt-3'>
              - {artworks.software}
            </div>
          </div>

          <p className='py-3'></p>

          <div className="self-start text-xl font-light">
            <div className=''>
              Comments
            </div>
                {artworks.comment && artworks.comment.length > 0 ? (
                  artworks.comment.map((item, index) => (
                    <div key={index}>
                      {item.comment || "null"} 
                    </div>
                  ))
                ) : (
                  <div>No comments available</div> 
                )}
              </div>

              <p className='py-3'></p>

              <div className=" self-start text-xl font-bold">
                  Tags
                  <div className='pt-5'>
                    <Button className='bg-[#3f3f3f] text-lg flex justify-center  hover:!bg-[#373737] hover:!text-white'>
                     # {artworks.tags}
                    </Button>
                  </div>
                </div>

        </div>
      </div>
    </div>
  );
};


export default ArtworkPage;



"use client";

import * as z from "zod"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useTransition } from 'react';
import { AiFillLike } from "react-icons/ai";
import axios from 'axios';
import { ArtStatus, UrlType, Like, Follow } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link';
import { InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { FaDeviantart, FaFacebook, FaUser } from 'react-icons/fa';
import FormSuccess from '@/app/components/formSuccess';
import { MdOutlineComment } from "react-icons/md";
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { CommentSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { comment } from "@/action/comment";
import { toggleLike } from "@/action/like";
import { toggleFollow } from "@/action/follow";
import { v4 as uuidv4 } from 'uuid';

interface Artwork {
  id: string;
  userId: string;
  image: string;
  title: string;
  description: string;
  status: ArtStatus;
  createdAt: string;
  likeCount: number;
  software: string;
  tags: string;
  comment: Comment[]
  like: Like[]
}


interface Social {
  link: string;
  id: string;
  type: UrlType;
  userId: string;
}

interface User {
  id: string;
  image: string;
  name: string;
  email: string;
  headline: string;
  like: Like[];
  followers: { id: string; name: string }[]; // Users who follow this user
  following: { id: string; name: string }[]; // Users this user is following
  followCount: number; // Number of followers
  isFollowing?: boolean; // Indicates if the current logged-in user follows this user
  comment: Comment[];
}

interface Comment {
  artId: string;
  userId: string;
  comment: string;
  like: number;
  reply: string
  user: User[];
}


const ArtworkPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [artworks, setArtworks] = useState<Artwork>();
  const [follow, setFollow] = useState<Follow[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<Social[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isLikePending, startLikeTransition] = useTransition();
  const [isFollowPending, startFollowTransition] = useTransition();
  const params = useParams();
  const slug = params.slug as string;

  const currentUser = useCurrentUser();

  const userId = currentUser?.id as string;

  const form = useForm<z.infer<typeof CommentSchema>>({
    resolver: zodResolver(CommentSchema),
    defaultValues: {
      comment: "",
    },
  });

  const onSubmit = (values: z.infer<typeof CommentSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      comment(values, userId, artworks?.id as string)
        .then((data) => {
          setError(data?.error || "");
          fetchData();
          fetchComments();
        })
        .catch(() => {
          setError('fail to add. Please try again')
        });
    });

    form.reset();
  };

  const fetchData = async () => {
    try {
      // ดึงข้อมูลพร้อมกันจาก API หลายตัว
      const [artworkRes, userRes, urlRes, followRes] = await Promise.all([
        axios.get(`/api/artwork/${slug}`).then((res) => res.data),
        axios.get('/api/user').then((res) => res.data),
        fetch('/api/social').then((res) => {
          if (!res.ok) throw new Error("Failed to fetch /api/social");
          return res.json();
        }),
        axios.get(`/api/follow`).then((res) => res.data),
      ]);
  
      // อัปเดต state ด้วยข้อมูลที่ดึงมา
      setArtworks(artworkRes);
      setUsers(userRes);
      setUrl(urlRes);
      setFollow(followRes);
    } catch (err) {
      // แสดงข้อผิดพลาดเมื่อเกิดปัญหาในการดึงข้อมูล
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      // ดึงคอมเมนต์ที่เกี่ยวข้องกับ artwork โดยใช้ artId
      const res = await axios.get(`/api/comment?artId=${artworks?.id}`);
      setComments(res.data.data);  // เซ็ตคอมเมนต์ที่ได้รับ
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
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
    fetchComments();
  }, [slug]);

  const urlIcons = {
    [UrlType.Facebook]: <FaFacebook style={{ width: "25px", height: "25px" }} />,
    [UrlType.Instagram]: <InstagramLogoIcon style={{ width: "25px", height: "25px" }} />,
    [UrlType.X]: <TwitterLogoIcon style={{ width: "25px", height: "25px" }} />,
    [UrlType.Deviantart]: <FaDeviantart style={{ width: "25px", height: "25px" }} />,
  };
  
  const GenerateUrl = (type: UrlType) => urlIcons[type] || null;
  
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5); // เพิ่มจำนวนที่จะแสดงทีละ 5
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!artworks) return <p className="h-screen p-10 text-xl font-bold">Loading...</p>;

  const creater = users.find((u) => u.id === artworks.userId);

  const userLike = artworks.like.some((item) => item.userId === userId)
  
  const formattedDate = new Date(artworks.createdAt).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const CommentItem: React.FC<{ comment: Comment; }> = ({ comment }) => {
    if(comment.artId === artworks.id) {
      const user = users.find((u) => u.id === comment.userId)
      return(
        <div>
          <div className="pb-5">
            <div className="flex flex-row items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback className="bg-white">
                  <FaUser className="text-black" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="font-semibold text-lg text-gray-500">{user?.name}</div>
                <div className="font-medium text-xs">{comment.comment || ""}</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  if (!creater) {
    return <p>Error: User not found.</p>;
  }

  const filteredComments = comments.filter((item) => item.artId === slug);

  const handleLike = async () => {
    if (isLikePending) return;
  
    startLikeTransition(async () => {
      try {
        await toggleLike({
          userId: userId,
          artworkId: artworks.id,
        });
        
        // Update local state
        setArtworks((prev) => {
          if (!prev) return undefined;
        
          const isLiked = prev.like.some((like) => like.userId === userId); // ตรวจสอบว่าผู้ใช้นี้ไลค์อยู่หรือไม่
        
          if (isLiked) {
            // ยกเลิกไลค์
            return {
              ...prev,
              like: prev.like.filter((like) => like.userId !== userId),
              likeCount: prev.likeCount - 1,
            };
          } else {
            // เพิ่มไลค์
            return {
              ...prev,
              like: [
                ...prev.like,
                {
                  id: "new-id", // สร้าง ID ใหม่หรือรับจาก backend
                  userId: userId,
                  artworkId: prev.id,
                  createdAt: new Date(),
                },
              ],
              likeCount: prev.likeCount + 1,
            };
          }
        });
        
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    });
  };

  const handleFollow = async (targetUserId: string) => {
    if (isLikePending) return;

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
  
  
  
  return (
    <div className="flex flex-row w-full h-full gap-3 p-5">
      {/* Artwork Content */}
      <div className="w-full h-full">
        <Image
          src={artworks.image}
          alt={artworks.title}
          width={1920}
          height={1080}
          className="object-cover"
        />
      </div>
      {/* Sidebar */}
      <div className="flex justify-center relative w-[70vh] bg-[#282828] h-full">
        <div className="flex flex-col rounded-md items-center gap-5 p-10 absolute w-full h-full overflow-y-scroll">
          {creater && (
            <Link href={`/auth/profile/${creater.id}`}>
              <Avatar className="w-24 h-24">
                <AvatarImage src={creater.image || ""} />
                <AvatarFallback className="bg-white">
                  <FaUser className="text-black" />
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          <div className="text-xl font-semibold">{creater?.name}</div>
          <div>{creater?.headline}</div>
          {artworks.userId !== currentUser?.id && (
           <Button
              className={`border border-white ${isLikePending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              onClick={() => handleFollow(artworks.userId)}
              disabled={isFollowPending}
            >
              {follow.some(
                (item) => item.followingId === artworks.userId && userId // fix
              ) ? (
                <div>Unfollow</div>
              ) : (
                <div>Follow</div>
              )}
            </Button>
         
          )}

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

          {artworks.status === ArtStatus.Private && (
            <Button onClick={handleUpdateStatus}>
              Publish
            </Button>
          )}
          
          <FormSuccess message={success} />

          <div className=" self-start">
            <i className=' text-gray-500 font-semibold'>
              Post At {formattedDate}
            </i>
          </div>

          <p className='py-3'></p>

          <div className="flex flex-row justify-betwwen items-center gap-14">
            <div className='flex flex-row items-center gap-3'>
              
            <button
              onClick={handleLike}
              disabled={isLikePending}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: isLikePending ? "not-allowed" : "pointer",
              }}
            >
              <AiFillLike
                style={{
                  width: "30px",
                  height: "30px",
                  color: userLike ? "gray" : "white",
                }}
              />
            </button>
              {artworks.likeCount}
            </div>

            <div className='flex flex-row items-center gap-3'>
              <MdOutlineComment style={{ width: "30px", height: "30px" }} /> {filteredComments.length}
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
            <div>
              <div className="text-gray-500 font-semibold pb-5">
                {filteredComments.length} Comments
              </div>

              {/* Filter and display comments for the current artwork */}
              {comments.length > 0 ? (
                comments
                  .filter((comment) => comment.artId === artworks.id) // Filter comments for this artwork
                  .slice(0, visibleCount)
                  .map((comment, index) => (
                    <CommentItem key={index} comment={comment}  />
                  ))
              ) : (
                <p className=" text-lg font-semibold text-gray-200">No comments yet. Be the first to comment!</p>
              )}

              {/* Show more button */}
              {visibleCount < comments.filter((comment) => comment.artId === artworks.id).length && (
                <button onClick={handleLoadMore} className="text-sm font-semibold text-gray-500">
                  Show More
                </button>
              )}
            </div>
          </div>
            <div className='w-full'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row gap-3 w-full">
                          <Input
                            placeholder='Add your comment'
                            {...field}
                            disabled={isPending}
                          />
                          <Button>
                            {isPending ? "Adding..." : "Add"}
                          </Button>
                        </div>
                      </FormItem>
                    )} />
                </form>
              </Form>
              
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



"use client";

import * as z from "zod"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { AiFillLike } from "react-icons/ai";
import axios from 'axios';
import { ArtStatus, UrlType, Like, Follow } from '@prisma/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link';
import { DotFilledIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { FaDeviantart, FaFacebook, FaUser } from 'react-icons/fa';
import FormSuccess from '@/app/components/formSuccess';
import { MdOutlineComment } from "react-icons/md";
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { CommentSchema, ReplySchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { comment } from "@/action/comment";
import { toggleLike } from "@/action/like";
import { toggleFollow } from "@/action/follow";
import { v4 as uuidv4 } from 'uuid';
import { reply } from "@/action/reply";

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
  tags: string[];
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
  id: string;
  artId: string;
  userId: string;
  comment: string;
  parentId: string | null;
  like: number;
  reply: string
  user: User[];
}

const ArtworkPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [artworks, setArtworks] = useState<Artwork>();
  const [follow, setFollow] = useState<Follow[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyVisible, setReplyVisible] = useState<{ [key: string]: boolean }>({});
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

  const formReply = useForm<z.infer<typeof ReplySchema>>({
    resolver: zodResolver(ReplySchema),
    defaultValues: {
      reply: "",
    },
  });

  const onSubmit = (values: z.infer<typeof CommentSchema>) => {
    setError("");
    setSuccess("");
    
    startTransition(() => {
      comment(values, userId, artworks?.id as string )
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

  const onReply = (commentId: string) => async (values: z.infer<typeof ReplySchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      reply(values, userId, artworks?.id as string, commentId)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          } else {
            // setSuccess("Reply added successfully.");
            fetchComments(); // โหลดคอมเมนต์ใหม่
            setReplyVisible((prev) => ({ ...prev, [commentId]: false })); // ปิดกล่องตอบกลับ
          }
        })
        .catch(() => setError("Failed to add reply. Please try again."));
    });
    formReply.reset(); // ล้างข้อมูลฟอร์ม
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
      setError("Failed to fetch data33");
      console.error("Error fetching data:", err);
    }
  };

  const fetchComments = async () => {
    try {
      // ดึงคอมเมนต์ที่เกี่ยวข้องกับ artwork โดยใช้ artId
      const res = await axios.get(`/api/comment`);
      setComments(res.data);  // เซ็ตคอมเมนต์ที่ได้รับ
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
    }
  };

console.log(artworks)
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
  



  if (error) return <p className="text-red-500">{error}</p>;
  if (!artworks) return <p className="h-screen p-10 text-xl font-bold">Loading...</p>;

  const creater = users.find((u) => u.id === artworks.userId);
  // const loadMoreReplies = () => setVisibleReplies((prev) => prev + 2);

  const userLike = artworks.like.some((item) => item.userId === userId)
  
  const formattedDate = new Date(artworks.createdAt).toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const CommentItem: React.FC<{ comment: Comment; replies: Comment[] }> = ({ comment, replies }) => {
    // const visibleRepliesRef = useRef<Record<string, number>>({}); // ใช้ useRef แทน
    const [visibleReplies, setVisibleReplies] = useState<Record<string, number>>({}); // เก็บสถานะการมองเห็นของแต่ละคอมเมนต์
    const visibleRepliesRef = useRef<Record<string, number>>({});
    const user = users.find((u) => u.id === comment.userId);
  
    // กำหนดค่าเริ่มต้นสำหรับ Reply ที่แสดง
    const initialRepliesToShow = 0;

    // const currentVisibleReplies = visibleRepliesRef.current[comment.id] || 0;
    // const getCurrentVisibleReplies = () => visibleRepliesRef.current[comment.id] || initialRepliesToShow;

    // const loadMoreReplies = () => {
    //   visibleRepliesRef.current[comment.id] = getCurrentVisibleReplies() + 2;
    // };

    // console.log(currentVisibleReplies)
    
    const currentVisibleReplies = visibleReplies[comment.id] || initialRepliesToShow;
    const loadMoreReplies = () => {
      setVisibleReplies((prev) => ({
        ...prev,
        [comment.id]: (prev[comment.id] || initialRepliesToShow) + 2,
      }));

    };
    console.log(visibleRepliesRef.current[comment.id])


    const toggleReply = (commentId: string) => {
      setReplyVisible((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    };
  
    // กรองคอมเมนต์ย่อยที่สัมพันธ์กับคอมเมนต์หลักนี้
    const filteredReplies = replies.filter((r) => r.parentId === comment.id);


  
    if(artworks.id === comment.artId) {
      return (
        <div>
          {/* คอมเมนต์หลัก */}
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

          <div
          onClick={() => toggleReply(comment.id)} // toggle เฉพาะ commentId นี้
          className="text-gray-500 cursor-pointer text-sm pb-5 flex items-center w-fit">
            <DotFilledIcon />{replyVisible[comment.id] ? "Hide" : "reply"}
          </div>
            {replyVisible[comment.id] && (
                <div className='w-full pb-5'>
                  <Form {...formReply}>
                    <form onSubmit={formReply.handleSubmit(onReply(comment.id))}>
                      <FormField
                        control={formReply.control}
                        name="reply"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-row gap-3 w-full">
                              <Input
                                placeholder='Add your reply'
                                {...field}
                                disabled={isPending}
                              />
                              <Button>
                                {isPending ? "Replying..." : "Reply"}
                              </Button>
                            </div>
                          </FormItem>
                        )} />
                    </form>
                  </Form>
                </div>
            )}
    
          {/* คอมเมนต์ย่อย */}
          <div className="ml-10">
            {filteredReplies.slice(0, currentVisibleReplies).map((reply) => {
                  const parentComment = comments.find((c) => c.id === reply.parentId);
                  const userReplyName = users.find((u) => u.id === parentComment?.userId);
                  
              return(
                <div key={reply.id} className="flex flex-row items-center gap-4 mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={users.find((u) => u.id === reply.userId)?.image || ""} />
                    <AvatarFallback className="bg-white">
                      <FaUser className="text-black" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-sm text-gray-500 flex flex-row gap-1">
                      <div>
                        {users.find((u) => u.id === reply.userId)?.name}
                      </div>
                      <div className="font-light">
                        reply to @{userReplyName?.name}
                      </div>
                    </div>
                    <div className="font-medium text-xs">{reply.comment || ""}</div>
                  </div>
                </div>
              )
          })}

            {/* ปุ่ม Load More Replies */}
            {filteredReplies.length > currentVisibleReplies && (
              <div
                onClick={loadMoreReplies}
                className="text-sm text-gray-500 cursor-pointer mb-2 flex flex-row ml-24 mt-3"
              >
                Load More Replies
              </div>
            )}
          </div>
        </div>
      );
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

  function isValidUrl(string: string) {
    try {
      // ใช้ URL constructor เพื่อตรวจสอบว่าเป็น URL ที่ถูกต้อง
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
  
  const splitImage = (inputString: string) => {
    // แยกข้อความด้วยเครื่องหมายจุลภาค
    const urls = inputString.split(',');
    
    // ตัดช่องว่างรอบๆออก และกรองเฉพาะที่เป็น URL
    return urls.map(url => url.trim()).filter(url => isValidUrl(url));
  }

  const imageUrls = splitImage(artworks.image)

  const CommentList: React.FC<{ comments: Comment[]; artworks: Artwork }> = ({ comments }) => {
  const rootComments = comments.filter((c) => c.parentId === null);

  return (
    <div >
      {rootComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={comments} // ส่งคอมเมนต์ทั้งหมดให้แต่ละ `CommentItem`
        />
      ))}
    </div>
  );
};

  
  return (
    <div className="w-full min-h-fit">
      <div className="flex flex-row w-full h-full gap-3 p-5">
        {/* Artwork Content */}
        <div className="w-full h-full">
          {imageUrls.map((artwork, index) => (
            <div key={index} className="pb-5">
              <Image
                src={artwork}
                alt={artworks.title}
                width={1920}
                height={1080}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {/* Sidebar */}
        <div className="flex justify-center relative w-[70vh] bg-[#282828]">
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

            <div className="self-start text-xl font-light w-full">
              <div>
                <div className="text-gray-500 font-semibold pb-5">
                  {filteredComments.length} Comments
                </div>

                {/* Filter and display comments for the current artwork */}
                {comments.length > 0 ? (
                    <CommentList comments={comments} artworks={artworks}  />
                ) : (
                  <p className=" text-lg font-semibold text-gray-200">No comments yet. Be the first to comment!</p>
                )}

                {/* Show more button
                {visibleCount < comments.filter((comment) => comment.artId === artworks.id).length && (
                  <button onClick={handleLoadMore} className="text-sm font-semibold text-gray-500">
                    Show More
                  </button>
                )} */}
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

                <div className="w-full">
                  <div className=" text-xl font-bold">
                      Tags
                      <div className='flex pt-5 flex-row gap-2'>
                        {artworks.tags.map((item, index) => (
                          <Link key={index} href={`/auth/search/${item}`}>
                              <Button className='bg-[#3f3f3f] text-lg flex justify-center  hover:!bg-[#373737] hover:!text-white'>
                              # {item}
                              </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                </div>

          </div>
        </div>
      </div>
    </div>
  );
};


export default ArtworkPage;



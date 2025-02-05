"use client";

import * as z from "zod";
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { SocialForm } from '@/schemas';
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { social } from "@/action/social";
import { Cross1Icon, InstagramLogoIcon, TriangleDownIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { FaDeviantart, FaFacebook } from "react-icons/fa";
import axios from "axios";
import { UrlType } from "@prisma/client";
import FormSuccess from "@/app/components/formSuccess";
import FormError from "@/app/components/formError";

interface User {
  id: string;
  image: string;
  name: string;
  email: string;
  createdAt: string;
  social: string;
}

interface Social {
  link: string;
  id: string;
  type: string;
  userId: string;
}

const EditPage = () => {
  const [user, setUser] = useState<User[]>([]);
  const [url, setUrl] = useState<Social[]>([]);
  const [placeholder, setPlaceholder] = useState("")
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const holderSocial = (placeholder: string) => {
    return placeholder === "Facebook" ? "https://www.facebook.com/pagename" : "Username";
  };

  const [availableSocials, setAvailableSocials] = useState<string[]>([
    "Facebook", 
    "Instagram", 
    "Deviantart", 
    "X"
  ]);

  const currentUser = useCurrentUser();
  const userId = currentUser?.id as string

  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      const result = await response.json();
      setUser(result);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUrl = async () => {
    try {
      const response = await fetch('/api/social');
      const result = await response.json();
      setUrl(result);
    } catch (error) {
      console.log(error);
    }
  };

  const form = useForm<z.infer<typeof SocialForm>>({
    resolver: zodResolver(SocialForm),
    defaultValues: {
      link: "",

    }
  })

  const normalizeLink = (link: string, type: UrlType): string => {
    switch (type) {
      case UrlType.Facebook:
        return link.startsWith("https://www.facebook.com/") 
          ? link 
          : `https://www.facebook.com/${link}`;
      case UrlType.Instagram:
        return link.startsWith("https://www.instagram.com/") 
          ? link 
          : `https://www.instagram.com/${link}`;
      case UrlType.Deviantart:
        return link.includes("deviantart.com") 
          ? link 
          : `https://${link}.deviantart.com`;
      case UrlType.X:
        return link.startsWith("https://twitter.com/") 
          ? link 
          : `https://twitter.com/${link}`;
      default:
        throw new Error("Invalid social media type");
    }
  };

  const onSubmit = (values: z.infer<typeof SocialForm>) => {
    setError("");
    setSuccess("");

    if(placeholder === "") {
      alert("Select social media");
      return
    }
  
    try {
      if (!availableSocials.includes(values.type)) throw new Error("Invalid social media type.");
      values.link = normalizeLink(values.link, values.type as UrlType);
  
      startTransition(() => {
        social(values, userId)
          .then((data) => {
            setError(data?.error);
            setSuccess(data?.success);
  
            setAvailableSocials((prev) => prev.filter((social) => social !== values.type));

            fetchUrl();

            setPlaceholder("")



          })
          .catch(() => setError("Failed to add social media. Please try again."));
      });
    } catch (_) {
      setError("An error occurred.");
    }
  };

  const DeleteSocial = async (urlId: string) => {
    try {
      // ส่งคำขอลบข้อมูลไปยัง API หรือฐานข้อมูล
      await axios.delete("/api/social", {
        data: { urlId, userId },
      });
  
      // อัปเดตข้อมูลใน UI หลังจากลบ
      fetchUrl(); // ดึงข้อมูลใหม่
  
      // รีเฟรช availableSocials เพื่อให้ Social ที่ถูกลบแสดงใน Dropdown
      // setAvailableSocials((prev) => {
      //   const updatedAvailableSocials = [
      //     "Facebook",
      //     "Instagram",
      //     "Deviantart",
      //     "X",
      //   ].filter(social => !url.some(item => item.type === social)); // กรองเอา social ที่ยังไม่ได้ถูกเพิ่มออก
  
      //   return updatedAvailableSocials; // ส่งค่าที่อัปเดตใหม่
      // });
  
    } catch (error) {
      console.log(error)
    }
  }

  const userUrls = url.filter(item => item.userId === userId);

  useEffect(() => {
    // ฟิลเตอร์กรองเอา social ที่ไม่ได้ถูกเพิ่มจาก `url`
    setAvailableSocials(() => [
      "Facebook",
      "Instagram",
      "Deviantart",
      "X",
    ].filter(social => !userUrls.some(item => item.type === social)));
  }, [url]);
  
  useEffect(() => {
    fetchUser();
    fetchUrl();
  }, []); // เพิ่ม dependency [] เพื่อให้เรียกใช้เพียงครั้งเดียวเมื่อ component โหลด

  

  return (
      <div className='flex flex-row justify-between items-start p-10 px-[15rem] w-full'>
      {currentUser && user.length > 0 ? (
        <>
          <div className='flex flex-col w-full'>
        <div className='flex flex-row w-full gap-3'>
          <Image 
            src={currentUser?.image || "/default-image.jpg"} 
            alt='User profile picture'
            className='w-[9rem] rounded-full'
            width={120} 
            height={120} // กำหนดความสูงให้ชัดเจน
            
          />
          {user.map((item) => {
            if (item.id === currentUser?.id) {
              return (
                <div key={item.id} className='flex flex-col items-start justify-center gap-2'>
                  <div className='text-4xl font-semibold'>
                    {item.name}
                  </div>
                  <div className='text-3xl' >
                    {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </div>
                </div>
              );
            }
            return null; // เพิ่ม return null เพื่อไม่ให้ React เตือนเรื่องการไม่คืนค่าใน map
          })}
        </div>
        <div className='flex flex-col gap-10 pt-[5rem] text-3xl'>
          <Link
            href="/auth/profile/edit"
            className={`bg-[#111111] mr-[18rem] p-5 ${
              pathname === '/auth/profile/edit' ? 'border border-[#ffffff]' : ''
            }`}
          >
              ProFile
            </Link>
            <Link
              href="/auth/profile/social"
              className={`bg-[#111111] mr-[18rem] p-5 ${
                pathname === '/auth/profile/social' ? 'border border-[#ffffff]' : ''
              }`}
            >
              Social
            </Link>
          </div>
        </div>
        <div className='flex flex-col w-full '>
          <div className='flex justify-between items-center pl-10 bg-[#7d7d7d] h-[10rem]
          text-6xl font-bold'>
            <div className='flex flex-col gap-3'>
              <div>
                Social
              </div>
              <div className='text-sm font-medium'>
                Contact & social media links available publicly
              </div>
            </div>
            <div className='pt-[3rem] pr-[2rem]'>
            <Button>
              View profile
            </Button>
            </div>
          </div>
        <div>
          <div className="pt-5 p-5">
            {url.map((items, index) => {
              if(items.userId === userId) {
                return (
                  <div key={index} className="flex flex-row justify-between">
                    <div className="flex flex-row gap-3 items-center pb-5">
                      <div>
                        {items.link?.startsWith("https://www.facebook.com/")? <FaFacebook style={{ width: "25px", height: "25px" }} /> : ""}
                        {items.link?.startsWith("https://www.instagram.com/")? <InstagramLogoIcon style={{ width: "25px", height: "25px" }} /> : ""}
                        {items.link?.startsWith("https://twitter.com/")? <TwitterLogoIcon style={{ width: "25px", height: "25px" }} /> : ""}
                        {items.link?.includes("deviantart.com")? <FaDeviantart style={{ width: "25px", height: "25px" }} /> : ""}

                      </div>
                      <Link href={items.link || ""} target="_blank"
                      className="text-blue-500 font-medium text-lg">
                        {items.link}
                      </Link>
                    </div>
                    <Button onClick={() => DeleteSocial(items.id)}>
                      <Cross1Icon style={{ width: "25px", height: "25px" }} />
                    </Button>
                </div>
                )
              }
            })}
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-row justify-center gap-3 p-10">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex justify-center">
                      <Button className="border border-white rounded-md">
                        {placeholder || <TriangleDownIcon />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      
                      {availableSocials
                        .filter(
                          (social) => !userUrls.some((item) => item.type === social) // กรอง Social ที่ยังไม่ได้เพิ่ม
                        )
                        .map((social, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => {
                              field.onChange(social); // ตั้งค่าค่าของฟอร์มเป็น social ที่เลือก
                              setPlaceholder(social); // อัปเดต placeholder ให้เป็นชื่อ social ที่เลือก
                            }}
                          >
                            {social}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />



              <FormField
                control={form.control}
                name="link"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={holderSocial(placeholder)} {...field} className="w-[25rem]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="border border-white">
                Add
              </Button>
              </div>
            </form>
          </Form>

          <FormSuccess message={success} />
          <FormError message={error} />

        </div>
        </div>
        </>
      ) : (
        <div>Loading...</div> // or a skeleton placeholder
      )}
    </div>
      
  );
}

export default EditPage;

"use client";

import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { EditForm } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { edit } from "@/action/edit";
import EditImage from "@/app/components/edit-image";
import { FaSave } from "react-icons/fa";
import FormSuccess from "@/app/components/formSuccess";
import { FaUser } from 'react-icons/fa';
import FormError from "@/app/components/formError";

interface User {
  id: string;
  image: string;
  name: string;
  email: string;
  createdAt: string;
}

const EditPage = () => {
  const [user, setUser] = useState<User[]>([]);
  const [imageUrls, setImageUrls] =useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const currentUser = useCurrentUser();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const pathname = usePathname();
  const userId = currentUser?.id as string

  const form = useForm<z.infer<typeof EditForm>>({
    resolver: zodResolver(EditForm),
    defaultValues: {
      name: "",
      headline: "",
      image: "",
    }
  })

  const onSubmit = (values: z.infer<typeof EditForm>) => {
    setError("");
    setSuccess("");

    if (Array.isArray(imageUrls)) {
      values.image = imageUrls.join(',');
    } else if (typeof imageUrls === 'string') {
      values.image = imageUrls;
    } else {
      values.image = '';
    }

    startTransition(() => {
      edit(values, userId)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        })
        .catch((error) => {
          setError("Failed to login. Please try again.");
        });
    })
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

  const handleImageChange = (newImageUrls: string | string[]) => {
    if (typeof newImageUrls === 'string') {
      setImageUrls([newImageUrls]);
      form.setValue('image', newImageUrls);
    } else if (Array.isArray(newImageUrls)) {
      setImageUrls(newImageUrls);
      form.setValue('image', newImageUrls.join(','));
    }
  };
  

  useEffect(() => {
    fetchUser();
  }, []); // เพิ่ม dependency [] เพื่อให้เรียกใช้เพียงครั้งเดียวเมื่อ component โหลด

  return (
    <div className='flex flex-row justify-between items-start p-10 px-[15rem] w-full '>
      <div className='flex flex-col w-full'>
        <div className='flex flex-row w-full gap-3'>
          <Avatar className='w-[7rem] h-[7rem]'>
              <AvatarImage src={imageUrls[0] || ''} 
              className='object-cover'/> {/* แสดงเฉพาะภาพแรก */}
              <AvatarFallback className='bg-white'>
                  <FaUser className='text-black text-[3rem]' />
              </AvatarFallback>
          </Avatar>
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
            Profile
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
        <div className='flex justify-between items-center pl-10 bg-[#4b4b4b] h-[10rem]
        text-6xl font-bold'>
          <div className='flex flex-col gap-3'>
            <div>
              Profile
            </div>
            <div className='text-sm font-medium'>
              Fill in your information to appear in search results
            </div>
          </div>
          <div className='pt-[3rem] pr-[2rem]'>
          <Button>
            View profile
          </Button>
          </div>
        </div>

        <div className='flex flex-row justify-center items-center p-10'>
            <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-row gap-[5rem]">
                <div>
                  <FormField
                    control={form.control}
                    name="name"
                    disabled={isPending}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headline"
                    disabled={isPending}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headline</FormLabel>
                        <FormControl>
                          <Input placeholder="headline" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <EditImage
                        {...field}
                        imageUrls={Array.isArray(imageUrls) ? imageUrls : [imageUrls]}
                        setImageUrls={setImageUrls}
                        handleImageChange={handleImageChange}
                        userImage={currentUser?.image}
                      />
                      <FormMessage />

                    </FormItem>

                  )}
                />
                </div>
                </div>

                <FormSuccess message={success} />
                <FormError message={error} />
                
                <Button type="submit" 
                className="border border-white"
                disabled={isPending}>
                  <FaSave />
                  Save
                </Button>
              </form>
            </Form>
            </div>
        </div>
      </div>
    </div>
  );
}

export default EditPage;

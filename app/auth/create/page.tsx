"use client";

import * as z from "zod"
import Navbar from '@/app/components/Navbar'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UploadArt } from '@/schemas'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { useCurrentUser } from "@/hooks/use-current-user"
import { upload } from "@/action/upload"
import ImageUpload from "@/app/components/image-upload";
import FormError from "@/app/components/formError";
import FormSuccess from "@/app/components/formSuccess";
import { Button } from "@/components/ui/button";

type Props = {}

const CreatePage = (props: Props) => {
  const [isPending, startTransition] = useTransition();
  const [imageUrls, setImageUrls] =useState<string[]>([]);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const user = useCurrentUser();
  const userId = user?.id as string

  const form = useForm<z.infer<typeof UploadArt>>({

    resolver: zodResolver(UploadArt),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    }
  })

  const onSubmit = (values: z.infer<typeof UploadArt>) => {
    setError("");
    setSuccess("");

    values.image = imageUrls.join(',');

    startTransition(() => {
      upload(values, userId)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        })
        .catch((error) => {
          setError("Failed to login. Please try again.");
        });
    })
  }

  const handleImageChange = () => {
    form.setValue('image', imageUrls.join(','));
    if(imageUrls.length === 0) {
      alert("Select Artwork")
      return
    }
  }
  
  return (
    <>
    <Navbar />
    <div className="flex flex-col h-screen">
        <div className='font-semibold text-2xl p-10'>Add artwork</div>
        <div className="flex flex-row justify-center gap-10" >
          <div>
            Create Artwork
            <div>
              <ImageUpload
                  imageUrls={imageUrls}
                  setImageUrls={setImageUrls}
                  handleImageChange={handleImageChange}
              />
            </div>
          </div>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input className="w-[30rem] h-[3rem]"
                       {...field}
                       disabled={isPending}
                       placeholder="what is your artwork call " />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input className="w-[30rem] h-[3rem]"
                       {...field}
                       disabled={isPending}
                       placeholder="Description " />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-5">
                  <FormError message={error} />
                  <FormSuccess message={success} />
                  </div>
                  <div className="pt-5">
                  <Button onClick={handleImageChange}  type="submit" className="w-full border border-white" disabled={isPending}>
                    Save
                  </Button>
              </div>
              </form>
            </Form>
          </div>
        </div>
    </div>
    </>
  )
}

export default CreatePage
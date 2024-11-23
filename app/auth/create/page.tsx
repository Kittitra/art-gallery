"use client";

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navbar from '@/app/components/Navbar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UploadArt } from '@/schemas';
import { upload } from '@/action/upload';
import ImageUpload from '@/app/components/image-upload';
import FormError from '@/app/components/formError';
import FormSuccess from '@/app/components/formSuccess';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Cross1Icon } from '@radix-ui/react-icons';

const CreatePage: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');

  const user = useCurrentUser();
  const userId = user?.id as string;

  const form = useForm<z.infer<typeof UploadArt>>({
    resolver: zodResolver(UploadArt),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      software: [],
      tags: [],
    },
  });

  const onSubmit = (values: z.infer<typeof UploadArt>) => {
    setError('');
    setSuccess('');

    values.image = imageUrls.join(',');

    startTransition(() => {
      upload(values, userId)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        })
        .catch(() => {
          setError('Failed to upload. Please try again.');
        });
    });
  };

  const handleImageChange = () => {
    form.setValue('image', imageUrls.join(','));
    if (imageUrls.length === 0) {
      alert('Select Artwork');
    }
  };

  const addSoftware = (software: string) => {
    const currentSoftware = form.getValues('software') || [];
    if (!currentSoftware.includes(software)) {
      form.setValue('software', [...currentSoftware, software]);
    }
  };
  const removeSoftware = (index: number) => {
    const currentSoftware = form.getValues('software') || [];
    const updatedSoftware = currentSoftware.filter((_, i) => i !== index);
    form.setValue('software', updatedSoftware);
  };

  const addTags = (Tags: string) => {
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(Tags)) {
      form.setValue('tags', [...currentTags, Tags]);
    }
  };
  const removeTags= (index: number) => {
    const currentTags = form.getValues('tags') || [];
    const updatedTags = currentTags.filter((_, i) => i !== index);
    form.setValue('tags', updatedTags);
  };

  const formLabelStyle = 'text-3xl font-semibold'
  const spanStyle = 'text-sm font-meduim'
  return (
    <>
      <Navbar />
      <div className="flex flex-col h-full justify-between">
        <div className="font-semibold text-2xl p-10">Add Artwork</div>
        <div className="flex flex-row justify-center gap-10">
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
          <div className='text-xl font-semibold p-10'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex flex-col'>
                        <FormLabel className={formLabelStyle} >Title</FormLabel>
                        <FormLabel className='' >Add The art work name</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          className="w-[30rem] h-[3rem]"
                          {...field}
                          disabled={isPending}
                          placeholder="What is your artwork called?"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className='py-5'></p>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex flex-col'>
                        <FormLabel className={formLabelStyle} >Description</FormLabel>
                        <FormLabel className='' >Discript your art work</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          className="w-[30rem] h-[3rem]"
                          {...field}
                          disabled={isPending}
                          placeholder="Description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className='py-5'></p>

                <FormField
                  control={form.control}
                  name="software"
                  render={({ field }) => (
                    <FormItem className="pt-10">
                      <div className='flex flex-col'>
                        <FormLabel className={formLabelStyle} >Software used</FormLabel>
                        <FormLabel className='' >Add your software used</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          className="w-[27rem] h-[3rem]"
                          disabled={isPending}
                          placeholder="Type and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                              e.preventDefault();
                              addSoftware(e.currentTarget.value.trim());
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </FormControl>
                      <div className="pt-5 flex flex-row gap-3">
                        {field.value?.map((item: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 border border-white w-fit p-2 rounded-md">
                            <span className={spanStyle}>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeSoftware(index)}
                              className="text-red-500"
                            >
                              <Cross1Icon />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className='py-5'></p>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="pt-10">
                      <div className='flex flex-col'>
                        <FormLabel className={formLabelStyle} >Tags</FormLabel>
                        <FormLabel className='' >Add tags</FormLabel>
                      </div>
                      <FormControl>
                        <Input
                          className="w-[27rem] h-[3rem]"
                          disabled={isPending}
                          placeholder="Type and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                              e.preventDefault();
                              addTags(e.currentTarget.value.trim());
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </FormControl>
                      <div className="pt-5 flex flex-row gap-3">
                        {field.value?.map((item: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 border border-white w-fit p-2 rounded-md">
                            <span className={spanStyle}>{item}</span>
                            <button
                              type="button"
                              onClick={() => removeTags(index)}
                              className="text-red-500"
                            >
                              <Cross1Icon />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className='py-5'></p>

                <div className="pt-10">
                  <FormError message={error} />
                  <FormSuccess message={success} />
                </div>
                <div className="pt-5">
                  <Button
                    onClick={handleImageChange}
                    type="submit"
                    className="w-full border border-white"
                    disabled={isPending}
                  >
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePage;

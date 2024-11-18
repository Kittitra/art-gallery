"use client"
import * as z from "zod"

import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema } from "@/schemas";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import FormError from "@/app/components/formError";
import FormSuccess from "@/app/components/formSuccess";
import Link from "next/link";
import { register } from "@/action/register";
 
export default function Register() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values)
        .then((data) => {
          setError(data.error);
          setSuccess(data.success);
        })
    });
  }

  return(
    <div className="flex justify-center items-center w-full h-screen">
      <Card className="flex justify-around items-center w-[605px] flex-col h-fit py-7">
        <CardHeader className="flex justify-center items-center pb-10">
          <h1 className="text-5xl font-semibold pb-2">
            Register
          </h1>
          <div className=" font-light text-slate-500">
            Create your account
          </div>
        </CardHeader>
        <CardContent className="w-full flex justify-center flex-col items-center">
            
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-3" >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input className="w-[30rem] h-[3rem]"
                       {...field}
                       disabled={isPending}
                       placeholder="james Lee" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input className="w-[30rem] h-[3rem]"
                       {...field}
                       disabled={isPending}
                       type="email"
                       placeholder="james@gmail.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="pb-5">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input className="w-[30rem] h-[3rem]"
                       {...field}
                       disabled={isPending}
                       type="password"
                       placeholder="******" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSuccess message={success} />
              <FormError message={error} />
              <Button className="w-full p-7 text-xl"
                disabled={isPending}
                type="submit" >Sign In</Button>
            </form>
          </Form> 

          <div className="flex items-center w-full py-[2rem]">
              <div className="border-t border-1 border-black flex-grow"></div>
              <div className="px-3 text-black font-meduim text-xl">OR</div>
              <div className="border-t border-1 border-black flex-grow"></div>
          </div>

          <Button className="bg-[#161616] w-[30rem] h-[4rem] hover:bg-[#4a4a4a]"
            onClick={() => signIn()}>
              <FcGoogle className="h-7 w-7" />
              SignIn with Google
          </Button>
            
        </CardContent>
        <CardFooter className="font-light">
          <Link className=" cursor-pointer pb-1 border-b-2 border-transparent hover:border-b-black transition duration-150"
          href="/auth/login">
            Already have an account
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

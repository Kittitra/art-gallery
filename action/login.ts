"use server";

import * as z from "zod"
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validateFields = LoginSchema.safeParse(values);

    if (!validateFields.success) {
        return {error: "invalid field!"};
    }
    
    const {email, password} = validateFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/",
        })

    } catch(error) {
        if(error instanceof AuthError) {
            switch(error.type) {
                case "CredentialsSignin":
                    return {error: "invalid Credentails"}
                default:
                    return {error: "something went wrong"}
            }
        }

        throw error;
    }

    return {success: "Login success"}
}
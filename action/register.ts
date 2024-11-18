"use server";

import * as z from "zod"
import bcrypt from "bcryptjs"
import { RegisterSchema } from "@/schemas";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validateFields = RegisterSchema.safeParse(values);

    if (!validateFields.success) {
        return {error: "invalid field!"};
    }

    const {email, password, name} = validateFields.data;
    const hashPassword = await bcrypt.hash(password, 10);

    const exitingUser = await getUserByEmail(email)

    if(exitingUser) {
        return {error: "Email already in use!"}
    }

    await db.user.create({
        data: {
            email,
            name,
            password: hashPassword
        }
    })

    return {success: "Register Success"}
}
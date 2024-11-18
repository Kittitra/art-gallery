"use server";

import { db } from "@/lib/db";
import { EditForm } from "@/schemas";
import * as z from "zod";

export const edit = async (values: z.infer<typeof EditForm>, userId: string) => {
    const validateFields = EditForm.safeParse(values);
    if(!validateFields.success) {
        return {error: "invalid fields"}
    }

    const {name, headline, image} = validateFields.data;

    if (!userId) {
        return { error: "User ID is required." };
    }

    try {
        await db.user.update({
            where: {
                id: userId,
            },
            data: {
                name,
                headline,
                image
            }
        })

    }catch (error){
        console.log("We have a problem: ", error)
    }

    return {success: "Upload Info Complete"}

}
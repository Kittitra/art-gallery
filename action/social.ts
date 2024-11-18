"use server";

import { db } from "@/lib/db";
import { SocialForm } from "@/schemas";
import { UrlType } from "@prisma/client";
import * as z from "zod";

export const social = async (values: z.infer<typeof SocialForm>, userId: string) => {
    const validateFields = SocialForm.safeParse(values);
    if(!validateFields.success) {
        return {error: "invalid fields"}
    }

    const {link, type} = validateFields.data;

    if (!userId) {
        return { error: "User ID is required." };
    }

    await db.social.create({
        data: {
            link,
            userId,
            type: type as UrlType,
            
        }
    })

    return {success: "Add url Complete"}

}
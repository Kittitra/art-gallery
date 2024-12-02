"use server";

import { db } from "@/lib/db";
import { CommentSchema } from "@/schemas";
import { UrlType } from "@prisma/client";
import * as z from "zod";

export const comment = async (values: z.infer<typeof CommentSchema>, userId: string, artId: string) => {
    const validateFields = CommentSchema.safeParse(values);
    if(!validateFields.success) {
        return {error: "invalid fields"}
    }

    const {comment} = validateFields.data;

    if (!userId) {
        return { error: "User ID is required." };
    }

    await db.comment.create({
        data: {
            comment,
            userId,
            artId
        }
    })

    return {success: "Add Comment Complete"}

}
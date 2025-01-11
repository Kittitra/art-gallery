"use server";

import { db } from "@/lib/db";
import { ReplySchema } from "@/schemas";
import { UrlType } from "@prisma/client";
import * as z from "zod";

export const reply = async (values: z.infer<typeof ReplySchema>, userId: string, artId: string, commentId: string) => {
    const validateFields = ReplySchema.safeParse(values);
    if(!validateFields.success) {
        return {error: "invalid fields"}
    }

    const {reply} = validateFields.data;

    if (!userId) {
        return { error: "User ID is required." };
    }

    await db.comment.create({
        data: {
            comment: reply,
            userId,
            artId,
            parentId: commentId || null,
        }
    })


}
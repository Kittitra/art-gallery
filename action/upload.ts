"use server";

import { db } from "@/lib/db";
import { UploadArt } from "@/schemas";
import * as z from "zod";

export const upload = async (values: z.infer<typeof UploadArt>, userId: string) => {
    const validateFields = UploadArt.safeParse(values);
    if(!validateFields.success) {
        return {error: "invalid fields"}
    }

    const {title, description, image, tags, software} = validateFields.data;

    await db.artwork.create({
        data: {
            title,
            description,
            image,
            userId,
            tags,
            software
        },
    })

    return {success: "Upload Artwork Complete"}

}
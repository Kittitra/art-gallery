"use server";

import { db } from "@/lib/db";

export async function toggleLike({
  userId,
  artworkId,
}: {
  userId: string;
  artworkId: string;
}) {
  // ตรวจสอบว่าผู้ใช้เคยกด Like หรือยัง
  const existingLike = await db.like.findFirst({
    where: { userId, artworkId },
  });

  if (existingLike) {
    // ยกเลิก Like
    await db.like.delete({
      where: { id: existingLike.id },
    });

    await db.artwork.update({
      where: { id: artworkId },
      data: { likeCount: { decrement: 1 } },
    });

    return { success: true, message: "Like removed." };
  } else {
    // เพิ่ม Like
    await db.like.create({
      data: { userId, artworkId },
    });

    await db.artwork.update({
      where: { id: artworkId },
      data: { likeCount: { increment: 1 } },
    });

    return { success: true, message: "Like added." };
  }
}

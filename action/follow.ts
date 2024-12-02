"use server";

import { db } from "@/lib/db";

export async function toggleFollow({ followingId, followerId }: { followingId: string, followerId: string }) {
  // ตรวจสอบว่าผู้ใช้เคยกด Follow หรือยัง
  const existingFollow = await db.follow.findFirst({
    where: { followerId, followingId },
  });

  if (existingFollow) {
    // ยกเลิกการติดตาม
    await db.follow.delete({
      where: { id: existingFollow.id },
    });

    // ลดจำนวนผู้ติดตาม
    await db.user.update({
      where: { id: followingId },
      data: { followCount: { decrement: 1 } },
    });

    return { success: true, message: "Follow removed." };
  } else {
    // เพิ่มการติดตาม
    await db.follow.create({
      data: { followingId, followerId },
    });

    // เพิ่มจำนวนผู้ติดตาม
    await db.user.update({
      where: { id: followingId },
      data: { followCount: { increment: 1 } },
    });

    return { success: true, message: "Follow added." };
  }
}

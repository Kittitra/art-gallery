import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ปิดแคช API
// GET: Fetch follow by followingId
export async function GET() {
    try {
        const follow = await db.follow.findMany(); // ดึงข้อมูลทั้งหมดจากตาราง artwork
  
        return NextResponse.json(follow);
    } catch (error) {
        console.error("Error fetching follow:", error); // แสดงข้อผิดพลาดใน console
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }
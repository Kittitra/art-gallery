import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   try {
//     // ดึง query parameters: page และ limit
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get("page") || "1", 10); // ค่าเริ่มต้นคือหน้า 1
//     const limit = parseInt(searchParams.get("limit") || "10", 10); // ค่าเริ่มต้นคือ 10 รายการต่อหน้า

//     // คำนวณ offset
//     const offset = (page - 1) * limit;

//     // ดึงข้อมูล comment และจำนวนทั้งหมด
//     const [comments, total] = await Promise.all([
//       db.comment.findMany({
//         skip: offset,
//         take: limit,
//         orderBy: { createdAt: "desc" },
//         include: {user: true} // เรียงตามเวลาที่สร้าง
//       }),
//       db.comment.count(), // นับจำนวน comment ทั้งหมด
//     ]);

//     // ส่งผลลัพธ์กลับไป
//     return NextResponse.json({
//       data: comments,
//       meta: {
//         currentPage: page,
//         perPage: limit,
//         totalPages: Math.ceil(total / limit),
//         totalItems: total,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching comments:", error); // แสดงข้อผิดพลาดใน console
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }


export async function GET() {
  try {
      const artwork = await db.comment.findMany(); // ดึงข้อมูลทั้งหมดจากตาราง artwork

      return NextResponse.json(artwork);
  } catch (error) {
      console.error("Error fetching Artwork:", error); // แสดงข้อผิดพลาดใน console
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ปิดแคช API
// GET: ดึงข้อมูลผู้ใช้ตาม id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const user = await db.user.findUnique({
            where: { id },
        });

        // ตรวจสอบว่าผู้ใช้ที่ค้นหามีอยู่หรือไม่
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error); // แสดงข้อผิดพลาดใน console
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

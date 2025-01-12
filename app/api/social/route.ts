import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: ดึงข้อมูลผู้ใช้ตาม id
export async function GET() {

    try {
        const social = await db.social.findMany();

        // ตรวจสอบว่าผู้ใช้ที่ค้นหามีอยู่หรือไม่
        if (!social) {
            return NextResponse.json({ message: 'Social not found' }, { status: 404 });
        }

        return NextResponse.json(social);
    } catch (error) {
        console.error('Error fetching Social:', error); // แสดงข้อผิดพลาดใน console
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const body = await request.json();
    const { urlId } = body;

    try {
        const deletedReservations = await db.social.delete({
            where: { id: urlId },
        });

        return NextResponse.json({ message: 'URL deleted successfully', deletedReservations });
    } catch (error) {
        console.log("Error deleting URL", error);
        return NextResponse.error();
    }
}
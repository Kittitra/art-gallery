import { db } from "@/lib/db";
import { ArtStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ปิดแคช API
export async function GET() {
  try {
    const artwork = await db.artwork.findMany(); // ดึงข้อมูลทั้งหมดจากตาราง artwork

    const response = NextResponse.json(artwork, { status: 200 });

    // ปิดแคช
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error fetching Artwork:", error); // แสดงข้อผิดพลาดใน console
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json();
      const { id } = body;
  
      const update = await db.artwork.update({
        where: { id },
        data: {
          status: ArtStatus.Publish
        }
      });
  
      return NextResponse.json({ message: 'Status updated successfully', update });
    } catch (error) {
      console.error("Error updating status:", error);
      return NextResponse.json({ message: 'Failed to update status' }, { status: 500 });
    }
  }
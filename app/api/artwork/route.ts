import { db } from "@/lib/db";
import { ArtStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
      const artwork = await db.artwork.findMany(); // ดึงข้อมูลทั้งหมดจากตาราง artwork

      return NextResponse.json(artwork);
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
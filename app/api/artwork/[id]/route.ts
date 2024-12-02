import { db } from "@/lib/db";
import { ArtStatus } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
  }

  try {
    const artwork = await db.artwork.findUnique({
      where: { id },
      include: { comment: true, like: true }, // รวมข้อมูล Comment
    });

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    return NextResponse.json(artwork, { status: 200 });
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// PUT API
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
  }

  try {
    const artwork = await db.artwork.update({
      where: { id },
      data: {
        status: ArtStatus.Publish, // ใช้ Enum Prisma
      },
    });

    return NextResponse.json(artwork, { status: 200 });
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE API
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
  }

  try {
    await db.artwork.delete({ where: { id } });
    return NextResponse.json({ message: "Artwork deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
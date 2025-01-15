/* eslint-disable */

import { db } from "@/lib/db";
import { ArtStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  id?: string
}



export async function GET(
  req: NextRequest, // ใช้ NextRequest ซึ่ง Next.js ให้มาแทน Request
  context: { params: Params }
) {
  const { id } = context.params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ message: "Invalid or missing ID" }, { status: 400 });
  }

  try {
    const artwork = await db.artwork.findUnique({
      where: { id },
      include: { comment: true, like: true },
    });

    if (!artwork) {
      return NextResponse.json(
        { error: "Artwork not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(artwork, { status: 200 });

  } catch (error: unknown) {
    console.error(`[GET Error]: ID=${id}`, error);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT API
export async function PUT(_req: Request, { params }: { params: { id: string } }) {
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
  } catch (error: unknown) {
    console.error("PUT Error:", error);

    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE API
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Invalid or missing ID" }, { status: 400 });
  }

  try {
    await db.artwork.delete({ where: { id } });
    return NextResponse.json({ message: "Artwork deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("DEL Error:", error);

    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message || "Internal Server Error" }, { status: 500 });
  }
}
/* eslint-enable */
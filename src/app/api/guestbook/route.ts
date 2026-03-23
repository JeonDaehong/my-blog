import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await prisma.guestbookEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { nickname, message, emoji } = await req.json();

  if (!nickname?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "닉네임과 메시지를 입력하세요" }, { status: 400 });
  }

  if (nickname.length > 20 || message.length > 500) {
    return NextResponse.json({ error: "닉네임 20자, 메시지 500자 이내" }, { status: 400 });
  }

  const entry = await prisma.guestbookEntry.create({
    data: {
      nickname: nickname.trim(),
      message: message.trim(),
      emoji: emoji || "👋",
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

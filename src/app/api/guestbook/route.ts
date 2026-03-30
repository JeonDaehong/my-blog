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

const ALLOWED_EMOJIS = ["👋", "😊", "🔥", "💜", "🚀", "⭐", "🎉"];

function sanitize(str: string): string {
  return str.replace(/[<>&"']/g, (c) => {
    const map: Record<string, string> = { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" };
    return map[c] || c;
  });
}

export async function POST(req: NextRequest) {
  const { nickname, message, emoji } = await req.json();

  if (!nickname?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "닉네임과 메시지를 입력하세요" }, { status: 400 });
  }

  if (nickname.trim().length > 20 || message.trim().length > 500) {
    return NextResponse.json({ error: "닉네임 20자, 메시지 500자 이내" }, { status: 400 });
  }

  const safeEmoji = ALLOWED_EMOJIS.includes(emoji) ? emoji : "👋";

  const entry = await prisma.guestbookEntry.create({
    data: {
      nickname: sanitize(nickname.trim()),
      message: sanitize(message.trim()),
      emoji: safeEmoji,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { translateToEnglish } from "@/lib/translate";
import { generateSlug } from "@/lib/slug";

const DEFAULT_LIMIT = 10;

export async function GET(req: NextRequest) {
  const isAdmin = await isAuthenticated();
  const { searchParams } = req.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10)));
  const skip = (page - 1) * limit;
  const q = searchParams.get("q")?.trim() || null;

  // Admin fetches all posts without pagination (for the admin dashboard list)
  if (isAdmin && searchParams.get("all") === "true") {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    return NextResponse.json(posts);
  }

  const searchFilter = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { titleEn: { contains: q, mode: "insensitive" as const } },
          { excerpt: { contains: q, mode: "insensitive" as const } },
          { excerptEn: { contains: q, mode: "insensitive" as const } },
          { content: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where = {
    ...(isAdmin ? {} : { published: true }),
    ...searchFilter,
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "제목과 내용은 필수입니다" }, { status: 400 });
  }

  const baseSlug = body.slug || generateSlug(body.title);

  const existing = await prisma.post.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? generateSlug(body.title) : baseSlug;

  const titleEn = body.titleEn || (await translateToEnglish(body.title));
  const contentEn = body.contentEn || (await translateToEnglish(body.content));
  const excerptEn =
    body.excerptEn || (body.excerpt ? await translateToEnglish(body.excerpt) : null);

  const post = await prisma.post.create({
    data: {
      title: body.title,
      titleEn: titleEn || null,
      slug,
      content: body.content,
      contentEn: contentEn || null,
      excerpt: body.excerpt || null,
      excerptEn: excerptEn || null,
      coverImage: body.coverImage || null,
      published: body.published ?? false,
      categoryId: body.categoryId || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath(`/posts/${slug}`);
  revalidatePath("/category", "page");

  return NextResponse.json(post, { status: 201 });
}

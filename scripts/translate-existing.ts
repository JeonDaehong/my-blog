import { PrismaClient } from "@prisma/client";
import translate from "google-translate-api-x";

const prisma = new PrismaClient();

async function toEn(text: string): Promise<string> {
  if (!text) return "";
  try {
    const res = await translate(text, { from: "ko", to: "en" });
    return res.text;
  } catch (e) {
    console.error("translate error:", e);
    return "";
  }
}

async function main() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const nameEn = cat.nameEn || await toEn(cat.name);
    const descEn = cat.description ? await toEn(cat.description) : null;
    await prisma.category.update({
      where: { id: cat.id },
      data: { nameEn, descriptionEn: descEn },
    });
    console.log(`"${cat.name}" -> "${nameEn}" | "${cat.description}" -> "${descEn}"`);
  }

  const posts = await prisma.post.findMany();
  for (const post of posts) {
    if (post.titleEn && post.contentEn) {
      console.log(`"${post.title}" -> already translated, skip`);
      continue;
    }
    const titleEn = post.titleEn || await toEn(post.title);
    const contentEn = post.contentEn || await toEn(post.content);
    const excerptEn = post.excerpt && !post.excerptEn ? await toEn(post.excerpt) : post.excerptEn;
    await prisma.post.update({
      where: { id: post.id },
      data: { titleEn, contentEn, excerptEn },
    });
    console.log(`"${post.title}" -> "${titleEn}"`);
  }

  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const cats = await p.category.findMany();
  for (const c of cats) {
    console.log(`[Cat] ${c.name} -> ${c.nameEn} | ${c.description} -> ${(c as any).descriptionEn}`);
  }
}
main().then(() => p.$disconnect());

// DB 의 현재 본문을 _workspace/current/<slug>.md 로 내린다. 검사용.
import { PrismaClient } from '@prisma/client'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
const prisma = new PrismaClient()
const posts = await prisma.post.findMany({ select: { slug: true, title: true, excerpt: true, content: true } })
mkdirSync(join('_workspace', 'current'), { recursive: true })
for (const x of posts) {
  if (x.content.length < 100) continue
  const head = `<!--TITLE-->${x.title}\n<!--EXCERPT-->${x.excerpt ?? ''}\n`
  writeFileSync(join('_workspace', 'current', `${x.slug}.md`), head + x.content, 'utf-8')
}
console.log(`${posts.length}편 중 본문 있는 글 내려받음`)
await prisma.$disconnect()

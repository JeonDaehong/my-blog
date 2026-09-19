// 글 하나를 DB에서 꺼내 파일로 저장한다. 윤문 도구(humanize-korean)에 넘기기 위한 입력용.
//   node scripts/humanize/export-post.mjs              → 글 목록
//   node scripts/humanize/export-post.mjs <slug>       → _workspace/posts/<slug>/original.md 저장
//   node scripts/humanize/export-post.mjs --all        → 본문 100자 이상인 글 전부 내보내기
import { PrismaClient } from '@prisma/client'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()
const slug = process.argv[2]

if (!slug) {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: { slug: true, title: true, blog: true, published: true, content: true, contentEn: true, createdAt: true },
  })
  for (const p of posts) {
    console.log(`${p.createdAt.toISOString().slice(0, 10)} | ${p.blog.padEnd(5)} | ${p.published ? 'pub  ' : 'draft'} | ${String(p.content.length).padStart(6)}자 | en:${p.contentEn ? 'y' : 'n'} | ${p.slug} | ${p.title}`)
  }
} else if (slug === '--all') {
  const posts = await prisma.post.findMany({ where: {}, select: { slug: true, title: true, content: true } })
  for (const post of posts) {
    if (post.content.length < 100) continue
    const dir = join('_workspace', 'posts', post.slug)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'original.md'), post.content, 'utf-8')
    console.log(`${post.slug} (${post.content.length}자)`)
  }
} else {
  const post = await prisma.post.findUnique({ where: { slug }, select: { title: true, content: true, blog: true } })
  if (!post) {
    console.error(`글을 찾을 수 없음: ${slug}`)
    process.exit(1)
  }
  const dir = join('_workspace', 'posts', slug)
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'original.md')
  writeFileSync(file, post.content, 'utf-8')
  console.log(`${file} (${post.content.length}자) — ${post.title}`)
}

await prisma.$disconnect()

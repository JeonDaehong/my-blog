// 윤문된 파일을 DB에 다시 쓴다. 반드시 diff를 눈으로 확인한 뒤 실행할 것.
//   node scripts/humanize/import-post.mjs <slug> <file> [--no-translate]
// - <!-- HUMANIZE-SUMMARY --> 주석 블록은 제거하고 저장한다.
// - 교체 전 본문은 _workspace/posts/<slug>/backup-<timestamp>.md 에 남긴다.
// - 영어 본문(contentEn)이 있던 글은 새 본문으로 다시 번역한다(문단 단위 분할). 번역 실패 시 기존 영어 본문을 유지한다. --no-translate 면 contentEn 을 비운다.
import { PrismaClient } from '@prisma/client'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import translate from 'google-translate-api-x'

const [slug, file, ...flags] = process.argv.slice(2)
if (!slug || !file) {
  console.error('사용법: node scripts/humanize/import-post.mjs <slug> <file> [--no-translate]')
  process.exit(1)
}
const noTranslate = flags.includes('--no-translate')

const prisma = new PrismaClient()
const post = await prisma.post.findUnique({ where: { slug }, select: { id: true, content: true, contentEn: true } })
if (!post) {
  console.error(`글을 찾을 수 없음: ${slug}`)
  process.exit(1)
}

let content = readFileSync(file, 'utf-8')
  .replace(/\n*<!--\s*HUMANIZE-SUMMARY[\s\S]*?-->\s*$/m, '')
  .replace(/\r\n/g, '\n')
  .trimEnd() + '\n'

if (!content.trim()) {
  console.error('본문이 비어 있음. 중단.')
  process.exit(1)
}

const dir = join('_workspace', 'posts', slug)
mkdirSync(dir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backup = join(dir, `backup-${stamp}.md`)
writeFileSync(backup, post.content, 'utf-8')

// 긴 글은 문단 단위로 4000자씩 잘라 순서대로 번역한다 (한 번에 보내면 서버가 거부한다)
async function translateLong(text) {
  const SEP = '\n\n'
  const chunks = []
  let cur = ''
  for (const para of text.split(SEP)) {
    if (cur && cur.length + para.length > 4000) { chunks.push(cur); cur = '' }
    cur = cur ? cur + SEP + para : para
  }
  if (cur) chunks.push(cur)
  const out = []
  for (const c of chunks) out.push((await translate(c, { from: 'ko', to: 'en', forceBatch: false })).text)
  return out.join(SEP)
}

let contentEn = post.contentEn
let enStatus = post.contentEn ? '유지(번역 안 함)' : '없음(유지)'
if (post.contentEn && !noTranslate) {
  try {
    contentEn = await translateLong(content)
    enStatus = '재번역'
  } catch (e) {
    console.error('번역 실패, 기존 contentEn 유지:', e?.message ?? e)
    enStatus = '번역 실패 → 기존 영어 본문 유지'
  }
} else if (post.contentEn && noTranslate) {
  contentEn = null
  enStatus = '비움'
}

await prisma.post.update({ where: { id: post.id }, data: { content, contentEn } })
await prisma.$disconnect()

console.log(`저장 완료: ${slug}`)
console.log(`  본문 ${post.content.length}자 → ${content.length}자`)
console.log(`  백업: ${backup}`)
console.log(`  contentEn: ${enStatus}`)
console.log('  ISR 60초라 사이트 반영은 1분 안에 됩니다.')

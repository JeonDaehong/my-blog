// 글 하나의 본문을 영어로 번역해 contentEn 에 넣는다.
//   node scripts/humanize/translate-post.mjs <slug> [<slug> ...]
//
// 코드 블록·인라인 코드·URL·이미지·링크 주소는 자리표시자로 빼두고 번역한 뒤 되돌린다.
// 번역기에 그대로 넘기면 코드 안의 식별자까지 번역돼서 글이 망가진다.
import { PrismaClient } from '@prisma/client'
import translate from 'google-translate-api-x'

const slugs = process.argv.slice(2)
if (!slugs.length) {
  console.error('사용법: node scripts/humanize/translate-post.mjs <slug> [<slug> ...]')
  process.exit(1)
}

// 번역기가 건드리면 안 되는 것들. 긴 것부터 빼낸다.
const GUARDS = [
  /```[\s\S]*?```/g,          // 코드 블록
  /!\[[^\]]*\]\([^)]*\)/g,    // 이미지 (alt 는 뒤에서 따로 번역)
  /\[[^\]]*\]\([^)]*\)/g,     // 링크
  /`[^`\n]+`/g,               // 인라인 코드
  /https?:\/\/\S+/g,          // 맨 URL
]

function protect(text) {
  const store = []
  let out = text
  for (const rx of GUARDS) {
    out = out.replace(rx, m => {
      store.push(m)
      return ` @@${store.length - 1}@@ `
    })
  }
  return { out, store }
}

function restore(text, store) {
  // 번역기가 공백이나 대소문자를 흔들 수 있어 느슨하게 되돌린다
  return text.replace(/@\s*@\s*(\d+)\s*@\s*@/g, (_, i) => store[Number(i)] ?? '')
}

async function translateChunks(text) {
  const SEP = '\n\n'
  const chunks = []
  let cur = ''
  for (const para of text.split(SEP)) {
    if (cur && cur.length + para.length > 3500) { chunks.push(cur); cur = '' }
    cur = cur ? cur + SEP + para : para
  }
  if (cur) chunks.push(cur)

  const out = []
  for (let i = 0; i < chunks.length; i++) {
    const r = await translate(chunks[i], { from: 'ko', to: 'en', forceBatch: false })
    out.push(r.text)
    process.stdout.write(`  ${i + 1}/${chunks.length}\r`)
  }
  return out.join(SEP)
}

const prisma = new PrismaClient()

for (const slug of slugs) {
  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true, content: true } })
  if (!post) { console.error(`글을 찾을 수 없음: ${slug}`); continue }

  const { out, store } = protect(post.content.replace(/\r\n/g, '\n'))
  console.log(`${slug} : ${post.content.length}자, 보호 ${store.length}곳`)

  let en
  try {
    en = restore(await translateChunks(out), store)
  } catch (e) {
    console.error(`  번역 실패: ${e?.message ?? e}`)
    continue
  }

  // 되돌리지 못한 자리표시자가 있으면 저장하지 않는다
  const left = (en.match(/@@\d+@@/g) ?? []).length
  const fence = (en.match(/```/g) ?? []).length / 2
  const koFence = (post.content.match(/```/g) ?? []).length / 2
  if (left || fence !== koFence) {
    console.error(`  중단: 자리표시자 잔여 ${left}, 코드블록 ${koFence} → ${fence}`)
    continue
  }

  await prisma.post.update({ where: { id: post.id }, data: { contentEn: en } })
  console.log(`  저장 완료 ${en.length}자 (코드블록 ${fence}개 유지)`)
}

await prisma.$disconnect()

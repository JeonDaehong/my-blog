// 글 하나의 본문을 영어로 번역해 contentEn 에 넣는다.
//   node scripts/humanize/translate-post.mjs <slug> [<slug> ...]
//
// 코드 블록·인라인 코드·URL·이미지·링크 주소는 자리표시자로 빼두고 번역한 뒤 되돌린다.
// 번역기에 그대로 넘기면 코드 안의 식별자까지 번역돼서 글이 망가진다.
import { PrismaClient } from '@prisma/client'
import translate from 'google-translate-api-x'

const argv = process.argv.slice(2)
const forceMeta = argv.includes('--meta')      // 제목·요약 번역을 다시 만든다
const slugs = argv.filter(a => !a.startsWith('--'))
if (!slugs.length) {
  console.error('사용법: node scripts/humanize/translate-post.mjs [--meta] <slug> [<slug> ...]')
  console.error('  --meta : 제목과 요약의 영문본도 다시 만든다 (기본은 본문만)')
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

// 번역기가 흔들어놓은 마크다운을 되돌린다. 자리표시자를 끼웠다 빼면서 생기는 흔적들이다.
function tidy(text) {
  return text
    // "#2. Upstream" 처럼 # 뒤 공백이 먹히면 제목이 아니게 된다
    .replace(/^(#{1,6})([^#\s])/gm, '$1 $2')
    // 보호 구간 양옆에서 강조 표시가 쪼개지는 경우 : "**foo** ** `bar` ** **baz"
    .replace(/\*\* +\*\*/g, ' ')
    .replace(/\*{4,}/g, '**')
    // 줄 끝에 남는 공백
    .replace(/[ 	]+$/gm, '')
}

// 링크 표시 문구는 보호 구간 안에 있어서 번역되지 않는다. 주소는 그대로 두고 문구만 옮긴다.
async function translateLinkText(text) {
  const seen = new Map()
  const links = [...text.matchAll(/\[([^\]]*[가-힣][^\]]*)\]\((?!http)([^)]*)\)/g)]
  for (const [, label] of links) {
    if (seen.has(label)) continue
    try {
      const r = await translate(label, { from: 'ko', to: 'en', forceBatch: false })
      seen.set(label, r.text.trim())
    } catch { /* 실패하면 원문 그대로 둔다 */ }
  }
  let out = text
  for (const [ko, en] of seen) out = out.split(`[${ko}](`).join(`[${en}](`)
  return { out, n: seen.size }
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
  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true, content: true, title: true, titleEn: true, excerpt: true, excerptEn: true } })
  if (!post) { console.error(`글을 찾을 수 없음: ${slug}`); continue }

  const { out, store } = protect(post.content.replace(/\r\n/g, '\n'))
  console.log(`${slug} : ${post.content.length}자, 보호 ${store.length}곳`)

  let en
  try {
    en = tidy(restore(await translateChunks(out), store))
    const { out: linked, n } = await translateLinkText(en)
    en = linked
    if (n) console.log(`  링크 문구 ${n}개 번역`)
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

  const data = { contentEn: en }

  // 제목·요약은 손으로 다듬는 경우가 많아 기본적으로 건드리지 않는다.
  // 비어 있거나 --meta 를 준 경우에만 다시 만든다.
  if (forceMeta || !post.titleEn) {
    try { data.titleEn = (await translate(post.title, { from: 'ko', to: 'en' })).text.trim() } catch {}
  }
  if (post.excerpt && (forceMeta || !post.excerptEn)) {
    try { data.excerptEn = (await translate(post.excerpt, { from: 'ko', to: 'en' })).text.trim() } catch {}
  }

  await prisma.post.update({ where: { id: post.id }, data })
  console.log(`  저장 완료 ${en.length}자 (코드블록 ${fence}개 유지)${data.titleEn ? ' + 제목' : ''}${data.excerptEn ? ' + 요약' : ''}`)

  // 제목을 고쳤는데 영문 제목을 안 고치면 조용히 어긋난다. 눈에 보이게 알린다.
  if (!data.titleEn) console.log(`  제목 영문본은 그대로다 : "${post.titleEn}"  (--meta 로 다시 만든다)`)
}

await prisma.$disconnect()

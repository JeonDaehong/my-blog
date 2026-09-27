// 모든 글을 remark-cjk-friendly 없이/있이 렌더링해 비교한다. 텍스트로 드러난 ** 와, strong 외 태그 수 변화를 찾는다.
//   node scripts/humanize/verify-cjk-bold.mjs
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkCjkFriendly from 'remark-cjk-friendly'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

const render = async (md, cjk) => {
  let p = unified().use(remarkParse).use(remarkGfm)
  if (cjk) p = p.use(remarkCjkFriendly)
  return String(await p.use(remarkRehype).use(rehypeHighlight, { detect: false, ignoreMissing: true }).use(rehypeStringify).process(md))
}
const noCode = (h) => h.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code[\s\S]*?<\/code>/g, '')
const text = (h) => h.replace(/<[^>]+>/g, '').replace(/&#x3C;/g, '<').replace(/&[a-z]+;/g, ' ')
const tags = (h) => { const c = {}; for (const m of h.matchAll(/<([a-z0-9]+)[\s>]/g)) c[m[1]] = (c[m[1]] || 0) + 1; return c }

const prisma = new PrismaClient()
const posts = await prisma.post.findMany({ select: { slug: true, content: true, contentEn: true } })
let before = 0, after = 0, changedDocs = 0, problems = []
const leftovers = []
for (const p of posts) for (const f of ['content', 'contentEn']) {
  const md = p[f]; if (!md) continue
  const a = await render(md, false), b = await render(md, true)
  const ca = (text(noCode(a)).match(/\*\*/g) || []).length, cb = (text(noCode(b)).match(/\*\*/g) || []).length
  before += ca; after += cb
  if (cb) for (const m of text(noCode(b)).matchAll(/.{0,25}\*\*.{0,25}/g)) leftovers.push(`${p.slug} ${f}: …${m[0].replace(/\n/g, ' ')}…`)
  if (a === b) continue
  changedDocs++
  // 1) 글자 불변 : 표시되는 텍스트에서 ** 만 빼면 같아야 한다
  if (text(a).replace(/\*\*/g, '') !== text(b).replace(/\*\*/g, '')) problems.push(`${p.slug} ${f}: 글자가 달라짐`)
  // 2) strong 외 태그 수 불변
  const ta = tags(a), tb = tags(b)
  for (const k of new Set([...Object.keys(ta), ...Object.keys(tb)])) {
    if (k === 'strong') { if ((tb[k] || 0) < (ta[k] || 0)) problems.push(`${p.slug} ${f}: strong 이 줄어듦`); continue }
    if ((ta[k] || 0) !== (tb[k] || 0)) problems.push(`${p.slug} ${f}: <${k}> ${ta[k] || 0} → ${tb[k] || 0}`)
  }
  console.log(`바뀜 ${p.slug} (${f === 'content' ? '한국어' : '영어'}) strong ${ta.strong || 0} → ${tb.strong || 0}, 남은 ** ${ca} → ${cb}`)
}
console.log(`\n텍스트로 보이던 ** : ${before} → ${after}`)
console.log(`렌더링이 달라진 본문 : ${changedDocs}`)
console.log(`문제 : ${problems.length ? '\n  ' + problems.join('\n  ') : '없음'}`)
if (leftovers.length) console.log('남은 곳 :\n  ' + leftovers.join('\n  '))
await prisma.$disconnect()

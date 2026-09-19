"""모든 글의 excerpt(목록·카드에 보이는 요약문)를 반말로 바꾼다.
사용: python scripts/humanize/excerpts.py [--apply]   (--apply 없으면 미리보기만)
"""
import json, subprocess, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(encoding='utf-8')
from banmal import convert, POLITE

rows = json.loads(subprocess.run(
    ['node', '-e', """
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
p.post.findMany({ select: { id: true, slug: true, excerpt: true } }).then(r => {
  console.log(JSON.stringify(r)); return p.$disconnect()
})"""], capture_output=True, text=True, encoding='utf-8', check=True).stdout)

out = []
for r in rows:
    e = r['excerpt']
    if not e:
        continue
    n = convert(e).strip()
    if n != e:
        out.append({'id': r['id'], 'excerpt': n})
        print(f"{r['slug']}\n  - {e}\n  + {n}")
left = [r for r in out if POLITE.search(r['excerpt'])]
print(f"\n바뀔 글 {len(out)}편 / 존댓말 잔여 {len(left)}편")
for r in left:
    print('  ?', r['excerpt'])

if '--apply' in sys.argv and out:
    open('_workspace/excerpts.json', 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False))
    subprocess.run(['node', '-e', """
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const p = new PrismaClient()
const rows = JSON.parse(fs.readFileSync('_workspace/excerpts.json', 'utf-8'))
;(async () => {
  for (const r of rows) await p.post.update({ where: { id: r.id }, data: { excerpt: r.excerpt } })
  console.log('excerpt ' + rows.length + '건 저장')
  await p.$disconnect()
})()"""], check=True)

"""글을 헤딩 경계에서 7000자 이하 조각으로 나눈다. 코드 블록은 쪼개지 않는다.
사용: python scripts/humanize/chunk.py <slug>  → _workspace/posts/<slug>/chunks/NN.md, manifest.json
"""
import io, json, os, re, sys
slug = sys.argv[1]
base = os.path.join('_workspace', 'posts', slug)
text = io.open(os.path.join(base, 'original.md'), encoding='utf-8').read().replace('\r\n', '\n')
LIMIT = 7000
# 헤딩(#, ##) 앞에서 자를 수 있는 위치 수집 (코드 블록 밖)
lines = text.split('\n'); cuts = []; incode = False
for i, l in enumerate(lines):
    if l.startswith('```'): incode = not incode; continue
    if not incode and re.match(r'^#{1,3} ', l) and i > 0: cuts.append(i)
chunks = []; start = 0; cur_start = 0
def size(a, b): return len('\n'.join(lines[a:b]))
last_cut = 0
for c in cuts + [len(lines)]:
    if size(cur_start, c) > LIMIT and last_cut > cur_start:
        chunks.append((cur_start, last_cut)); cur_start = last_cut
    last_cut = c
chunks.append((cur_start, len(lines)))
# 헤딩 간격이 너무 길어 LIMIT 를 크게 넘는 조각은 빈 줄 경계에서 추가 분할
final = []
for a, b in chunks:
    if size(a, b) <= LIMIT * 1.5: final.append((a, b)); continue
    s = a; incode = False
    for i in range(a, b):
        if lines[i].startswith('```'): incode = not incode
        if not incode and lines[i] == '' and size(s, i) > LIMIT * 0.8:
            final.append((s, i)); s = i
    final.append((s, b))
d = os.path.join(base, 'chunks'); os.makedirs(d, exist_ok=True)
for f in os.listdir(d): os.remove(os.path.join(d, f))
manifest = []
for n, (a, b) in enumerate(final, 1):
    body = '\n'.join(lines[a:b])
    fn = f'{n:02d}.md'
    io.open(os.path.join(d, fn), 'w', encoding='utf-8', newline='\n').write(body)
    manifest.append({'n': n, 'input': fn, 'output': f'{n:02d}.out.md', 'chars': len(body)})
io.open(os.path.join(base, 'manifest.json'), 'w', encoding='utf-8').write(json.dumps(manifest, ensure_ascii=False, indent=1))
print(slug, len(text), '자 →', len(final), '조각', [m['chars'] for m in manifest])

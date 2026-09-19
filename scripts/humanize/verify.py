"""final.md 를 원문과 대조해 구조·숫자·존댓말 잔여를 검사한다. DB 에 넣기 전 확인용.

사용: python scripts/humanize/verify.py [--rebuild] <slug> [<slug> ...]   (exit 0 = 전부 통과)

기본은 이미 있는 final.md 를 그대로 검사한다.
--rebuild 를 주면 chunks/*.out.md 를 이어붙여 final.md 를 새로 쓴 뒤 검사한다
(스킬로 조각 윤문한 직후에만 쓴다 — final.md 를 손으로 고친 뒤에 주면 그 수정이 날아간다).
"""
import glob, io, json, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')

RE_FENCE = re.compile(r'```[\s\S]*?```')
RE_TICK = re.compile(r'`[^`\n]+`')
RE_SUMMARY = re.compile(r'\n*<!--\s*HUMANIZE-SUMMARY[\s\S]*?-->\s*$')
POLITE = re.compile(r'(?!아니다)[가-힣]니다|[가-힣]세요|[가-힣]십시오')


def build(base, rebuild=False):
    """--rebuild 일 때만 조각을 합쳐 final.md 를 새로 쓴다. 기본은 기존 final.md 를 읽는다."""
    mpath = os.path.join(base, 'manifest.json')
    outs = glob.glob(os.path.join(base, 'chunks', '*.out.md'))
    fpath = os.path.join(base, 'final.md')
    if rebuild and os.path.exists(mpath) and outs:
        parts = []
        for m in json.load(io.open(mpath, encoding='utf-8')):
            p = os.path.join(base, 'chunks', m['output'])
            if not os.path.exists(p):
                print('FAIL 조각 출력 없음:', m['output'])
                return None
            t = io.open(p, encoding='utf-8').read().replace('\r\n', '\n')
            parts.append(RE_SUMMARY.sub('', t).strip('\n'))
        final = '\n\n'.join(parts).rstrip('\n') + '\n'
        io.open(fpath, 'w', encoding='utf-8', newline='\n').write(final)
        return final
    if not os.path.exists(fpath):
        print('FAIL final.md 없음 — banmal.py 를 돌리거나 --rebuild 를 줄 것')
        return None
    return io.open(fpath, encoding='utf-8').read().replace('\r\n', '\n')


def nocode(s):
    return RE_TICK.sub('', RE_FENCE.sub('', s))


def struct(s):
    body = nocode(s)
    return {
        '코드블록': RE_FENCE.findall(s),
        '이미지': re.findall(r'!\[[^\]]*\]\([^)]*\)', s),
        '링크URL': re.findall(r'\]\((https?://[^)]+)\)', s),
        '인라인코드': RE_TICK.findall(RE_FENCE.sub('', s)),
        'HTML태그': re.findall(r'<[a-zA-Z][^>]*>', body),
        '헤딩수': [len(re.findall(r'^#+ ', s, re.M))],
        '표행수': [len(re.findall(r'^\|', s, re.M))],
        '볼드수': [len(re.findall(r'\*\*', s))],
        '목록항목수': [len(re.findall(r'^\s*(?:[-*]|\d+\.) ', s, re.M))],
    }


def check(slug, rebuild=False):
    base = os.path.join('_workspace', 'posts', slug)
    orig = io.open(os.path.join(base, 'original.md'), encoding='utf-8').read().replace('\r\n', '\n')
    final = build(base, rebuild)
    if final is None:
        return False

    ok = True
    a, b = struct(orig), struct(final)
    for k in a:
        if a[k] == b[k]:
            continue
        ok = False
        if a[k] and isinstance(a[k][0], int):
            print(f'  FAIL {k}: {a[k][0]} → {b[k][0]}')
        else:
            sa, sb = set(a[k]), set(b[k])
            print(f'  FAIL {k}: {len(a[k])} → {len(b[k])}; 빠짐 {list(sa - sb)[:3]} / 생김 {list(sb - sa)[:3]}')

    na = sorted(re.findall(r'\d+(?:[.,]\d+)*', nocode(orig)))
    nb = sorted(re.findall(r'\d+(?:[.,]\d+)*', nocode(final)))
    if na != nb:
        from collections import Counter
        ca, cb = Counter(na), Counter(nb)
        ok = False
        print(f'  FAIL 숫자: 빠짐 {list((ca - cb).elements())[:8]} / 생김 {list((cb - ca).elements())[:8]}')

    prose = re.sub(r'"[^"\n]*"', '', nocode(final))
    left = [m.group(0) for m in POLITE.finditer(prose)]
    if left:
        ok = False
        print(f'  FAIL 존댓말 잔여 {len(left)}건: {sorted(set(left))[:8]}')

    ratio = len(final) / len(orig)
    if not 0.8 <= ratio <= 1.08:
        ok = False
        print(f'  FAIL 길이 비율 {ratio:.2f}')

    print(f'{"PASS" if ok else "FAIL"} {slug} ({len(orig)} → {len(final)}자)')
    return ok


if __name__ == '__main__':
    args = sys.argv[1:]
    rebuild = '--rebuild' in args
    results = [check(s, rebuild) for s in args if s != '--rebuild']
    sys.exit(0 if all(results) else 1)

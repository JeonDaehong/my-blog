"""존댓말 글을 서술형 반말(한다체)로 바꾸고 콜론 앞을 띄운다. 결정적 변환 — LLM 호출 없음.

사용: python scripts/humanize/banmal.py <slug> [<slug> ...]
     _workspace/posts/<slug>/original.md → _workspace/posts/<slug>/final.md

코드 블록·인라인 코드·URL·영문 인용·큰따옴표 안 인용문은 건드리지 않는다.
변환하지 못한 존댓말은 끝에 목록으로 보고한다.
"""
import io, os, re, sys

sys.stdout.reconfigure(encoding='utf-8')

def jong(ch):
    c = ord(ch) - 0xAC00
    return c % 28 if 0 <= c < 11172 else -1

def swap_jong(ch, new):
    c = ord(ch) - 0xAC00
    return chr(0xAC00 + (c - c % 28) + new)

# 형용사·불규칙: 습니다 → 다
ADJ = """없 같 어렵 많 이렇 좋 맞 쉽 가깝 그렇 적 넓 낫 낮 높 까다롭 가볍 무겁 작 괜찮
늦 소용없 뜨겁 똑같 여유롭 짧 크 옳 싫 밝 굵 깊 둥글 길""".split()
# 동사: 습니다 → 는다
VERB = """않 읽 받 남 잡 막 죽 돕 맡 찾 붙 넣 흩 잃 갖 맺 삼 겪 쌓 담 닿 훑 덮 깎
잡아먹 보장받 먹 벗 씻 신 얻 앉 웃 물 걷 듣 싣""".split()

# 하다 형용사: 합니다 → 하다 (나머지는 한다)
HADA_ADJ = set("""중요 가능 불가능 필요 불필요 적합 부적합 단순 유리 불리 안전 위험 충분 부족
분명 명확 불명확 정확 부정확 유용 유연 비례 반비례 비슷 동일 간단 적당 멀쩡 확실 불확실 원활
수월 막막 투박 강 흔 편 불편 복잡 다양 특별 심 깨끗 적절 부적절 강력 우수 저렴 정교 완벽
독특 엄격 느슨 과도 무의미 유의미 취약 탁월 고유 방대 미미 무관 자유 활발 저조 열악 양호""".split())

# ㅂ니다 계열에서 일반 규칙(ㅂ→ㄴ)이 틀리는 것들
AMB = {
    '다릅니다': '다르다', '빠릅니다': '빠르다', '이릅니다': '이르다', '흐릅니다': '흐른다',
    '부릅니다': '부른다', '따릅니다': '따른다', '고릅니다': '고른다', '모릅니다': '모른다',
    '오릅니다': '오른다', '누릅니다': '누른다', '다룹니다': '다룬다', '미룹니다': '미룬다',
    '비쌉니다': '비싸다', '쌉니다': '싸다', '감쌉니다': '감싼다',
    '큽니다': '크다', '바쁩니다': '바쁘다', '나쁩니다': '나쁘다', '아픕니다': '아프다',
    '아닙니다': '아니다', '겁니다': '거다',
    '위해섭니다': '위해서다', '해섭니다': '해서다', '파섭니다': '파서다', '섭니다': '선다',
    '늡니다': '는다', '깁니다': '긴다',
}

# 해요체·명령형
PLAIN = [
    ('나요?', '나?'), ('나요', '나'), ('까요?', '까?'), ('까요', '까'),
    ('으니까요', '으니까'), ('네요', '네'), ('지요', '지'), ('죠?', '지?'), ('죠', '지'),
    ('십시오', '어라'), ('드립니다', '드린다'),
]

RE_CODEBLOCK = re.compile(r'```[\s\S]*?```')
RE_INLINE = re.compile(r'`[^`\n]+`')
RE_URL = re.compile(r'https?://\S+')
RE_QUOTE = re.compile(r'"[^"\n]*"')
RE_HTML = re.compile(r'<[^>\n]+>')

def protect(text):
    """건드리면 안 되는 구간을 자리표시자로 빼둔다."""
    store = []
    def sub(m):
        store.append(m.group(0))
        return f'\x00{len(store)-1}\x00'
    for rx in (RE_CODEBLOCK, RE_INLINE, RE_URL, RE_HTML, RE_QUOTE):
        text = rx.sub(sub, text)
    return text, store

def restore(text, store):
    return re.sub(r'\x00(\d+)\x00', lambda m: store[int(m.group(1))], text)

def convert_endings(t):
    # 0) ~지 않습니다 : 앞이 형용사면 않다, 동사면 않는다
    def neg(m):
        stem = m.group(1)
        adj = stem in ADJ or stem in ('있', '맞', '그렇', '이렇', '다르', '크')
        if stem.endswith('하') and stem[:-1] in HADA_ADJ:
            adj = True
        return m.group(0)[:-len('않습니다')] + ('않다' if adj else '않는다')
    t = re.sub(r'([가-힣]{1,6})지 않습니다', neg, t)
    # 0b) 하다 형용사
    t = re.sub(r'([가-힣]{1,5})(\*\*)?합니다',
               lambda m: m.group(1) + (m.group(2) or '') + ('하다' if m.group(1) in HADA_ADJ else '한다'), t)
    # 1) 명시 예외 (긴 것부터)
    for w in sorted(AMB, key=len, reverse=True):
        t = t.replace(w, AMB[w])
    # 2) 형용사·동사 습니다
    for s in sorted(ADJ, key=len, reverse=True):
        t = t.replace(s + '습니다', s + '다')
    for s in sorted(VERB, key=len, reverse=True):
        t = t.replace(s + '습니다', s + '는다')
    # 3) 과거·의지 (받침 ㅆ) + 습니다 → 다
    t = re.sub(r'([가-힣])습니다', lambda m: m.group(1) + '다' if jong(m.group(1)) == 20 else m.group(0), t)
    # 4) 명사 + 입니다 → 이다 / 다
    def ipnida(m):
        prev = m.group(1)
        if not prev or not ('가' <= prev <= '힣'):
            return prev + '이다'
        return prev + ('다' if jong(prev) == 0 else '이다')
    t = re.sub(r'(.)입니다', ipnida, t)
    # 5) 일반 ㅂ니다 → ㄴ다
    t = re.sub(r'([가-힣])니다', lambda m: swap_jong(m.group(1), 4) + '다' if jong(m.group(1)) == 17 else m.group(0), t)
    # 6) 해요체 등
    for a, b in PLAIN:
        t = t.replace(a, b)
    return t

def first_person(t):
    t = re.sub(r'(?<![가-힣])저는(?![가-힣])', '나는', t)
    t = re.sub(r'(?<![가-힣])저도(?![가-힣])', '나도', t)
    t = re.sub(r'(?<![가-힣])저희', '우리', t)
    t = re.sub(r'(?<![가-힣])제가(?![가-힣])', '내가', t)
    t = re.sub(r'(?<![가-힣])여러분(?:께서는|께서|에게|은|이|의)?\s*', '', t)
    return t

RE_COLON = re.compile(r'(?<=[^\s:\x00])(:)(?=\s|\*\*|$)')

def space_colon(line):
    return RE_COLON.sub(' :', line)

POLITE = re.compile(r'(?!아니다)[가-힣]니다|[가-힣]세요|[가-힣]십시오|[가-힣]습니다')

def convert(text):
    text = text.replace('\r\n', '\n')
    body, store = protect(text)
    body = convert_endings(body)
    body = first_person(body)
    body = '\n'.join(space_colon(l) for l in body.split('\n'))
    body = re.sub(r'[ \t]+\n', '\n', body)
    body = re.sub(r'(?<=\S)  +', ' ', body)
    return restore(body, store)

def leftovers(text):
    stripped = RE_CODEBLOCK.sub('', text)
    stripped = RE_INLINE.sub('', stripped)
    stripped = RE_QUOTE.sub('', stripped)
    out = []
    for m in POLITE.finditer(stripped):
        a = max(0, m.start() - 25)
        out.append(stripped[a:m.end() + 5].replace('\n', ' '))
    return out

def main():
    total = 0
    for slug in sys.argv[1:]:
        src = os.path.join('_workspace', 'posts', slug, 'original.md')
        dst = os.path.join('_workspace', 'posts', slug, 'final.md')
        text = io.open(src, encoding='utf-8').read()
        out = convert(text)
        io.open(dst, 'w', encoding='utf-8', newline='\n').write(out)
        left = leftovers(out)
        total += len(left)
        print(f'{slug}: {len(text)} → {len(out)}자, 잔여 {len(left)}건')
        for l in left[:15]:
            print('   ?', l.strip())
    print('잔여 합계', total)

if __name__ == '__main__':
    main()

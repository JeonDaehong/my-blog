"""글 전체를 기계적으로 훑어 어색한 문구·오타 후보를 찾는다. LLM 호출 없음.

사용:
    node scripts/humanize/dump-current.mjs      # DB → _workspace/current/*.md
    python scripts/humanize/lint.py             # 전체 검사
    python scripts/humanize/lint.py <slug> ...  # 일부만

규칙마다 몇 건인지 세고, 실제 줄은 규칙당 최대 6건만 보여준다.
찾은 것이 전부 진짜 오류는 아니다. 사람이 보고 판단할 후보 목록이다.
"""
import glob, io, os, re, sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

FENCE = re.compile(r'```[\s\S]*?```')
TICK = re.compile(r'`[^`\n]+`')
LINK = re.compile(r'\[[^\]]*\]\([^)]*\)')

# 변환기가 잘못 만들 수 있는 종결형. 어간이 '이' 로 끝나는 동사를 서술격으로 착각한 흔적.
BAD_ENDING = re.compile(
    r'(?<![가-힣])(보|쓰|모)다(?=[.!?]|$)'
    r'|(?<![한두세네몇\d]\s)(?<![가-힣])(쌓|줄|붙|묶|높|죽|섞|움직|끼)이다(?=[.!?]|$)')
QUOTED = re.compile(r'"[^"\n]*"|“[^”\n]*”')

RULES = [
    ('깨진 축약', re.compile(r'[가-힣]거입니다|정봅니다|[가-힣]니니다|것입니다다')),
    ('존댓말 잔여', re.compile(r'(?!아니다)[가-힣]니다|[가-힣]세요|[가-힣]십시오')),
    ('1인칭 존대', re.compile(r'(?<![가-힣])(저는|저도|저희|제가)(?![가-힣])')),
    # 반말 본문에 독자를 높이는 말이 남으면 어색하다
    ('독자 높임', re.compile(r'[가-힣]*(?:주셔서|주시면|주시길|말씀드리|보시면|하시면|읽어주신|얻어가시|여러분)[가-힣]*')),
    # '이·그' 는 문장 첫머리의 지시어일 수 있어 뺀다. 조사 하나만 덩그러니 남은 꼴만 본다.
    ('조사만 남음', re.compile(r'(?<=[.!?]\s)(?:도|은|는|을|를)\s|[가-힣](?:신|는)\s+(?:도|은|는|을|를)\s')),
    ('대시', re.compile(r'[—–]')),
    ('서술형 오변환', BAD_ENDING),
    ('종결 중복', re.compile(r'다다[.!?]|이다다|한다다')),
    ('같은 말 반복', re.compile(r'(?<![가-힣])([가-힣]{2,6})\s+\1(?![가-힣])')),
    # '이·그·저' 는 지시어로도 쓰여 오탐이 많으므로 뒤에 올 수 없는 짝만 본다
    ('조사 겹침', re.compile(r'(?<![가-힣])(을|를|은|는|의|와|과)\s+(을|를|은|는|의)(?![가-힣])')),
    ('문장부호 앞 공백', re.compile(r'[가-힣A-Za-z0-9]\s+[.,](?:\s|$)')),
    ('마침표 뒤 붙음', re.compile(r'[가-힣]\.[가-힣]')),
    ('부호 중복', re.compile(r'(?<!\.)\.{2}(?!\.)|,,|[?]{2}|[!]{2}')),
    ('빈 링크', re.compile(r'\]\(\s*\)')),
    ('콜론 붙임', re.compile(r'(?<=[가-힣A-Za-z0-9])(?<!http)(?<!https):\s')),
]


def strip(text, keep_code=False):
    t = text if keep_code else FENCE.sub('', text)
    return TICK.sub('', t)


def check_line(rules, line, raw):
    for name, rx in rules:
        m = rx.search(line)
        if m:
            yield name, m.group(0), raw


def lint(path):
    raw = io.open(path, encoding='utf-8').read().replace('\r\n', '\n')
    slug = os.path.basename(path)[:-3]
    hits = defaultdict(list)

    body = FENCE.sub(lambda m: '\n' * m.group(0).count('\n'), raw)
    lines = body.split('\n')
    for i, line in enumerate(lines, 1):
        probe = TICK.sub('코드', line)
        probe = LINK.sub('링크', probe)
        probe = re.sub(r'https?://\S+', 'URL', probe)
        unquoted = QUOTED.sub('인용', probe)
        for name, rx in RULES:
            if name == '콜론 붙임' and probe.lstrip().startswith(('|', '>')):
                continue
            # 인용문 안은 원래 말투를 그대로 두므로 말투 규칙에서 뺀다
            target = unquoted if name in ('존댓말 잔여', '1인칭 존대') else probe
            m = rx.search(target)
            if m:
                hits[name].append((slug, i, line.strip()[:110], m.group(0)))

    # 굵게 표시가 짝이 안 맞는 줄
    for i, line in enumerate(lines, 1):
        probe = TICK.sub('', line)
        if probe.count('**') % 2:
            hits['볼드 홀수'].append((slug, i, line.strip()[:110], '**'))
        if probe.count('"') % 2:
            hits['따옴표 홀수'].append((slug, i, line.strip()[:110], '"'))

    # 문장 단위 검사 : 중복·과장문·단조로운 리듬
    prose = []
    for i, line in enumerate(lines, 1):
        t = line.strip()
        if not t or t.startswith(('#', '|', '>', '-', '*', '!', '1.', '2.', '3.')):
            continue
        t = TICK.sub('코드', LINK.sub('링크', t))
        for sent in re.split(r'(?<=[.!?])\s+', t):
            sent = sent.strip()
            if len(sent) >= 15:
                prose.append((i, sent))

    seen = {}
    for i, sent in prose:
        key = re.sub(r'\s+', '', sent)
        if len(key) < 25:
            continue
        if key in seen:
            hits['같은 문장 반복'].append((slug, i, sent[:110], f'{seen[key]}행과 같음'))
        else:
            seen[key] = i

    for i, sent in prose:
        if len(sent) > 180:
            hits['너무 긴 문장'].append((slug, i, sent[:110], f'{len(sent)}자'))

    run, prev = [], None
    for i, sent in prose:
        end = sent.rstrip('.!?')[-3:]
        if end == prev:
            run.append((i, sent))
        else:
            if len(run) >= 4:
                hits['같은 어미 연속'].append((slug, run[0][0], run[0][1][:90], f'"{prev}" {len(run)}문장'))
            run, prev = [(i, sent)], end
    if len(run) >= 4:
        hits['같은 어미 연속'].append((slug, run[0][0], run[0][1][:90], f'"{prev}" {len(run)}문장'))

    # 표의 칸 수가 행마다 다른 경우
    table, start = [], 0
    for i, line in enumerate(lines + [''], 1):
        if line.strip().startswith('|'):
            if not table:
                start = i
            table.append(line.count('|'))
        elif table:
            if len(set(table)) > 1:
                hits['표 칸 수 불일치'].append((slug, start, f'칸 수 {sorted(set(table))}', 'table'))
            table = []
    return hits


def main():
    args = [a for a in sys.argv[1:]]
    files = ([os.path.join('_workspace', 'current', a + '.md') for a in args]
             if args else sorted(glob.glob(os.path.join('_workspace', 'current', '*.md'))))
    total = defaultdict(list)
    for f in files:
        for k, v in lint(f).items():
            total[k].extend(v)

    print(f'글 {len(files)}편 검사')
    if not total:
        print('걸린 것 없음')
        return
    for name in sorted(total, key=lambda k: -len(total[k])):
        rows = total[name]
        print(f'\n[{name}] {len(rows)}건')
        for slug, i, line, hit in rows[:6]:
            print(f'  {slug}:{i}  <{hit}>  {line}')
        if len(rows) > 6:
            print(f'  ... 그 외 {len(rows) - 6}건')


if __name__ == '__main__':
    main()

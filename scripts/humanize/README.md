# 블로그 글 AI 티 제거 (humanize-korean)

[epoko77-ai/im-not-ai](https://github.com/epoko77-ai/im-not-ai) 스킬로 글 하나씩 윤문하고, diff 를 눈으로 확인한 뒤 DB 에 넣는 흐름.

설치 위치: `~/.claude/im-not-ai` (저장소 복사본), `~/.claude/skills/humanize-korean`, `~/.claude/agents/humanize-*.md`.
업데이트: `cd ~/.claude/im-not-ai && git pull && ./install.sh --claude-only --copy --force`.

## 순서

1. 글 목록 보기 / 글 하나 내보내기
   ```
   node scripts/humanize/export-post.mjs
   node scripts/humanize/export-post.mjs <slug>
   ```
   → `_workspace/posts/<slug>/original.md`

2. 반말 변환 + 콜론 띄어쓰기 (스크립트, LLM 호출 없음)
   ```
   python scripts/humanize/banmal.py <slug> [<slug> ...]
   ```
   `_workspace/posts/<slug>/final.md` 가 나온다. 변환 못 한 존댓말은 실행 끝에 목록으로 뜨니
   그것만 손으로 고친다. 새 어휘가 나오면 `banmal.py` 의 `ADJ`·`VERB`·`HADA_ADJ`·`AMB` 에 추가한다.

   AI 티(번역투·관용구·쉼표)까지 손보려면 그 글만 humanize-korean 스킬로 돌린다. 토큰을 많이 쓰니
   글 단위로 필요할 때만.
   ```
   /humanize-korean _workspace/posts/<slug>/final.md 장르: 블로그 강도: 보수
   ```

3. 검사 + diff 확인
   ```
   python scripts/humanize/verify.py <slug> [<slug> ...]
   git diff --no-index --word-diff _workspace/posts/<slug>/original.md _workspace/posts/<slug>/final.md
   ```
   verify.py 는 코드 블록·이미지·링크·인라인 코드·표·볼드·목록 항목 수, 본문 숫자, 존댓말 잔여,
   길이 비율을 원문과 대조한다. 전부 통과해야 exit 0. 말투가 바뀌었거나 의미가 달라진 문장은
   final.md 에서 직접 되돌린다.

4. DB 에 반영 (교체 전 본문은 자동 백업)
   ```
   node scripts/humanize/import-post.mjs <slug> _workspace/posts/<slug>/final.md
   ```
   영어 본문이 있던 글은 새로 번역한다. 건너뛰려면 `--no-translate` (contentEn 을 비운다).
   페이지는 ISR 60초라 1분 안에 반영된다.

## 문체 기준
- 서술은 한다체("~했다 / ~이다"). 존댓말·해요체를 쓰지 않는다.
- 콜론은 앞을 한 칸 띄운다("수정 전 :"). 코드·URL·영문 인용은 예외.
- 1인칭은 "나 / 내가 / 우리".

## 주의
- `author-context.yaml`(voice profile)은 v1.5 부터 동작하지 않는다. 말투 보존은 `voice-guide.md` 를 프롬프트로 넘기는 방식으로 한다.
- 변경률 30% 넘으면 경고, 50% 넘으면 도구가 중단한다. 그래도 항상 diff 를 본 뒤 넣는다.
- `_workspace/` 는 gitignore 대상.

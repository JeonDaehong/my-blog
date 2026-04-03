---
name: write-post
description: 사용자가 제공한 글을 블로그 포스트로 다듬어 DB에 저장합니다. 내용을 줄이거나 AI 말투로 바꾸지 않습니다.
argument-hint: "<초안 내용 또는 파일 경로>"
allowed-tools: Read, Write, Bash, Edit
---

# 블로그 포스트 다듬기 및 저장

## 역할
사용자가 직접 작성한 글을 받아서 블로그에 올릴 수 있게 다듬는다.
**내용을 절대 줄이거나 요약하지 않는다. AI 말투("~입니다", "~할 수 있습니다" 식의 딱딱한 존댓말)로 바꾸지 않는다.**

## 입력
$ARGUMENTS

입력이 파일 경로면 해당 파일을 읽는다.
입력이 텍스트면 그대로 사용한다.
입력이 없으면 사용자에게 글 내용을 달라고 요청한다.

## 다듬기 규칙

**유지할 것:**
- 원문의 모든 내용, 예시, 코드, 수치, 링크
- 작성자의 말투와 어조 (구어체면 구어체 그대로)
- 문단 구조와 흐름
- 개인적인 경험담, 의견, 판단

**다듬는 것:**
- 맞춤법, 띄어쓰기 오류 수정
- 오타 수정
- Markdown 문법 정리 (헤딩 레벨, 코드 블록 언어 명시 등)
- 너무 길거나 어색하게 이어진 문장은 자연스럽게 끊기 (의미 변경 없이)
- 코드 블록 포맷 통일

**절대 하지 않을 것:**
- 내용 삭제 또는 축약
- 말투 변경 (구어체 → 문어체, 또는 반대)
- "AI가 더 좋은 표현으로" 식의 임의 수정
- 없던 내용 추가

## 메타데이터 작성

다듬은 본문을 바탕으로 아래 항목을 작성한다:

- **title**: 글에서 뽑아낸 제목 (없으면 내용 기반으로 제안, 확인 요청)
- **titleEn**: 영어 제목 (직역 수준으로)
- **excerpt**: 글의 첫 문단 또는 핵심 한 줄 요약 (원문 문장 그대로 활용)
- **excerptEn**: excerpt 영어 번역
- **slug**: title 기반 kebab-case (자동 생성)

contentEn, 카테고리, 커버 이미지는 사용자에게 필요한지 물어본다.

## 저장

메타데이터와 본문을 확정하면 `scripts/create-post.mjs`를 생성하고 실행 방법을 알려준다.

```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.post.create({
  data: {
    title: "제목",
    titleEn: "Title",
    content: `본문`,
    excerpt: "요약",
    excerptEn: "Summary",
    published: false,
    categoryId: null,
  }
})

await prisma.$disconnect()
console.log("저장 완료")
```

저장 후 슬러그와 `/posts/[slug]` 경로를 알려준다.
발행(`published: true`)은 사용자가 직접 어드민에서 하거나 요청 시 스크립트에 포함한다.

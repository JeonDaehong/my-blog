import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categories
  const dev = await prisma.category.upsert({
    where: { slug: "development" },
    update: {},
    create: {
      name: "개발",
      nameEn: "Development",
      slug: "development",
      description: "개발 관련 글",
      order: 1,
    },
  });

  const tech = await prisma.category.upsert({
    where: { slug: "tech" },
    update: {},
    create: {
      name: "기술",
      nameEn: "Tech",
      slug: "tech",
      description: "기술 트렌드와 도구",
      order: 2,
    },
  });

  const life = await prisma.category.upsert({
    where: { slug: "life" },
    update: {},
    create: {
      name: "일상",
      nameEn: "Life",
      slug: "life",
      description: "일상 이야기",
      order: 3,
    },
  });

  // Posts
  await prisma.post.upsert({
    where: { slug: "hello-world" },
    update: {},
    create: {
      title: "블로그를 시작합니다",
      titleEn: "Hello, World!",
      slug: "hello-world",
      excerpt: "새로운 블로그의 첫 번째 글입니다",
      excerptEn: "The very first post on this new blog",
      content: `# 블로그를 시작합니다

안녕하세요! 이 블로그에서는 개발, 기술, 그리고 일상에 대한 이야기를 나누려고 합니다.

## 왜 블로그를 시작했나요?

배우고 경험한 것들을 기록하면 나중에 큰 자산이 된다고 생각합니다. 또한 다른 개발자들에게도 도움이 될 수 있겠죠.

## 어떤 내용을 다룰 예정인가요?

- **개발**: 프로그래밍 언어, 프레임워크, 디자인 패턴
- **기술**: 새로운 도구, 라이브러리, 기술 트렌드
- **일상**: 개발자로서의 삶, 회고, 생각들

> 꾸준히 기록하는 것이 가장 중요하다고 생각합니다.

앞으로 많은 관심 부탁드립니다!`,
      contentEn: `# Hello, World!

Welcome to my blog! Here, I'll be sharing stories about development, technology, and everyday life.

## Why did I start this blog?

I believe that documenting what we learn and experience becomes a great asset over time. It can also help other developers along the way.

## What will I cover?

- **Development**: Programming languages, frameworks, design patterns
- **Tech**: New tools, libraries, technology trends
- **Life**: Life as a developer, retrospectives, thoughts

> I believe consistency in documenting is what matters most.

Thanks for visiting!`,
      published: true,
      categoryId: life.id,
    },
  });

  await prisma.post.upsert({
    where: { slug: "nextjs-blog-guide" },
    update: {},
    create: {
      title: "Next.js로 블로그 만들기",
      titleEn: "Building a Blog with Next.js",
      slug: "nextjs-blog-guide",
      excerpt: "Next.js App Router를 활용한 블로그 구축 가이드",
      excerptEn: "A guide to building a blog using Next.js App Router",
      content: `# Next.js로 블로그 만들기

이 블로그는 Next.js 14와 App Router를 사용하여 만들어졌습니다.

## 기술 스택

| 기술 | 용도 |
|------|------|
| Next.js 14 | 프레임워크 |
| Prisma | ORM |
| Neon | PostgreSQL DB |
| Tailwind CSS | 스타일링 |
| Cloudinary | 이미지 저장 |
| Vercel | 배포 |

## 주요 기능

### 1. Markdown 지원

글을 Markdown으로 작성할 수 있습니다. 코드 블록도 지원됩니다:

\`\`\`typescript
export default function Home() {
  return <h1>Hello Blog!</h1>;
}
\`\`\`

### 2. 다국어 지원

한국어와 영어를 동시에 지원합니다. 상단 헤더에서 언어를 전환할 수 있어요.

### 3. SEO 최적화

- 동적 메타태그 생성
- sitemap.xml 자동 생성
- robots.txt 설정

### 4. 관리자 페이지

\`/admin\`에서 글 작성, 수정, 삭제 및 카테고리 관리가 가능합니다.

## 마무리

이런 식으로 직접 블로그를 만들면 원하는 대로 커스터마이징할 수 있어서 좋습니다!`,
      contentEn: `# Building a Blog with Next.js

This blog was built using Next.js 14 with the App Router.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 14 | Framework |
| Prisma | ORM |
| Neon | PostgreSQL DB |
| Tailwind CSS | Styling |
| Cloudinary | Image Storage |
| Vercel | Deployment |

## Key Features

### 1. Markdown Support

Write posts in Markdown. Code blocks are supported too:

\`\`\`typescript
export default function Home() {
  return <h1>Hello Blog!</h1>;
}
\`\`\`

### 2. Multilingual Support

Supports both Korean and English. Switch languages from the header.

### 3. SEO Optimized

- Dynamic meta tag generation
- Automatic sitemap.xml generation
- robots.txt configuration

### 4. Admin Dashboard

Manage posts and categories at \`/admin\`.

## Wrapping Up

Building your own blog gives you full control over customization!`,
      published: true,
      categoryId: dev.id,
    },
  });

  await prisma.post.upsert({
    where: { slug: "useful-dev-tools-2024" },
    update: {},
    create: {
      title: "개발자를 위한 유용한 도구들",
      titleEn: "Useful Tools for Developers",
      slug: "useful-dev-tools-2024",
      excerpt: "생산성을 높여주는 개발 도구 모음",
      excerptEn: "A collection of productivity-boosting dev tools",
      content: `# 개발자를 위한 유용한 도구들

개발하면서 자주 사용하는 도구들을 정리해보았습니다.

## 에디터 & IDE

- **VS Code** - 가장 인기 있는 코드 에디터
- **Cursor** - AI 기반 코드 에디터
- **Neovim** - 터미널 기반 에디터

## CLI 도구

\`\`\`bash
# 빠른 파일 검색
fd "pattern"

# 빠른 텍스트 검색
rg "search term"

# 디렉토리 크기 확인
dust
\`\`\`

## 디자인

- **Figma** - UI/UX 디자인
- **Excalidraw** - 간단한 다이어그램

## 데이터베이스

- **Neon** - 무료 PostgreSQL
- **Supabase** - Firebase 대안
- **PlanetScale** - 서버리스 MySQL

> 좋은 도구는 생산성을 크게 높여줍니다. 하지만 도구에 너무 매몰되지 않는 것도 중요합니다.`,
      contentEn: `# Useful Tools for Developers

Here's a collection of tools I frequently use while developing.

## Editors & IDEs

- **VS Code** - Most popular code editor
- **Cursor** - AI-powered code editor
- **Neovim** - Terminal-based editor

## CLI Tools

\`\`\`bash
# Fast file search
fd "pattern"

# Fast text search
rg "search term"

# Directory size
dust
\`\`\`

## Design

- **Figma** - UI/UX design
- **Excalidraw** - Simple diagrams

## Databases

- **Neon** - Free PostgreSQL
- **Supabase** - Firebase alternative
- **PlanetScale** - Serverless MySQL

> Great tools boost productivity significantly. But don't get too caught up in tooling—focus on building.`,
      published: true,
      categoryId: tech.id,
    },
  });

  console.log("Seed completed!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

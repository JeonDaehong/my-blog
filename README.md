# 대홍의 데이터 기록

> **Data Engineering · Backend · Open Source**  
> 하루하루 성장하는 엔지니어의 기술 블로그

🌐 **[daehong770.me.kr](https://daehong770.me.kr)**

---

## 소개

데이터 엔지니어링, 백엔드, 오픈소스 기여 경험을 기록하는 개인 기술 블로그입니다.  
Apache Iceberg, Spring Kafka 등 오픈소스 기여 과정부터 Hadoop · Spark · Airflow · Kafka · Kubernetes 실무 경험까지, 직접 부딪히며 쌓은 내용을 솔직하게 담고 있습니다.

```
Data Engineer   → Hadoop · Spark · Airflow · Kafka · Kubernetes · Iceberg
Backend         → Java · Python · Spring
OSS Contributor → Apache Iceberg · Spring Kafka · Apache Gravitino
```

---

## 기술 스택

| 분류 | 사용 기술 |
|------|----------|
| **Framework** | [Next.js 15](https://nextjs.org) (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Font** | [Geist](https://vercel.com/font) (Vercel) |
| **Deployment** | Vercel |
| **도메인** | daehong770.me.kr |

---

## 로컬 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 실행
npm run start

# 린트 검사
npm run lint
```

---

## 프로젝트 구조

```
.
├── app/
│   ├── page.tsx          # 메인 홈 페이지
│   ├── posts/            # 블로그 글 목록 & 상세
│   ├── card-news/        # 카드 뉴스
│   ├── category/         # 카테고리별 글 목록
│   │   ├── development/  # 개발
│   │   ├── tech/         # 기술
│   │   ├── life/         # 일상
│   │   └── opensource/   # 오픈소스 기여
│   └── guestbook/        # 방명록
├── public/
│   └── images/           # 정적 이미지
└── ...
```

---

## 콘텐츠 카테고리

| 카테고리 | 설명 |
|----------|------|
| **개발** | 코딩 기법, 아키텍처, 트러블슈팅 |
| **기술** | 데이터 엔지니어링 스택, 인프라 |
| **오픈소스 기여** | Apache Iceberg, Spring Kafka PR 경험기 |
| **일상** | 컨퍼런스 참가, 개발자 일상 |

---

## 주요 포스트

- 🧊 [Apache Iceberg 오픈소스 기여 경험기](https://daehong770.me.kr/posts/apache-iceberg-오픈소스-기여-경험기-mnjnh9al) — JUnit4 의존성 제거 PR Merge 성공
- 🌱 [오픈소스 기여의 첫 발자국](https://daehong770.me.kr/posts/spring-kafka-opensource-contribution) — Spring Kafka RetryTopic Bean 이름 버그 수정

---

## 배포

[Vercel](https://vercel.com)을 통해 `main` 브랜치 푸시 시 자동 배포됩니다.

```bash
# Vercel CLI로 배포 (선택)
vercel deploy --prod
```

- **프로덕션 URL**: [daehong770.me.kr](https://daehong770.me.kr)
- **Next.js 배포 문서**: [vercel.com/docs](https://vercel.com/docs/frameworks/nextjs)

---

## 링크

| | |
|--|--|
| 🌐 블로그 | [daehong770.me.kr](https://daehong770.me.kr) |
| 💻 GitHub | [github.com/JeonDaehong](https://github.com/JeonDaehong) |
| 💼 LinkedIn | [linkedin.com/in/daehong-jeon](https://linkedin.com/in/daehong-jeon) |
| ☕ Sponsor | [buymeacoffee.com/daehong](https://buymeacoffee.com/daehong) |

---

© 2026 Daehong · *An engineer who grows one step at a time, every single day.*

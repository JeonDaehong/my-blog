import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const content = readFileSync(join(__dirname, 'iceberg-post.md'), 'utf-8')

const prisma = new PrismaClient()

const post = await prisma.post.create({
  data: {
    title: 'Apache Iceberg 오픈소스 기여 경험기',
    titleEn: 'My Apache Iceberg Open Source Contribution Story',
    content,
    excerpt: '오픈소스 멘토링 운영진으로 활동하며 Apache Iceberg Flink 모듈의 JUnit4 의존성 제거 이슈에 기여하고, PR Merge까지 성공한 과정을 담았습니다.',
    excerptEn: 'A detailed record of contributing to Apache Iceberg — from issue selection to PR merge, removing JUnit4 dependencies from the Flink module.',
    coverImage: 'https://res.cloudinary.com/dnfe1mbwx/image/upload/blog/apache-iceberg-opensource-thumbnail',
    published: false,
    categoryId: null,
  },
})

await prisma.$disconnect()
console.log('✅ 저장 완료:', post.slug)

import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

// 블로그 포스트에서 사용하는 이미지 목록
const imageFiles = [
  "kafka-retrytopic-new-thumbnail.png",
  "spring-kafka-github-issue.png",
  "spring-kafka-pr-code-diff.png",
  "spring-kafka-pr.png",
  "spring-kafka-contributor-badge.png",
  "apache-jackrabbit-oak-issue.png",
  "apache-oak-pr-code-changes.png",
  "apache-oak-pr.png",
  "apache-oak-pr-closed.png",
];

async function uploadImage(filename: string): Promise<{ filename: string; url: string }> {
  const filePath = path.join(IMAGES_DIR, filename);
  const publicId = `blog/${path.parse(filename).name}`;

  const result = await cloudinary.uploader.upload(filePath, {
    folder: "blog",
    public_id: path.parse(filename).name,
    overwrite: true,
  });

  console.log(`  Uploaded: ${filename} -> ${result.secure_url}`);
  return { filename, url: result.secure_url };
}

async function main() {
  // 1. 이미지 업로드
  console.log("Uploading images to Cloudinary...\n");

  const urlMap: Record<string, string> = {};

  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (not found): ${file}`);
      continue;
    }
    const { url } = await uploadImage(file);
    urlMap[`/${file}`] = url;
    // Also map /images/ path just in case
    urlMap[`/images/${file}`] = url;
  }

  console.log(`\nUploaded ${Object.keys(urlMap).length / 2} images.\n`);

  // 2. DB에서 포스트 가져오기
  const post = await prisma.post.findUnique({
    where: { slug: "spring-kafka-opensource-contribution" },
  });

  if (!post) {
    console.error("Post not found!");
    process.exit(1);
  }

  // 3. 콘텐츠 내 이미지 경로를 Cloudinary URL로 교체
  let content = post.content;
  let contentEn = post.contentEn || "";
  let coverImage = post.coverImage || "";

  for (const [localPath, cloudUrl] of Object.entries(urlMap)) {
    content = content.replaceAll(localPath, cloudUrl);
    contentEn = contentEn.replaceAll(localPath, cloudUrl);
    if (coverImage === localPath) {
      coverImage = cloudUrl;
    }
  }

  // coverImage가 아직 로컬 경로면 직접 매칭
  if (coverImage && !coverImage.startsWith("http")) {
    const key = coverImage.startsWith("/images/") ? coverImage : coverImage;
    if (urlMap[key]) {
      coverImage = urlMap[key];
    }
  }

  // 4. DB 업데이트
  await prisma.post.update({
    where: { slug: "spring-kafka-opensource-contribution" },
    data: {
      content,
      contentEn,
      coverImage,
    },
  });

  console.log("DB updated with Cloudinary URLs.\n");

  // 5. 로컬 이미지 파일 삭제
  console.log("Deleting local image files...\n");
  for (const file of imageFiles) {
    const filePath = path.join(IMAGES_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  Deleted: ${file}`);
    }
  }

  console.log("\nDone!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

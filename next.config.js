/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    // 이력서 파일은 public 이 아니라 private/resume 에 있고, /wjseoghd/resume 라우트가
    // 로그인을 확인한 뒤 fs 로 읽는다. 런타임에 읽는 파일이라 배포 번들에 직접 넣어 준다.
    outputFileTracingIncludes: {
      "/wjseoghd/resume/**": ["./private/resume/**/*"],
    },
  },
};

module.exports = nextConfig;

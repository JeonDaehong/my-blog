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
  // 이력서와 경력기술서는 public/resume 아래 정적 HTML 이다. 깔끔한 주소로 열리게 이어 준다.
  async rewrites() {
    return [
      { source: "/resume", destination: "/resume/resume.html" },
      { source: "/resume/career", destination: "/resume/career.html" },
      { source: "/resume/side", destination: "/resume/side.html" },
    ];
  },
};

module.exports = nextConfig;

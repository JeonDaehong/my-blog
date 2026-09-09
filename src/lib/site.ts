/**
 * 사이트의 정식 주소. canonical · OG · sitemap · robots · RSS가 모두 이 값을 쓴다.
 * 환경변수가 비어 있어도 운영 도메인으로 떨어지게 해서, 설정 누락이
 * 엉뚱한 도메인을 가리키는 사고로 이어지지 않도록 한다.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://daehong770.me.kr"
).replace(/\/$/, "");

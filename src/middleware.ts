import { NextRequest, NextResponse } from "next/server";

/*
  미들웨어는 Edge 런타임에서 돈다. 여기서 토큰 서명까지 확인하려면 로그인 API 와
  똑같은 비밀키를 Edge 쪽에서도 읽어야 하는데, 그게 어긋나면 정상 로그인한 쿠키도
  거절돼 관리자 화면이 무한히 로그인을 다시 묻는다.

  그래서 여기서는 쿠키가 아예 없는 요청만 되돌린다. 서명 검증은 로그인 API 와 같은
  런타임인 /wjseoghd/write 페이지와, 쓰기 API 들이 각각 isAuthenticated() 로 한다.
*/
export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/wjseoghd", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/wjseoghd/write/:path*"],
};

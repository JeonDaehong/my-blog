import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/lib/auth";

/*
  이력서 · 경력기술서 · 사이드 프로젝트 문서는 로그인한 사람만 본다.

  예전에는 public/resume 아래 정적 파일이라 주소만 알면 누구나 열 수 있었다.
  public 에 두면 Next 가 라우트를 거치지 않고 바로 내주기 때문에 막을 방법이 없어서,
  파일을 private/resume 으로 옮기고 이 라우트가 쿠키 서명까지 확인한 뒤에만 읽어 준다.
  (미들웨어는 Edge 라 쿠키가 있는지만 보고 서명은 못 본다. 그래서 여기서 직접 확인한다.)

  /wjseoghd/resume          → resume.html
  /wjseoghd/resume/career   → career.html
  /wjseoghd/resume/side     → side.html
  /wjseoghd/resume/<파일>   → 같은 폴더의 pdf · png
*/
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "private", "resume");

const PAGES: Record<string, string> = {
  "": "resume.html",
  career: "career.html",
  side: "side.html",
};

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
};

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function resolveFile(segments: string[]): string | null {
  if (segments.length > 1) return null;
  const name = segments[0] ?? "";
  if (name in PAGES) return PAGES[name];
  // 폴더 밖으로 나가는 경로(../)나 하위 폴더는 받지 않는다. 파일 이름 한 칸만 허용.
  if (!/^[\w-]+\.(pdf|png)$/.test(name)) return null;
  return name;
}

export async function GET(req: NextRequest, { params }: { params: { path?: string[] } }) {
  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/wjseoghd", req.url), { headers: PRIVATE_HEADERS });
  }

  const file = resolveFile(params.path ?? []);
  if (!file) return new NextResponse("Not Found", { status: 404, headers: PRIVATE_HEADERS });

  try {
    const body = await readFile(path.join(DIR, file));
    return new NextResponse(body, {
      headers: { ...PRIVATE_HEADERS, "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404, headers: PRIVATE_HEADERS });
  }
}

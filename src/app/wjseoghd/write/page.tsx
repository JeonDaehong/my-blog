import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import WriteContent from "./WriteContent";

/*
  세션 검사는 여기서 한다. 미들웨어는 Edge 런타임이라 로그인 API(Node 런타임)와
  같은 비밀키를 못 보면 유효한 쿠키도 통과시키지 못한다. 그래서 미들웨어는 쿠키
  유무만 보고, 서명 확인은 로그인 API 와 같은 런타임인 이 페이지에서 한다.
*/
export const dynamic = "force-dynamic";

export default async function WritePage() {
  if (!(await isAuthenticated())) redirect("/wjseoghd");

  return (
    <Suspense fallback={<div className="text-center py-16 text-text-tertiary text-sm">불러오는 중...</div>}>
      <WriteContent />
    </Suspense>
  );
}

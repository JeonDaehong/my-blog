import { Suspense } from "react";
import WriteContent from "./WriteContent";

export default function WritePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-text-tertiary text-sm">불러오는 중...</div>}>
      <WriteContent />
    </Suspense>
  );
}

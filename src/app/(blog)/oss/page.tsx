import type { Metadata } from "next";
import OssContent from "./OssContent";

export const metadata: Metadata = {
  title: "OSS · 오픈소스 기여",
  description:
    "Apache Iceberg, Paimon, Gravitino 등 오픈소스 프로젝트에 직접 기여한 PR 과 리뷰한 PR 을 모았습니다.",
};

export default function OssPage() {
  return <OssContent />;
}

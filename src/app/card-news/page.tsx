"use client";

import Link from "next/link";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export default function CardNewsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#666] hover:text-[#e87040] mb-8 transition-colors"
        >
          <HiOutlineArrowLeft size={14} /> 홈으로
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mb-2">카드뉴스</h1>
        <p className="text-[#666] text-sm mb-10">핵심만 담은 비주얼 콘텐츠</p>

        <div className="text-center py-24 border border-dashed border-[#2a2a2a] rounded-lg">
          <p className="text-[#666] text-sm mb-1">준비 중입니다</p>
          <p className="text-[#444] text-[12px]">곧 카드뉴스 콘텐츠가 업로드됩니다</p>
        </div>
      </div>
    </div>
  );
}

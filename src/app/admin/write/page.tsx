"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlinePhoto, HiOutlineEye, HiOutlineGlobeAlt } from "react-icons/hi2";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type Category = { id: string; name: string };

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [content, setContent] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
    if (editId) {
      fetch("/api/posts").then((r) => r.json()).then((posts: any[]) => {
        const post = posts.find((p) => p.id === editId);
        if (post) {
          setTitle(post.title); setTitleEn(post.titleEn || "");
          setContent(post.content); setContentEn(post.contentEn || "");
          setExcerpt(post.excerpt || ""); setExcerptEn(post.excerptEn || "");
          setCoverImage(post.coverImage || "");
          setCategoryId(post.categoryId || "");
          setPublished(post.published);
        }
      });
    }
  }, [editId]);

  async function uploadImage(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) return data.url as string;
      alert("업로드 실패");
    } catch { alert("업로드 실패"); }
    finally { setUploading(false); }
    return null;
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setCoverImage(url);
  }

  async function handleInsertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      const md = `\n![${file.name}](${url})\n`;
      if (lang === "ko") setContent((p) => p + md);
      else setContentEn((p) => p + md);
    }
  }

  async function save(asDraft = false) {
    if (!title.trim()) return alert("제목을 입력하세요");
    if (!content.trim()) return alert("내용을 입력하세요");
    setSaving(true);
    const body = {
      title, titleEn: titleEn || null,
      content, contentEn: contentEn || null,
      excerpt: excerpt || null, excerptEn: excerptEn || null,
      coverImage: coverImage || null,
      categoryId: categoryId || null,
      published: asDraft ? false : published,
    };
    try {
      const url = editId ? `/api/posts/${editId}` : "/api/posts";
      const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) router.push("/admin");
      else { const data = await res.json(); alert(data.error || "저장 실패"); }
    } finally { setSaving(false); }
  }

  const currentTitle = lang === "ko" ? title : titleEn;
  const currentContent = lang === "ko" ? content : contentEn;
  const currentExcerpt = lang === "ko" ? excerpt : excerptEn;
  const setCurrentTitle = lang === "ko" ? setTitle : setTitleEn;
  const setCurrentContent = lang === "ko" ? setContent : setContentEn;
  const setCurrentExcerpt = lang === "ko" ? setExcerpt : setExcerptEn;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-text-tertiary hover:text-text-primary transition-colors">
            <HiOutlineArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold text-text-primary">{editId ? "글 수정" : "새 글 작성"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Language tab */}
          <div className="flex items-center border border-border-color rounded-md overflow-hidden mr-2">
            <button onClick={() => setLang("ko")}
              className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${lang === "ko" ? "bg-accent text-white" : "text-text-tertiary hover:text-text-primary"}`}>
              한글
            </button>
            <button onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-[12px] font-medium transition-colors ${lang === "en" ? "bg-accent text-white" : "text-text-tertiary hover:text-text-primary"}`}>
              EN
            </button>
          </div>
          <button onClick={() => setPreview(!preview)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-color text-[13px] hover:bg-bg-hover transition-colors">
            <HiOutlineEye size={14} /> {preview ? "편집" : "미리보기"}
          </button>
          <button onClick={() => save(true)} disabled={saving}
            className="px-3 py-1.5 rounded-md border border-border-color text-[13px] hover:bg-bg-hover transition-colors disabled:opacity-50">
            임시저장
          </button>
          <button onClick={() => { setPublished(true); save(false); }} disabled={saving}
            className="px-3 py-1.5 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors disabled:opacity-50">
            {editId ? "수정" : "발행"}
          </button>
        </div>
      </div>

      {/* Lang indicator */}
      <div className="flex items-center gap-2 mb-4 text-[12px] text-text-tertiary">
        <HiOutlineGlobeAlt size={14} />
        {lang === "ko" ? "한국어 버전을 편집 중" : "Editing English version"}
        {lang === "en" && !contentEn && <span className="text-yellow-500">(영어 버전이 비어있으면 한글이 표시됩니다)</span>}
      </div>

      {preview ? (
        <div className="border border-border-color rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-text-primary">{currentTitle || "제목 없음"}</h1>
          {coverImage && <img src={coverImage} alt="cover" className="w-full h-56 object-cover rounded-lg mb-6 border border-border-color" />}
          <MarkdownRenderer content={currentContent || content} />
        </div>
      ) : (
        <div className="space-y-4">
          <input type="text" placeholder={lang === "ko" ? "제목을 입력하세요" : "Enter title (English)"}
            value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)}
            className="w-full text-2xl font-bold px-0 py-2 border-0 border-b border-border-color bg-transparent text-text-primary focus:outline-none focus:border-accent placeholder:text-text-tertiary" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-2 rounded-md border border-border-color bg-bg-secondary text-text-primary text-[13px] focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
            <input type="text" placeholder={lang === "ko" ? "요약 (목록에 표시)" : "Excerpt (English)"}
              value={currentExcerpt} onChange={(e) => setCurrentExcerpt(e.target.value)}
              className="px-3 py-2 rounded-md border border-border-color bg-bg-secondary text-text-primary text-[13px] focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text-tertiary" />
          </div>

          {/* Cover image */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-color text-[13px] cursor-pointer hover:bg-bg-hover transition-colors text-text-secondary">
              <HiOutlinePhoto size={14} /> 커버 이미지
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
            {coverImage && (
              <div className="flex items-center gap-2">
                <img src={coverImage} alt="cover" className="w-8 h-8 rounded object-cover border border-border-color" />
                <button onClick={() => setCoverImage("")} className="text-[12px] text-red-400 hover:underline">제거</button>
              </div>
            )}
            {uploading && <span className="text-[12px] text-text-tertiary">업로드 중...</span>}
          </div>

          {/* Editor */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 rounded border border-border-color text-[12px] hover:bg-bg-hover transition-colors text-text-secondary">
                <HiOutlinePhoto size={12} /> 이미지 삽입
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleInsertImage} className="hidden" />
              <span className="text-[12px] text-text-tertiary">Markdown 문법을 사용할 수 있습니다</span>
            </div>
            <textarea
              placeholder={lang === "ko" ? "내용을 작성하세요... (Markdown 지원)" : "Write content in English... (Markdown supported)"}
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              rows={22}
              className="w-full px-4 py-3 rounded-lg border border-border-color bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent text-[13px] font-mono resize-y placeholder:text-text-tertiary"
            />
          </div>
        </div>
      )}
    </div>
  );
}

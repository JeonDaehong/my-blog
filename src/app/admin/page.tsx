"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";

type Post = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string;
  category?: { name: string } | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  _count?: { posts: number };
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"posts" | "categories">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  async function login() {
    setError("");
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) { setAuthenticated(true); loadData(); }
    else setError("비밀번호가 틀렸습니다");
  }

  async function logout() { await fetch("/api/auth", { method: "DELETE" }); setAuthenticated(false); }

  async function loadData() {
    setLoading(true);
    const [p, c] = await Promise.all([fetch("/api/posts"), fetch("/api/categories")]);
    setPosts(await p.json()); setCategories(await c.json()); setLoading(false);
  }

  async function deletePost(id: string) { if (!confirm("정말 삭제하시겠습니까?")) return; await fetch(`/api/posts/${id}`, { method: "DELETE" }); loadData(); }
  async function togglePublish(post: Post) { await fetch(`/api/posts/${post.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...post, published: !post.published }) }); loadData(); }
  async function deleteCategory(id: string) { if (!confirm("정말 삭제하시겠습니까?")) return; await fetch(`/api/categories/${id}`, { method: "DELETE" }); loadData(); }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <h1 className="text-xl font-bold text-text-primary">관리자 로그인</h1>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="w-full px-3 py-2.5 rounded-lg border border-border-color bg-bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {error && <p className="text-red-400 text-[13px]">{error}</p>}
            <button onClick={login} className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
              로그인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-tertiary hover:text-text-primary transition-colors"><HiOutlineArrowLeft size={18} /></Link>
          <h1 className="text-xl font-bold text-text-primary">관리자</h1>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-[13px] text-text-tertiary hover:text-text-primary transition-colors">
          <HiOutlineArrowRightOnRectangle size={16} /> 로그아웃
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-border-color">
        {(["posts", "categories"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-accent text-accent" : "border-transparent text-text-tertiary hover:text-text-primary"}`}>
            {t === "posts" ? <><HiOutlineDocumentText size={16} /> 글 관리</> : <><HiOutlineFolder size={16} /> 카테고리</>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-text-tertiary text-sm">불러오는 중...</div>
      ) : tab === "posts" ? (
        <div>
          <div className="flex justify-end mb-4">
            <Link href="/admin/write" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">
              <HiOutlinePlus size={14} /> 새 글 작성
            </Link>
          </div>
          {posts.length === 0 ? (
            <div className="text-center py-16 text-text-tertiary text-sm">아직 작성된 글이 없습니다</div>
          ) : (
            <div className="border border-border-color rounded-lg overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[400px]">
                <thead className="bg-bg-secondary text-left">
                  <tr>
                    <th className="px-3 sm:px-4 py-2.5 text-[12px] font-medium text-text-tertiary">제목</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[12px] font-medium text-text-tertiary hidden sm:table-cell">카테고리</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[12px] font-medium text-text-tertiary">상태</th>
                    <th className="px-3 sm:px-4 py-2.5 text-[12px] font-medium text-text-tertiary text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-bg-hover transition-colors">
                      <td className="px-3 sm:px-4 py-2.5 text-[12px] sm:text-[13px] font-medium text-text-primary max-w-[180px] sm:max-w-none truncate">{post.title}</td>
                      <td className="px-3 sm:px-4 py-2.5 text-[12px] text-text-tertiary hidden sm:table-cell">{post.category?.name || "-"}</td>
                      <td className="px-3 sm:px-4 py-2.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${post.published ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"}`}>
                          {post.published ? "공개" : "비공개"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => togglePublish(post)} className="p-1.5 rounded text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-colors">
                            {post.published ? <HiOutlineEyeSlash size={15} /> : <HiOutlineEye size={15} />}
                          </button>
                          <Link href={`/admin/write?id=${post.id}`} className="p-1.5 rounded text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-colors">
                            <HiOutlinePencilSquare size={15} />
                          </Link>
                          <button onClick={() => deletePost(post.id)} className="p-1.5 rounded text-text-tertiary hover:bg-red-900/20 hover:text-red-400 transition-colors">
                            <HiOutlineTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <CategoryManager categories={categories} onDelete={deleteCategory} onReload={loadData} />
      )}
    </div>
  );
}

function CategoryManager({ categories, onDelete, onReload }: { categories: Category[]; onDelete: (id: string) => void; onReload: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) return;
    const url = editId ? `/api/categories/${editId}` : "/api/categories";
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
    setName(""); setDescription(""); setEditId(null); onReload();
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border border-border-color rounded-lg space-y-3">
        <h3 className="font-medium text-[13px] text-text-primary">{editId ? "카테고리 수정" : "새 카테고리"}</h3>
        <input type="text" placeholder="카테고리 이름" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border-color bg-bg-secondary text-text-primary text-[13px] focus:outline-none focus:ring-2 focus:ring-accent" />
        <input type="text" placeholder="설명 (선택)" value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border-color bg-bg-secondary text-text-primary text-[13px] focus:outline-none focus:ring-2 focus:ring-accent" />
        <div className="flex gap-2">
          <button onClick={save} className="px-3 py-1.5 rounded-md bg-accent text-white text-[13px] font-medium hover:bg-accent-hover transition-colors">{editId ? "수정" : "추가"}</button>
          {editId && <button onClick={() => { setEditId(null); setName(""); setDescription(""); }} className="px-3 py-1.5 rounded-md border border-border-color text-[13px] text-text-secondary hover:bg-bg-hover transition-colors">취소</button>}
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-text-tertiary text-sm">카테고리가 없습니다</div>
      ) : (
        <div className="border border-border-color rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-bg-secondary text-left">
              <tr>
                <th className="px-4 py-2.5 text-[12px] font-medium text-text-tertiary">이름</th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-text-tertiary hidden sm:table-cell">설명</th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-text-tertiary">글 수</th>
                <th className="px-4 py-2.5 text-[12px] font-medium text-text-tertiary text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-bg-hover transition-colors">
                  <td className="px-4 py-2.5 text-[13px] font-medium text-text-primary">{cat.name}</td>
                  <td className="px-4 py-2.5 text-[12px] text-text-tertiary hidden sm:table-cell">{cat.description || "-"}</td>
                  <td className="px-4 py-2.5 text-[12px] text-text-tertiary">{cat._count?.posts || 0}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => { setEditId(cat.id); setName(cat.name); setDescription(cat.description || ""); }} className="p-1.5 rounded text-text-tertiary hover:bg-bg-hover hover:text-text-primary transition-colors">
                        <HiOutlinePencilSquare size={15} />
                      </button>
                      <button onClick={() => onDelete(cat.id)} className="p-1.5 rounded text-text-tertiary hover:bg-red-900/20 hover:text-red-400 transition-colors">
                        <HiOutlineTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

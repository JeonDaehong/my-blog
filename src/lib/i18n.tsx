"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Locale = "ko" | "en";

const translations = {
  ko: {
    // Nav
    home: "홈",
    allPosts: "전체 글",
    admin: "관리자",
    navigation: "네비게이션",
    categories: "카테고리",
    settings: "설정",
    search: "검색...",

    // Home
    welcome: "환영합니다",
    blogTitle: "My Blog",
    blogDesc: "개발, 기술, 그리고 경험한 것들을 기록하고 공유하는 공간입니다.\n배우고, 만들고, 성장하는 과정을 함께해요.",
    viewAllPosts: "전체 글 보기",
    viewAllPostsDesc: "작성된 모든 글을 확인하세요",
    adminDesc: "글 작성, 카테고리 관리",
    latestPosts: "최신 글",
    viewAll: "전체보기",
    noPosts: "아직 작성된 글이 없습니다",
    noPostsDesc: "관리자 페이지에서 첫 글을 작성해 보세요",

    // Post
    backToList: "목록으로 돌아가기",
    backToHome: "홈으로",
    totalPosts: "총 {count}개의 글",
    postsInCategory: "{count}개의 글",
    noCategoryPosts: "이 카테고리에 글이 없습니다",

    // Admin
    adminLogin: "관리자 로그인",
    passwordPlaceholder: "비밀번호 입력",
    login: "로그인",
    logout: "로그아웃",
    wrongPassword: "비밀번호가 틀렸습니다",
    postManage: "글 관리",
    categoryManage: "카테고리",
    newPost: "새 글 작성",
    public: "공개",
    private: "비공개",
    loading: "불러오는 중...",
    noPostsYet: "아직 작성된 글이 없습니다",
    noCategoriesYet: "카테고리가 없습니다",
    newCategory: "새 카테고리",
    editCategory: "카테고리 수정",
    categoryName: "카테고리 이름",
    descOptional: "설명 (선택)",
    add: "추가",
    edit: "수정",
    cancel: "취소",
    confirmDelete: "정말 삭제하시겠습니까?",

    // Write
    editPost: "글 수정",
    writeNewPost: "새 글 작성",
    preview: "미리보기",
    editing: "편집",
    saveDraft: "임시저장",
    publish: "발행",
    titlePlaceholder: "제목을 입력하세요",
    selectCategory: "카테고리 선택",
    excerptPlaceholder: "요약 (목록에 표시)",
    coverImage: "커버 이미지",
    remove: "제거",
    uploading: "업로드 중...",
    insertImage: "이미지 삽입",
    markdownSupport: "Markdown 문법을 사용할 수 있습니다",
    contentPlaceholder: "내용을 작성하세요... (Markdown 지원)",
    noTitle: "제목 없음",
  },
  en: {
    home: "Home",
    allPosts: "All Posts",
    admin: "Admin",
    navigation: "Navigation",
    categories: "Categories",
    settings: "Settings",
    search: "Search...",

    welcome: "Welcome",
    blogTitle: "My Blog",
    blogDesc: "A space to document and share development, technology, and experiences.\nLearning, building, and growing together.",
    viewAllPosts: "View All Posts",
    viewAllPostsDesc: "Browse all published articles",
    adminDesc: "Write posts, manage categories",
    latestPosts: "Latest Posts",
    viewAll: "View all",
    noPosts: "No posts yet",
    noPostsDesc: "Create your first post from the admin page",

    backToList: "Back to list",
    backToHome: "Home",
    totalPosts: "{count} posts",
    postsInCategory: "{count} posts",
    noCategoryPosts: "No posts in this category",

    adminLogin: "Admin Login",
    passwordPlaceholder: "Enter password",
    login: "Login",
    logout: "Logout",
    wrongPassword: "Incorrect password",
    postManage: "Posts",
    categoryManage: "Categories",
    newPost: "New Post",
    public: "Public",
    private: "Draft",
    loading: "Loading...",
    noPostsYet: "No posts yet",
    noCategoriesYet: "No categories yet",
    newCategory: "New Category",
    editCategory: "Edit Category",
    categoryName: "Category name",
    descOptional: "Description (optional)",
    add: "Add",
    edit: "Edit",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete?",

    editPost: "Edit Post",
    writeNewPost: "New Post",
    preview: "Preview",
    editing: "Edit",
    saveDraft: "Save Draft",
    publish: "Publish",
    titlePlaceholder: "Enter title",
    selectCategory: "Select category",
    excerptPlaceholder: "Excerpt (shown in list)",
    coverImage: "Cover Image",
    remove: "Remove",
    uploading: "Uploading...",
    insertImage: "Insert Image",
    markdownSupport: "Markdown syntax is supported",
    contentPlaceholder: "Write your content... (Markdown supported)",
    noTitle: "Untitled",
  },
} as const;

type TranslationKey = keyof typeof translations.ko;

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}>({
  locale: "ko",
  setLocale: () => {},
  t: (key) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved) setLocaleState(saved);
    setMounted(true);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    let text = translations[locale][key] || translations.ko[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  }

  if (!mounted) {
    // SSR: default Korean
    const tDefault = (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text = translations.ko[key] || key;
      if (vars) Object.entries(vars).forEach(([k, v]) => { text = text.replace(`{${k}}`, String(v)); });
      return text;
    };
    return (
      <I18nContext.Provider value={{ locale: "ko", setLocale, t: tDefault }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

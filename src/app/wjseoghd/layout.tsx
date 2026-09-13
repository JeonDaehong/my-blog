/* 언어 상태는 루트 layout 의 I18nProvider 하나만 쓴다. 여기서 또 감싸면
   그 안쪽만 별도 상태를 갖게 되어, 언어를 바꿔도 바깥 화면에는 안 먹는다. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg-primary">{children}</div>;
}

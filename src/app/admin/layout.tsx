"use client";

import { I18nProvider } from "@/lib/i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <div className="min-h-screen bg-bg-primary">
        {children}
      </div>
    </I18nProvider>
  );
}

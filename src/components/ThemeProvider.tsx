"use client";

// Dark mode only - no toggle needed
// This file is kept for compatibility but does nothing
export function useTheme() {
  return { theme: "dark" as const };
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

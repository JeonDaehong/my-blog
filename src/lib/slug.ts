/**
 * Generates a URL-friendly slug from a title string.
 * Appends a short timestamp suffix by default to avoid collisions.
 */
export function generateSlug(title: string, appendTimestamp = true): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);

  return appendTimestamp ? `${base}-${Date.now().toString(36)}` : base;
}

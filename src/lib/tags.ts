/**
 * 태그는 기술 블로그에서만 쓰고 최대 3개다. 앞뒤 공백을 떼고, 빈 값과
 * 대소문자만 다른 중복을 걸러낸 뒤 3개에서 자른다. 입력이 없으면 빈 배열이다.
 */
export function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const tag = raw.trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length === 3) break;
  }
  return out;
}

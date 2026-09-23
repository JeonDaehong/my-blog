/**
 * 글에 붙는 주제 태그. 기술 블로그에서만 쓴다.
 *
 * 카테고리 배지는 액센트색이라, 태그는 중립색으로 두어 둘이 경쟁하지 않게 한다.
 * 태그 이름에 공백이 들어가므로(예: Apache Iceberg) 칩 하나가 통째로 줄바꿈되도록
 * whitespace-nowrap 을 걸고, 줄 자체는 wrap 시킨다. 폭이 좁아도 글자가 잘리지 않는다.
 */
export default function PostTags({
  tags,
  size = "md",
  className = "",
}: {
  tags: string[] | null | undefined;
  size?: "sm" | "md";
  className?: string;
}) {
  if (!tags?.length) return null;

  const chip =
    size === "md"
      ? "text-[12px] sm:text-[13px] px-2.5 py-1"
      : "text-[11px] sm:text-[12px] px-2 py-0.5";

  return (
    <ul className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {tags.map((tag) => (
        <li
          key={tag}
          className={`${chip} whitespace-nowrap rounded-full border border-border-color bg-bg-tertiary text-text-secondary`}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

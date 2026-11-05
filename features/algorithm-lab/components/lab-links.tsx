import Link from "next/link";
import { labsForTopics } from "../registry/metadata";
/** Read-only learning links; never record Lab watching as evidence. */
export function LabLinks({
  topics,
  label = "Learn visually",
  compact = false,
  className = "",
  style,
}: {
  topics: readonly string[];
  label?: string;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const algorithms = labsForTopics(topics).slice(0, compact ? 1 : 3);
  if (!algorithms.length) return null;
  return (
    <div
      className={`lab-topic-links ${compact ? "lab-topic-links-compact" : ""} ${className}`.trim()}
      aria-label="Related Algorithm Lab modules"
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        fontSize: 11,
        lineHeight: 1.8,
        marginBlock: 8,
        ...style,
      }}
    >
      <span style={{ color: "#888" }}>{label}</span>
      {algorithms.map((a) => (
        <Link
          key={a.slug}
          href={`/lab/${a.slug}?mode=step`}
          style={{ color: "#ddd", textDecoration: "underline", textUnderlineOffset: 4 }}
        >
          {a.name}
        </Link>
      ))}
    </div>
  );
}

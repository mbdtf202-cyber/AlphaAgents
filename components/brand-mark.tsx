import clsx from "clsx";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={clsx("brand-mark", className)} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="brand-mark__svg">
        <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(255, 248, 239, 0.28)" strokeWidth="4" strokeDasharray="82 30" strokeLinecap="round" />
        <path
          d="M32 15 17.5 48h8.4l2.8-6.6h6.6l2.8 6.6h8.4L32 15Zm0 10.8 3.8 9h-7.6l3.8-9Z"
          fill="#fff8ef"
        />
        <path
          d="M46.5 19.5c3.7 3.4 6 8.1 6 13.4 0 10.8-8.7 19.5-19.5 19.5-4.7 0-9.1-1.7-12.5-4.5"
          fill="none"
          stroke="rgba(255, 248, 239, 0.46)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="46.5" cy="19.5" r="3.3" fill="#f6c188" />
        <circle cx="18.5" cy="47.5" r="2.9" fill="#9cd2bb" />
        <path d="M28.7 36.8h11.6" stroke="rgba(13, 24, 36, 0.24)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

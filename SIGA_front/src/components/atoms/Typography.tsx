import type { ReactNode } from "react";

type TypographyProps = { children: ReactNode; className?: string };

export const Eyebrow = ({ children, className = "" }: TypographyProps) => {
  return (
    <div
      className={`mb-4 text-xs font-extrabold uppercase tracking-[.14em] text-emerald-600 ${className}`}
    >
      {children}
    </div>
  );
};

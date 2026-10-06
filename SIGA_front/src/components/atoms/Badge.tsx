type BadgeProps = { children: string; className?: string }

export const Badge = ({ children, className = '' }: BadgeProps) => {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>
}

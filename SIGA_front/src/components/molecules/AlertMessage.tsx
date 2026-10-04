type AlertMessageProps = { children: string }

export function AlertMessage({ children }: AlertMessageProps) {
  return <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800" role="alert">{children}</div>
}

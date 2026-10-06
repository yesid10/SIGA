import type { LabelHTMLAttributes } from 'react'

export const Label = ({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) => {
  return <label className={`text-sm font-bold text-slate-800 ${className}`} {...props} />
}

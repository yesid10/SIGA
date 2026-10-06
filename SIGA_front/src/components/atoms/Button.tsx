import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700',
  secondary: 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 focus-visible:ring-emerald-700',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-500',
}

export const Button = ({ variant = 'primary', className = '', ...props }: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

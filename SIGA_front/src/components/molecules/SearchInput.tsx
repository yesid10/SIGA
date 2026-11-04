import type { InputHTMLAttributes } from 'react'
import { Input } from '../atoms/Input'

export const SearchInput = (props: InputHTMLAttributes<HTMLInputElement>) => {
  return <div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">⌕</span><Input {...props} className={`pl-9 ${props.className ?? ''}`} type="search" /></div>
}

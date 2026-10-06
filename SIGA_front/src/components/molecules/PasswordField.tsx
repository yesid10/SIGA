import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Input } from '../atoms/Input'

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export const PasswordField = (props: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false)
  return <div className="relative"><Input {...props} type={visible ? 'text' : 'password'} className="pr-20" /><button className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs font-bold text-slate-500 hover:text-emerald-800" type="button" onClick={() => setVisible((current) => !current)}>{visible ? 'Ocultar' : 'Mostrar'}</button></div>
}

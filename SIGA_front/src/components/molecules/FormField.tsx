import type { ReactNode } from 'react'
import { Label } from '../atoms/Label'

type FormFieldProps = { id: string; label: string; children: ReactNode; error?: string }

export const FormField = ({ id, label, children, error }: FormFieldProps) => {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs font-semibold text-rose-700" role="alert">{error}</p>}
    </div>
  )
}

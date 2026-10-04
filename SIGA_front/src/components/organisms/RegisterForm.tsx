import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { FormField } from '../molecules/FormField'
import { PasswordField } from '../molecules/PasswordField'
import { AlertMessage } from '../molecules/AlertMessage'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa tu nombre.'),
  email: z.string().trim().email('Ingresa un correo válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  confirmPassword: z.string(),
  profiles: z.array(z.enum(['DONADOR', 'BENEFICIARIO'])).min(1, 'Selecciona al menos un perfil.'),
}).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', profiles: [] },
  })

  async function onSubmit() {
    setError('root', { message: 'El registro estará disponible al integrar Firebase Authentication en la Fase 3.' })
  }

  return <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate><FormField id="name" label="Nombre completo" error={errors.name?.message}><Input id="name" autoComplete="name" placeholder="Tu nombre" {...register('name')} /></FormField><FormField id="register-email" label="Correo electrónico" error={errors.email?.message}><Input id="register-email" type="email" autoComplete="email" placeholder="nombre@organizacion.org" {...register('email')} /></FormField><FormField id="register-password" label="Contraseña" error={errors.password?.message}><PasswordField id="register-password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" {...register('password')} /></FormField><FormField id="confirm-password" label="Confirmar contraseña" error={errors.confirmPassword?.message}><PasswordField id="confirm-password" autoComplete="new-password" placeholder="Repite tu contraseña" {...register('confirmPassword')} /></FormField><fieldset className="grid gap-2"><legend className="text-sm font-bold text-slate-800">¿Cómo quieres participar?</legend><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" value="DONADOR" {...register('profiles')} /> Quiero donar alimentos</label><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" value="BENEFICIARIO" {...register('profiles')} /> Necesito solicitar alimentos</label>{errors.profiles?.message && <p className="text-xs font-semibold text-rose-700">{errors.profiles.message}</p>}</fieldset>{errors.root?.message && <AlertMessage>{errors.root.message}</AlertMessage>}<Button className="mt-2 w-full" type="submit" disabled={isSubmitting}>Crear cuenta</Button></form>
}

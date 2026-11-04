import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Spinner } from "../atoms/Spinner";
import { FormField } from "../molecules/FormField";
import { PasswordField } from "../molecules/PasswordField";
import { AlertMessage } from "../molecules/AlertMessage";
import { register as registerUser, type Usuario } from "../../services/auth";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ingresa tu nombre completo."),
    email: z.string().trim().email("Ingresa un correo válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden.",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;
type RegisterFormProps = { onSuccess: (user: Usuario) => void };

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await registerUser({
        nombre: values.name,
        email: values.email,
        password: values.password,
      });
      onSuccess(response.usuario);
    } catch (requestError) {
      setError("root", {
        message:
          requestError instanceof Error
            ? requestError.message
            : "No fue posible crear la cuenta.",
      });
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField id="name" label="Nombre completo" error={errors.name?.message}>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Tu nombre"
          {...register("name")}
        />
      </FormField>
      <FormField
        id="register-email"
        label="Correo electrónico"
        error={errors.email?.message}
      >
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="nombre@organizacion.org"
          {...register("email")}
        />
      </FormField>
      <FormField
        id="register-password"
        label="Contraseña"
        error={errors.password?.message}
      >
        <PasswordField
          id="register-password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          {...register("password")}
        />
      </FormField>
      <FormField
        id="confirm-password"
        label="Confirmar contraseña"
        error={errors.confirmPassword?.message}
      >
        <PasswordField
          id="confirm-password"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          {...register("confirmPassword")}
        />
      </FormField>
      {errors.root?.message && (
        <AlertMessage>{errors.root.message}</AlertMessage>
      )}
      <Button className="mt-2 w-full justify-center" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner /> Creando cuenta…
          </>
        ) : (
          "Crear cuenta"
        )}
      </Button>
    </form>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginWithGoogle } from "../../services/firebase/auth";
import { login, type Usuario } from "../../services/auth";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Spinner } from "../atoms/Spinner";
import { FormField } from "../molecules/FormField";
import { AlertMessage } from "../molecules/AlertMessage";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .email("Ingresa un correo válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginFormProps = { onSuccess: (user: Usuario) => void };

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values.email, values.password);
      onSuccess(response.usuario);
    } catch (requestError) {
      setError("root", {
        message:
          requestError instanceof Error
            ? requestError.message
            : "No fue posible iniciar sesión.",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await loginWithGoogle();
      onSuccess(response.usuario);
    } catch (requestError) {
      setError("root", {
        message:
          requestError instanceof Error
            ? requestError.message
            : "No fue posible ingresar con Google.",
      });
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField
        id="email"
        label="Correo electrónico"
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@organizacion.org"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>
      <FormField
        id="password"
        label="Contraseña"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </FormField>
      {errors.root?.message && (
        <AlertMessage>{errors.root.message}</AlertMessage>
      )}
      <Button
        className="mt-2 w-full justify-between"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner /> Validando…
          </>
        ) : (
          <>
            Entrar al sistema <span aria-hidden="true">→</span>
          </>
        )}
      </Button>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />o
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <Button
        className="flex w-full items-center justify-center gap-2"
        type="button"
        variant="secondary"
        disabled={isSubmitting}
        onClick={() => void handleGoogleLogin()}
      >
        <FcGoogle className="size-5 shrink-0" />
        <span>Continuar con Google</span>
      </Button>
    </form>
  );
}

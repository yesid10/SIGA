import { Link } from "react-router-dom";
import { AuthTemplate } from "../../components/templates/AuthTemplate";
import { Button } from "../../components/atoms/Button";
import { Eyebrow } from "../../components/atoms/Typography";
import { RegisterForm } from "../../components/organisms/RegisterForm";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  function handleSuccess(user: Parameters<typeof setUser>[0]) {
    setUser(user);
    navigate("/dashboard", { replace: true });
  }

  return (
    <AuthTemplate>
      <Eyebrow>Únete a SIGA</Eyebrow>
      <h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
        Crear cuenta
      </h2>
      <p className="mb-8 mt-2 text-sm leading-6 text-slate-500">
        Crea tu cuenta para solicitar alimentos como beneficiario.
      </p>
      <RegisterForm onSuccess={handleSuccess} />
      <Link className="mt-6 block" to="/login">
        <Button className="w-full" type="button" variant="secondary">
          Volver al inicio de sesión
        </Button>
      </Link>
    </AuthTemplate>
  );
}

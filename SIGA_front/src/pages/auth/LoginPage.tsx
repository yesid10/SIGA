import { Link, useNavigate } from "react-router-dom";
import { AuthTemplate } from "../../components/templates/AuthTemplate";
import { LoginForm } from "../../components/organisms/LoginForm";
import { Eyebrow } from "../../components/atoms/Typography";
import type { Usuario } from "../../services/auth";

type LoginPageProps = { onLogin: (user: Usuario) => void };

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const navigate = useNavigate();
  const handleSuccess = (user: Usuario) => {
    onLogin(user);
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthTemplate>
      <div className="mb-9 lg:hidden">
        <span className="font-extrabold tracking-[.12em] text-emerald-900">
          SIGA
        </span>
      </div>
      <Eyebrow>Área segura</Eyebrow>
      <h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
        Iniciar sesión
      </h2>
      <p className="mb-8 mt-2 text-sm text-slate-500">
        Ingresa tus credenciales para continuar al sistema.
      </p>
      <LoginForm onSuccess={handleSuccess} />
      <p className="mt-6 text-center text-sm text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link
          className="font-bold text-emerald-800 hover:underline"
          to="/register"
        >
          Crear cuenta
        </Link>
      </p>
      <p className="mt-5 text-center text-xs text-slate-500">
        ▣ Conexión protegida con autenticación JWT
      </p>
    </AuthTemplate>
  );
}

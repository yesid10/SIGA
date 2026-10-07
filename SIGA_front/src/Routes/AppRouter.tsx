import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { RoleGuard } from "../guards/RoleGuard";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";
import { ProductsPage } from "../pages/products/ProductsPage";
import { LocationsPage } from "../pages/locations/LocationsPage";
import { DonorsPage } from "../pages/donors/DonorsPage";

export const AppRouter = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const handleLogout = useAuthStore((state) => state.logout);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={setUser} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />

        <Route element={<ProtectedRoute user={user} />}>
          {/* Rutas compartidas para todos los usuarios autenticados */}
          <Route
            element={
              <DashboardTemplate user={user!} onLogout={handleLogout}>
                <DashboardPage />
              </DashboardTemplate>
            }
            path="/dashboard"
          />
          <Route
            element={
              <DashboardTemplate user={user!} onLogout={handleLogout}>
                <ProductsPage />
              </DashboardTemplate>
            }
            path="/products"
          />
          <Route
            element={
              <DashboardTemplate user={user!} onLogout={handleLogout}>
                <PlaceholderPage
                  title="Solicitudes"
                  description="Consulta y gestiona solicitudes de alimentos."
                />
              </DashboardTemplate>
            }
            path="/requests"
          />

          {/* Rutas operativas: solo para Administradores y Encargados */}
          <Route
            element={
              <RoleGuard
                user={user}
                allowedRoles={["ADMINISTRADOR", "ENCARGADO"]}
              />
            }
          >
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <LocationsPage />
                </DashboardTemplate>
              }
              path="/locations"
            />
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <DonorsPage />
                </DashboardTemplate>
              }
              path="/donors"
            />
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <PlaceholderPage
                    title="Inventario por Lotes"
                    description="Consulta de productos, lotes, existencias y fechas de vencimiento."
                  />
                </DashboardTemplate>
              }
              path="/inventory"
            />
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <PlaceholderPage
                    title="Donaciones"
                    description="Gestión y recepción de donaciones para el ingreso al almacén."
                  />
                </DashboardTemplate>
              }
              path="/donations"
            />
          </Route>

          {/* Rutas exclusivas del Administrador */}
          <Route
            element={<RoleGuard user={user} allowedRoles={["ADMINISTRADOR"]} />}
          >
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <PlaceholderPage
                    title="Usuarios y Roles"
                    description="Administración de cuentas, colaboradores y asignación de roles."
                  />
                </DashboardTemplate>
              }
              path="/users"
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

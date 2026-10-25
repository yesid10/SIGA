import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { RoleGuard } from "../guards/RoleGuard";
import { DashboardTemplate } from "../components/templates/DashboardTemplate";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { ProductsPage } from "../pages/products/ProductsPage";
import { RequestsPage } from "../pages/requests/RequestsPage";
import { BeneficiariesPage } from "../pages/beneficiaries/BeneficiariesPage";
import { LocationsPage } from "../pages/locations/LocationsPage";
import { DonorsPage } from "../pages/donors/DonorsPage";
import { CategoriesPage } from "../pages/categories/CategoriesPage";
import { DonationsPage } from "../pages/donations/DonationsPage";
import { InventoryPage } from "../pages/inventory/InventoryPage";
import { UsersPage } from "../pages/users/UsersPage";
import { AlertsPage } from "../pages/alerts/AlertsPage";
import { ReportsPage } from "../pages/reports/ReportsPage";

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
                <RequestsPage />
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
                  <BeneficiariesPage />
                </DashboardTemplate>
              }
              path="/beneficiaries"
            />
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
                  <CategoriesPage />
                </DashboardTemplate>
              }
              path="/categories"
            />
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <InventoryPage />
                </DashboardTemplate>
              }
              path="/inventory"
            />
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <DonationsPage />
                </DashboardTemplate>
              }
              path="/donations"
            />
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <AlertsPage />
                </DashboardTemplate>
              }
              path="/alerts"
            />
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <ReportsPage />
                </DashboardTemplate>
              }
              path="/reports"
            />
          </Route>

          {/* Rutas exclusivas del Administrador */}
          <Route
            element={<RoleGuard user={user} allowedRoles={["ADMINISTRADOR"]} />}
          >
            <Route
              element={
                <DashboardTemplate user={user!} onLogout={handleLogout}>
                  <UsersPage />
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

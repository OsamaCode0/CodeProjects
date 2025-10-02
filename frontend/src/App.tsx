import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import RegisterForm from "./registerform";
import LoginForm from "./loginform";
import UserProfileForm from "./components/profile/UserProfileForm";
import { RequireAuth, RequireGuest } from "./protectedRoutes";
import ChildProfileForm from "./components/profile/ChildProfileForm";
import BottomPanel from "./components/bottom";

export default function App() {
  const location = useLocation();
   const hideBottomPanel =
    location.pathname === "/login" || location.pathname === "/register";
  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <RequireGuest>
            <LoginForm />
          </RequireGuest>
        }
      />
      <Route
        path="/register"
        element={
          <RequireGuest>
            <RegisterForm />
          </RequireGuest>
        }
      />

      <Route
        path="/profile"
        element={
          <RequireAuth>
            <UserProfileForm />
          </RequireAuth>
        }
      />

      <Route
        path="/child"
        element={
          <RequireAuth>
            <ChildProfileForm />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    {!hideBottomPanel && <BottomPanel />}
    </>
  );
}

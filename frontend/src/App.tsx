import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from "./registerform";
import LoginForm from "./loginform";
import UserProfileForm from './components/profile/UserProfileForm';
import { RequireAuth, RequireGuest } from "./protectedRoutes";

  export default function App() {
  return (
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

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
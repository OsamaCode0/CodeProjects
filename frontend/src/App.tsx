import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from "./registerform";
import LoginForm from "./loginform";
import UserProfileForm from './userprofile';

export default function App(){
  return(
      <Routes>
        <Route path="/" element={<UserProfileForm />} />
    
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ThemeProvider from "./theme/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage    from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WelcomePage  from "./pages/WelcomePage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Default — redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth routes */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/welcome"
              element={
                <ProtectedRoute>
                  <WelcomePage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ThemeProvider from "./theme/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage    from "./pages/LoginPage";
import WelcomePage  from "./pages/WelcomePage";
import QuizPage     from "./pages/QuizPage";
import FinishPage   from "./pages/FinishPage";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
            <Route path="/quiz"    element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/finish"  element={<ProtectedRoute><FinishPage /></ProtectedRoute>} />
            <Route path="*"        element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
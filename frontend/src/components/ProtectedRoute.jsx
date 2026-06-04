import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Wraps a route that requires authentication.
 * Redirects to /login and preserves the intended destination so the user
 * can be sent back after logging in.
 *
 * Usage:
 *   <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, isOwner } = useAuth();

  if (!user) {
    return (
      <div className="container py-5">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isOwner) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

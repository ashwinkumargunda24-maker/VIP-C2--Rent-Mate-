import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "../utils/api";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "owner") return <Navigate to="/owner" replace />;
    return <Navigate to="/renter" replace />;
  }

  return children;
};

export default ProtectedRoute;

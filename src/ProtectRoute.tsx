import React from "react";
import { Navigate } from "react-router-dom";

const ProtectRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectRoute;

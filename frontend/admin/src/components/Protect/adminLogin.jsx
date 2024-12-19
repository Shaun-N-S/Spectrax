import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminLoginAuth = ({ children }) => {
  const info = useSelector(state => state.admin.admin);
  
  // If the admin is logged in, redirect to the admin home page
  if (info) {
    return <Navigate to="/home" />;
  }
  
  // Otherwise, show the login page
  return children;
};

export default AdminLoginAuth;
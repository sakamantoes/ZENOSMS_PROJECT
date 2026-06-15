import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./Components/ProtectedRoute";
import Login from "./page/Login";
import AdminLayout from "./Layout/AdminLayout";
import UserLayout from "./Layout/UserLayout";
import UserDashboard from "./page/user/UserDashboard";
import AdminDashboard from "./page/admin/AdminDashboard";


const App = () => {
  return (
    <>
      <ToastContainer position="bottom-right" theme="colored" />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Login />} />


         <Route
          path="/f"
          element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/f/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
        </Route>

        <Route
          path="/a"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/a/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

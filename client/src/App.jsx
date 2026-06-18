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
import Deposit from "./page/user/Deposit";
import BuyUsaNumber from "./page/user/BuyUsaNumber";
import OtherCountry1 from "./page/user/OtherCountry1";
import OtherCountry2 from "./page/user/OtherCountry2";
import Boosting from "./page/user/Boosting";
import WorkingPIC from "./page/user/WorkingPIC";
import WorkingFormat from "./page/user/WorkingFormat";
import TransactionHistory from "./page/user/TransactionHistory";
import BoostingHistory from "./page/user/BoostingHistory";
import NumberHistory from "./page/user/NumberHistory";
import FormateHistory from "./page/user/FormateHistory";
import PictureHistory from "./page/user/PictureHistory";
import PaymentTracking from "./page/admin/PaymentTracking";
import UserManagement from "./page/admin/UserManagement";
import Servicesprice from "./page/admin/Services&price";
import SocialMedia from "./page/admin/SocialMedia";
import WorkingPhoto from "./page/admin/WorkingPhoto";
import WorkingFormatAdmin from "./page/admin/WorkingFormatAdmin";
import Support from './page/admin/Support'
import UserSupport from "./page/user/UserSupport";

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
          <Route path="make-deposit" element={<Deposit />} />
          <Route path="usa-numbers" element={<BuyUsaNumber />} />
          <Route path="other-numbers-1" element={<OtherCountry1 />} />
          <Route path="other-numbers-2" element={<OtherCountry2 />} />
          <Route path="social-media-boosting" element={<Boosting />} />
          <Route path="Working-picture" element={<WorkingPIC />} />
          <Route path="Working-formate-tool" element={<WorkingFormat />} />
          <Route path="deposits-history" element={<TransactionHistory />} />
          <Route path="boosting-history" element={<BoostingHistory />} />
          <Route path="number-history" element={<NumberHistory />} />
          <Route path="format-history" element={<FormateHistory />} />
          <Route path="picture-history" element={<PictureHistory />} />
          <Route path="user-support" element={<UserSupport />} />
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
           <Route path="deposits" element={<PaymentTracking />} />
            <Route path="users" element={<UserManagement />} />
             <Route path="numbers" element={<Servicesprice />} />
              <Route path="social-media-boost" element={<SocialMedia />} />
               <Route path="manage-photos" element={<WorkingPhoto />} />
                <Route path="manage-working-formate" element={<WorkingFormatAdmin />} />
                <Route path="support" element={<Support />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

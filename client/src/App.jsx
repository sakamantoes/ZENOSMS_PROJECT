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
import GiftManagement from "./page/admin/GiftProductManagement";
// import Deposit from "./page/user/Deposit";
import AdminGiftCategoryProducts from "./page/admin/GiftCategoryProducts";
import BuyUsaNumber from "./page/user/BuyUsaNumber";
import OtherCountry1 from "./page/user/OtherCountry1";
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
import AdminUsaServices from "./page/admin/AdminUsaServices";
import AdminOtherServices from "./page/admin/AdminOtherServices";
import AdminPricingSettings from "./page/admin/AdminPricingSettings";
import SocialMedia from "./page/admin/SocialMedia";
import WorkingPhoto from "./page/admin/WorkingPhoto";
import WorkingFormatAdmin from "./page/admin/WorkingFormatAdmin";
import DeliveryRateSettings from './page/admin/DeliveryRateSettings'
import Support from './page/admin/Support'
import UserSupport from "./page/user/UserSupport";
import ViewReceipt from "./page/user/VeiwReciept";
import OtpBox from "./page/user/NumberHistory";
import Profile from "./page/user/Profile";
import ForgotPassword from "./page/ForgotPassword";
import ResetPassword from "./page/ResetPassword";
import Gifting from "./page/user/Gifting";
import UserGiftCategoryProducts from "./page/user/GiftCategoryProducts";
import Checkout from "./page/user/Checkout";
import OrderHistory from "./page/user/OrderHistory";
import OrderManagement from "./page/admin/OrderManagement";
import SocialOrderManagement from "./page/admin/SocialOrderManagement";
import WorkingOrderManagement from "./page/admin/WorkingOrderManagement";
import OtpOrderManagement from "./page/admin/OtpOrderManagement";
import AdminLogsManagement from "./page/admin/LogsManagement";
import UserLogsMarketplace from "./page/user/LogsMarketplace";

const App = () => {
  return (
    <>
      <ToastContainer position="bottom-right" theme="colored" />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Login />} />
        <Route path="/forgotten-password" element={<ForgotPassword />}/>
        <Route path="/reset-password/:token" element={<ResetPassword />}/>

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
           <Route path="gift_sending" element={<Gifting />} />
          <Route
            path="gift_sending/:categorySlug"
            element={<UserGiftCategoryProducts />}
          />
          <Route path="checkout" element={<Checkout />} />
          <Route path="gift-order-history" element={<OrderHistory />} />
          {/* <Route path="make-deposit" element={<Deposit />} /> */}
          <Route path="usa-numbers" element={<BuyUsaNumber />} />
          <Route path="other-numbers-1" element={<OtherCountry1 />} />
          <Route path="social-media-boosting" element={<Boosting />} />
          <Route path="Working-picture" element={<WorkingPIC />} />
          <Route path="Working-formate-tool" element={<WorkingFormat />} />
          <Route path="deposits-history" element={<TransactionHistory />} /> 
          <Route path="boosting-history" element={<BoostingHistory />} />
          <Route path="number-history" element={<OtpBox />} />
          <Route path="format-history" element={<FormateHistory />} />
          <Route path="picture-history" element={<PictureHistory />} />
          <Route path="user-support" element={<UserSupport />} />
          <Route path="/f/profile" element={<Profile />} />
          <Route path="view-receipt" element={<ViewReceipt />} />
            <Route path="logs-marketplace" element={<UserLogsMarketplace />} />
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
             <Route path="usa-services" element={<AdminUsaServices />} />
             <Route path="other-services" element={<AdminOtherServices />} />
              <Route path="pricing-settings" element={<AdminPricingSettings />} />
              <Route path="social-media-boost" element={<SocialMedia />} />
               <Route path="manage-photos" element={<WorkingPhoto />} />
                <Route path="manage-working-formate" element={<WorkingFormatAdmin />} />
                  <Route path="delivery-rates" element={<DeliveryRateSettings />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="social-orders" element={<SocialOrderManagement />} />
          <Route path="working-orders" element={<WorkingOrderManagement />} />
          <Route path="otp-orders" element={<OtpOrderManagement />} />
          <Route path="manage-gift-products" element={<GiftManagement />} />
          <Route
            path="manage-gift-products/:categorySlug"
            element={<AdminGiftCategoryProducts />}
          />
          <Route path="logs" element={<AdminLogsManagement />} />
                <Route path="support" element={<Support />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

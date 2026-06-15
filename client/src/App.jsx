import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./page/Login";


const App = () => {
  return (
    <>
      <ToastContainer position="bottom-right" theme="colored" />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;

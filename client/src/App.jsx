import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./page/HomePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <ToastContainer position="bottom-right" theme="colored" />

      <Routes>
        <Route path="/" element={<HomePage />} />

      </Routes>
    </>
  );
};

export default App;

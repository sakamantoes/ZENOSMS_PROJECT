import React from "react";
import imageObject from "../utils/image";

const Footer = () => {
  return (
    <footer className="text-gray-400 py-10 px-6 mt-7">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left */}
        <div className="text-center md:text-left flex items-center justify-center flex-col">

          <img src={imageObject.Logo2} className="w-[140px] rounded-2xl"/>
          <p className="text-sm mt-1">
            Virtual numbers • OTP verification • Social growth tools
          </p>
        </div>

        {/* Middle */}
        <div className="flex gap-6 text-sm">
          <a href="#home" className="hover:text-white transition">Home</a>
          <a href="#services" className="hover:text-white transition">Services</a>
        </div>

        {/* Right */}
        <div className="text-sm text-center md:text-right">
          © {new Date().getFullYear()} ZENOSMS. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
import React, { useState, useEffect } from "react";
import imageObject from "../utils/image";

const Homenav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? `
        bg-white/5
        backdrop-blur-[30px]
        border border-white/10
        shadow-2xl
      `
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 border-b-0 border-gray-800">
            <div className="flex items-center space-x-4 bg-white p-1 rounded-md cursor-pointer">
              <img src={imageObject.Logo} alt="Logo" className="h-[40px]" />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <ul className="flex space-x-6 font-light text-gray-300 text-[16px] cursor-pointer">
                <li className="hover:text-white transition-colors duration-300">
                  Services
                </li>
                <li className="hover:text-white transition-colors duration-300">
                  About
                </li>
              </ul>
            </div>

            <div className="hidden md:block">
              <button className="bg-green-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-300 cursor-pointer transition duration-300">
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 focus:outline-none z-50 relative"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`w-full h-0.5 bg-white transition-all duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-white transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`w-full h-0.5 bg-white transition-all duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isMobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-64 bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-2xl transition-transform duration-500 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col pt-20 px-6 space-y-6">
            {/* Mobile Navigation Links */}
            <ul className="flex flex-col space-y-4 font-light text-gray-300 text-[18px]">
              <li
                className="hover:text-white transition-colors duration-300 py-2 border-b border-white/10 cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </li>
              <li
                className="hover:text-white transition-colors duration-300 py-2 border-b border-white/10 cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </li>
            </ul>

            {/* Mobile Button */}
            <button
              className="bg-green-400 text-black px-4 py-3 rounded-lg font-semibold hover:bg-green-300 cursor-pointer transition duration-300 w-full mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Homenav;
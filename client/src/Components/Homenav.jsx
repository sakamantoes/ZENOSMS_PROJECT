import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import imageObject from "../utils/image";
import { Link } from "react-router-dom";

const Homenav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smooth scroll function
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setIsMobileMenuOpen(false); // Close mobile menu if open
    }
  };

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

  // Animation variants
  const navVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const logoVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0, transition: { duration: 0.5, type: "spring", stiffness: 200 } },
    hover: { scale: 1.05, rotate: 5, transition: { duration: 0.2 } }
  };

  const desktopLinkVariants = {
    initial: { opacity: 0, y: -20 },
    animate: (i) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.1, duration: 0.5 } 
    }),
    hover: { scale: 1.05, color: "#ffffff", transition: { duration: 0.2 } }
  };

  const buttonVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { delay: 0.3, duration: 0.4, type: "spring" } },
    hover: { scale: 1.05, backgroundColor: "#4ade80", transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { 
      x: 0, 
      transition: { type: "spring", damping: 25, stiffness: 200 } 
    },
    exit: { 
      x: "100%", 
      transition: { type: "spring", damping: 25, stiffness: 200 } 
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const mobileLinkVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: (i) => ({ 
      opacity: 1, 
      x: 0, 
      transition: { delay: i * 0.1, duration: 0.4 } 
    }),
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
  };

  const mobileButtonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <>
      <motion.nav
        variants={navVariants}
        initial="initial"
        animate="animate"
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
            <motion.div 
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="flex items-center space-x-4  p-1 rounded-md cursor-pointer"
              onClick={(e) => handleSmoothScroll(e, '#home')}
            >
              <img src={imageObject.Logo2} className="w-[140px] rounded-2xl"/>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <ul className="flex space-x-6 font-light text-gray-300 text-[16px] cursor-pointer">
                <motion.li
                  custom={0}
                  variants={desktopLinkVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  onClick={(e) => handleSmoothScroll(e, '#home')}
                  className="hover:text-white transition-colors duration-300"
                >
                  Home
                </motion.li>
                <motion.li
                  custom={1}
                  variants={desktopLinkVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  onClick={(e) => handleSmoothScroll(e, '#services')}
                  className="hover:text-white transition-colors duration-300"
                >
                  Services
                </motion.li>
              </ul>
            </div>

            <motion.div 
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              className="hidden md:block"
            >
                <Link to='/auth'> <button className="bg-green-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-300 cursor-pointer transition duration-300">
                Get Started
              </button></Link>
             
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 focus:outline-none z-50 relative"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-0.5 bg-white block"
                ></motion.span>
                <motion.span
                  animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-0.5 bg-white block"
                ></motion.span>
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-0.5 bg-white block"
                ></motion.span>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40">
            {/* Backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            ></motion.div>

            {/* Sidebar */}
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 top-0 h-full w-64 bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-2xl"
            >
              <div className="flex flex-col pt-20 px-6 space-y-6">
                {/* Mobile Navigation Links */}
                <ul className="flex flex-col space-y-4 font-light text-gray-300 text-[18px]">
                    <Link to='#home'> <motion.li
                    custom={0}
                    variants={mobileLinkVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="hover:text-white transition-colors duration-300 py-2 border-b border-white/10 cursor-pointer"
                    onClick={(e) => handleSmoothScroll(e, '#home')}
                  >
                    Home
                  </motion.li></Link>
                 
                 <Link to='#services'>   <motion.li
                    custom={1}
                    variants={mobileLinkVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="hover:text-white transition-colors duration-300 py-2 border-b border-white/10 cursor-pointer"
                    onClick={(e) => handleSmoothScroll(e, '#services')}
                  >
                    Services
                  </motion.li></Link>
               
                </ul>

                {/* Mobile Button */}
                <Link to='/auth'>
                 <motion.button
                  variants={mobileButtonVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ scale: 1.05, backgroundColor: "#4ade80" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-400 text-black px-4 py-3 rounded-lg font-semibold hover:bg-green-300 cursor-pointer transition duration-300 w-full mt-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </motion.button>
                </Link>
               
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Homenav;
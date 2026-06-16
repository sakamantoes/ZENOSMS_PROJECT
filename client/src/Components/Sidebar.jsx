// components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { LifeBuoy, ShieldCheck, ChevronLeft, ChevronRight, X, Menu } from "lucide-react";
import imageObject from "../utils/image";
import useAuth from "../store/useAuth";
import { useState, useEffect } from "react";

export default function Sidebar({
  navItems,
  onNavigate,
  workspaceLabel = "Workspace",
  statusTitle = "Verification ready",
  statusDescription = "Manage your workspace and keep activity organized.",
  StatusIcon = ShieldCheck,
  supportLabel = "Support",
  userRole = "user",
  isMinimized = false,
  setIsMinimized,
  isMobileOpen = false,
  onMobileClose = null,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSupportClick = (e) => {
    e.preventDefault();
    
    if (userRole === "admin") {
      navigate("/a/support");
      return;
    }
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    const role = user?.data?.role || user?.role;
    if (role === "admin") {
      navigate("/a/support");
    } else {
      navigate("/f/support");
    }
  };

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMobileClose = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside 
      className={`
        flex h-full shrink-0 flex-col border-r border-green-300/30 bg-black backdrop-blur-xl
        transition-all duration-300 ease-in-out
        ${isMinimized ? 'w-16 sm:w-20' : 'w-64 sm:w-72'}
        ${isMobile && !isMinimized ? 'w-72' : ''}
        ${isMobileOpen ? 'fixed inset-y-0 left-0 z-50 shadow-2xl' : 'relative'}
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        .sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.5);
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.3) transparent;
        }

        @media (max-width: 640px) {
          .sidebar-scroll::-webkit-scrollbar {
            width: 2px;
          }
        }

        /* Sidebar Animations */
        @keyframes sidebarFadeIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .sidebar-enter {
          animation: sidebarFadeIn 0.3s ease-out forwards;
        }

        /* Hover glow effect for nav items */
        .nav-item-glow {
          position: relative;
          overflow: hidden;
        }
        .nav-item-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            rgba(34, 197, 94, 0.1) 0%, 
            transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .nav-item-glow:hover::before {
          opacity: 1;
        }
      `}</style>

      {/* Mobile Close Button - Only shows when sidebar is open on mobile */}
      {isMobile && isMobileOpen && (
        <button
          onClick={handleMobileClose}
          className="absolute top-3 right-3 z-50 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      )}

      {/* Header with Brand */}
      <div className={`
        flex items-center border-b border-green-300/30 px-3 sm:px-4 transition-all duration-300
        ${isMinimized ? 'h-14 sm:h-16 justify-center gap-0' : 'h-16 sm:h-20 gap-2 sm:gap-3 justify-between'}
        ${isMobile && !isMinimized ? 'h-16 gap-2' : ''}
        ${isMobile && isMobileOpen ? 'pr-12' : ''}
      `}>
        <div className={`flex items-center ${isMinimized ? 'gap-0' : 'gap-2 sm:gap-3'}`}>
          <img
            src={imageObject.Logo3}
            alt="Zenosms"
            className="rounded-lg object-contain h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
          />
          <div className={`transition-all duration-300 ${isMinimized ? 'hidden' : 'block'}`}>
            <p className="bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-base sm:text-lg font-bold text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Zenosms
            </p>
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 truncate max-w-[100px] sm:max-w-none" style={{ fontFamily: "'Inter', sans-serif" }}>
              {workspaceLabel}
            </p>
          </div>
        </div>

        {/* Minimize Toggle Button - Hide on mobile when sidebar is open */}
        {(!isMobile || !isMobileOpen) && (
          <button
            onClick={toggleSidebar}
            className={`
              hidden sm:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 
              hover:border-green-500/50 transition-all duration-300 group
              ${isMinimized ? 'scale-90' : ''}
            `}
            aria-label="Toggle sidebar"
          >
            {isMinimized ? (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
            ) : (
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
            )}
          </button>
        )}

        {/* Mobile Menu Button - Only shows when sidebar is minimized on mobile */}
        {isMobile && !isMobileOpen && !isMinimized && (
          <button
            onClick={handleMobileClose}
            className="lg:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all duration-200"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto px-2 sm:px-3 py-3 sm:py-5 sidebar-scroll">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={() => {
              if (onNavigate) onNavigate();
              if (isMobile && isMobileOpen && onMobileClose) {
                onMobileClose();
              }
            }}
            className={({ isActive }) => `
              nav-item-glow flex items-center rounded-lg px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200
              hover:bg-white/5 hover:text-white
              ${isActive 
                ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/10' 
                : 'text-gray-400'
              }
              ${isMinimized ? 'h-10 sm:h-12 justify-center' : 'h-9 sm:h-11 gap-2 sm:gap-3'}
              ${isMobile && !isMinimized ? 'h-10 gap-2' : ''}
            `}
            title={isMinimized ? item.label : ''}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <item.icon size={isMinimized ? 16 : 17} className="shrink-0" />
            <span className={`transition-all duration-300 text-xs sm:text-sm ${isMinimized ? 'hidden' : 'block'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-2 sm:space-y-3 border-t border-green-300/30 p-2 sm:p-4">
        {/* Status Indicator (only when expanded) */}
        <div className={`transition-all duration-300 ${isMinimized ? 'hidden' : 'block'}`}>
          <div className="flex items-start gap-2 sm:gap-3 rounded-xl bg-white/5 p-2 sm:p-3 border border-white/5">
            <div className="relative flex-shrink-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500/20 animate-ping" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-white truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {statusTitle}
              </p>
              <p className="text-[9px] sm:text-xs text-gray-500 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
                {statusDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Status Dot (minimized) */}
        <div className={`transition-all duration-300 ${isMinimized ? 'flex justify-center' : 'hidden'}`}>
          <div className="relative">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500/20 animate-ping" />
          </div>
        </div>

        {/* Support Button */}
        <button
          onClick={handleSupportClick}
          className={`
            flex items-center justify-center rounded-lg border border-white/10 
            text-[10px] sm:text-sm font-semibold text-gray-200 transition-all duration-200
            hover:bg-white/5 hover:text-white hover:border-green-500/30
            active:scale-95
            ${isMinimized ? 'h-10 sm:h-12 w-full' : 'h-9 sm:h-10 w-full gap-1.5 sm:gap-2'}
            ${isMobile && !isMinimized ? 'h-10 gap-1.5' : ''}
          `}
          title={isMinimized ? supportLabel : ''}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <LifeBuoy size={isMinimized ? 16 : 15} className="shrink-0" />
          <span className={`transition-all duration-300 text-[10px] sm:text-sm ${isMinimized ? 'hidden' : 'inline'}`}>
            {supportLabel}
          </span>
        </button>
      </div>
    </aside>
  );
}
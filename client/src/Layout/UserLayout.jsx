import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Clock,
  Gauge,
  Globe,
  Image,
  LogOut,
  Menu,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  ToolCase,
  Wallet,
  X,
  LayoutDashboard,
  Receipt,
  Box,
} from "lucide-react";
import Sidebar from "../Components/Sidebar.jsx";
import useAuth from "../store/useAuth";
import { logout } from "../Service/auth.js";
import NotificationBell from "../Components/NotificationBell.jsx";
import FloatingChat from '../Components/FloatingChat.jsx'
import { FaHashtag } from "react-icons/fa";

const userNavItems = [
  { label: "Dashboard", to: "/f/dashboard", icon: Gauge },
  // { label: "Deposit", to: "/f/make-deposit", icon: FaHashtag },
  { label: "Buy USA Number", to: "/f/usa-numbers", icon: Phone },
  { label: "Other Country Numbers", to: "/f/other-numbers-1", icon: Globe },
  // {label: "otp box", to: "/f/otp-box", icon: Box},
  { label: "Social Media Boosting", to: "/f/social-media-boosting", icon: Rocket },
  { label: "Working Picture", to: "/f/Working-picture", icon: Image },
  { label: "Working Formats and Tools", to: "/f/working-formate-tool", icon: ToolCase },
  { label: "View Reciept", to: "/f/view-receipt", icon: Receipt },
  { label: "Transaction History", to: "/f/deposits-history", icon: Clock },
  { label: "Otp box & Number History", to: "/f/number-history", icon: Clock },
  { label: "Boosting History", to: "/f/boosting-history", icon: Clock },
  { label: "Formats History", to: "/f/format-history", icon: Clock },
  { label: "Picture History", to: "/f/picture-history", icon: Clock },
];

const userSidebarConfig = {
  navItems: userNavItems,
  workspaceLabel: "User workspace",
  statusTitle: "Verification ready",
  statusDescription: "Buy numbers, receive OTP codes, and keep every activation organized.",
  StatusIcon: ShieldCheck,
};

const userFallback = {
  name: "Verified User",
  email: "user@zenosms.com",
};

// Page title mapping
const pageTitles = {
  "/f/dashboard": "Dashboard",
  "/f/make-deposit": "Deposit",
  "/f/usa-numbers": "Buy USA Number",
  "/f/other-numbers-1": "Other Country Numbers",
  "/f/other-numbers-2": "Other Country Numbers I",
  "/f/social-media-boosting": "Social Media Boosting",
  "/f/Working-picture": "Working Picture",
  "/f/working-formate-tool": "Working Formats & Tools",
  "/f/deposits-history": "Transaction History",
  "/f/boosting-history": "Boosting History",
  "/f/number-history": "Number History",
  "/f/format-history": "Formats History",
  "/f/picture-history": "Picture History",
  "/f/view-receipt" : "View Receipt"
};

const getPageTitle = (pathname) => {
  return pageTitles[pathname] || "User Dashboard";
};

const UserLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, clearAuth } = useAuth();
  const profile = user?.data || user || userFallback;
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsMinimized(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageTitle = getPageTitle(location.pathname);

  // Calculate sidebar width - 0 on mobile
  const sidebarWidth = isMobile ? 0 : (isMinimized ? 80 : 288);
  const headerPaddingLeft = isMobile ? 0 : sidebarWidth;
  const mainPaddingLeft = isMobile ? 16 : sidebarWidth + 32;

  const initial = (profile.name || profile.email || "U")
    .slice(0, 1)
    .toUpperCase();
  const displayName = profile.username || profile.name || userFallback.name;
  const displayEmail = profile.email || userFallback.email;

  const clearAllTokensAndCookies = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
    }
    document.cookie = "ZenosmsToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("ZenosmsToken");
    localStorage.removeItem("persist:root");
    localStorage.clear();
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
    sessionStorage.clear();
    if (window.caches) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn("Logout API failed", error);
    }
    clearAllTokensAndCookies();
    clearAuth();
    navigate("/auth");
  };

  const closeMobileNav = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen text-white bg-black" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block transition-all duration-300 ease-in-out">
        <Sidebar
          {...userSidebarConfig}
          userRole="user"
          supportLabel="Support"
          onNavigate={() => {}}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300"
            onClick={closeMobileNav}
          />
          <div className="relative h-full w-72">
            <Sidebar
              {...userSidebarConfig}
              userRole="user"
              supportLabel="Support"
              onNavigate={closeMobileNav}
              isMinimized={false}
              setIsMinimized={() => {}}
              isMobileOpen={mobileOpen}
              onMobileClose={closeMobileNav}
            />
          </div>
        </div>
      )}

      {/* Main content wrapper */}
      <div className="min-h-screen flex flex-col">
        {/* Header - fixed with responsive padding */}
        <header 
          className="fixed top-0 z-30 border-b border-white/5 bg-gradient-to-br from-black via-gray-900/95 to-black backdrop-blur-xl transition-all duration-300 ease-in-out"
          style={{
            left: 0,
            right: 0,
            paddingLeft: `${headerPaddingLeft}px`,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 lg:px-8">
            {/* Left: mobile toggle + page title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center text-white justify-center rounded-lg border border-white/10 transition-colors hover:bg-white/5 lg:hidden"
              >
                {mobileOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 hidden sm:block flex-shrink-0" />
                <h1 className="text-base sm:text-[25px] lg:text-[25px] font-bold text-white tracking-tight truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {pageTitle}
                </h1>
                <span className="hidden sm:inline-block text-[10px] sm:text-xs text-gray-500 bg-white/5 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/5 whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
                  User
                </span>
              </div>
            </div>

            {/* Right: notifications + user + logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
              <div className="border border-green-200/30 cursor-pointer rounded-full">
                <NotificationBell />
              </div>

              <div className="hidden sm:flex items-center gap-2 lg:gap-3 border-l border-white/10 pl-2 lg:pl-3">
                <div
                  aria-hidden="true"
                  className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-green-500 text-xs sm:text-sm font-bold text-white shadow-lg shadow-green-500/20"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {initial}
                </div>
                <div className="hidden md:block w-20 lg:w-32 xl:w-40">
                  <p className="truncate text-xs sm:text-sm font-semibold leading-tight text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {displayName}
                  </p>
                  <p className="truncate text-[10px] sm:text-xs leading-tight text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {displayEmail}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Log out"
                onClick={handleLogout}
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-red-400 group"
              >
                <LogOut size={16} sm:size={18} aria-hidden="true" className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* Spacer to account for fixed header */}
        <div className="h-16" />

        {/* Main content with responsive padding */}
        <main 
          className="flex-1 min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out"
          style={{ 
            paddingLeft: `${mainPaddingLeft}px`,
            paddingRight: '16px',
            paddingTop: '24px',
            paddingBottom: '24px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div className="w-full max-w-full">
            <Outlet />
            <FloatingChat />
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
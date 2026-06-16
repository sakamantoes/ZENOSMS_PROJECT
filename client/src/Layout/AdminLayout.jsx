import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Gauge,
  LogOut,
  Menu,
  Phone,
  ShieldCheck,
  Wallet,
  X,
  Users,
  Activity,
  CameraIcon,
  Workflow,
  LayoutDashboard,
} from "lucide-react";
import Sidebar from "../Components/Sidebar.jsx";
import useAuth from "../store/useAuth";
import { logout } from "../service/auth.js";
import FloatingChat from '../Components/FloatingChat.jsx'

const adminNavItems = [
  { label: "Dashboard", to: "/a/dashboard", icon: Gauge },
  { label: "Users Management", to: "/a/users", icon: Users },
  { label: "Services & Price Control", to: "/a/numbers", icon: Phone },
  { label: "Social media management", to: "/a/social-media-boost", icon: Activity },
  { label: "Working Photo management", to: "/a/manage-photos", icon: CameraIcon },
  { label: "Working Formate and Tool", to: "/a/manage-working-formate", icon: Workflow },
  { label: "Payment Tracking", to: "/a/deposits", icon: Wallet },
];

const adminSidebarConfig = {
  navItems: adminNavItems,
  workspaceLabel: "Admin workspace",
  statusTitle: "Admin access",
  statusDescription: "Manage users, monitor transactions, and oversee system operations.",
  StatusIcon: ShieldCheck,
};

const adminFallback = {
  name: "Admin User",
  email: "admin@zenosms.com",
};

// Page title mapping
const pageTitles = {
  "/a/dashboard": "Dashboard",
  "/a/users": "Users Management",
  "/a/numbers": "Services & Price Control",
  "/a/social-media-boost": "Social Media Management",
  "/a/manage-photos": "Working Photo Management",
  "/a/manage-working-formate": "Working Format & Tool",
  "/a/deposits": "Payment Tracking",
};

const getPageTitle = (pathname) => {
  return pageTitles[pathname] || "Admin Panel";
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, clearAuth } = useAuth();
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

  const profile = user?.data || user || adminFallback;
  const pageTitle = getPageTitle(location.pathname);

  // Calculate sidebar width - 0 on mobile
  const sidebarWidth = isMobile ? 0 : (isMinimized ? 80 : 288);
  const headerPaddingLeft = isMobile ? 0 : sidebarWidth;
  const mainPaddingLeft = isMobile ? 16 : sidebarWidth + 32;

  const initial = (profile.name || profile.email || "A")
    .slice(0, 1)
    .toUpperCase();
  const displayName = profile.username || profile.name || adminFallback.name;
  const displayEmail = profile.email || adminFallback.email;

  const clearAllTokensAndCookies = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    document.cookie = "ZenosmsToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("Zenosms_token");
    localStorage.clear();
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
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
          {...adminSidebarConfig}
          onNavigate={() => {}}
          userRole="admin"
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
              {...adminSidebarConfig}
              onNavigate={closeMobileNav}
              userRole="admin"
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
          className="fixed top-0 z-30 border-b border-white/5 bg-black backdrop-blur-xl transition-all duration-300 ease-in-out"
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
                className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white transition-colors hover:bg-white/5 lg:hidden"
              >
                {mobileOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
              </button>

              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 hidden sm:block flex-shrink-0" />
                <h1 className="text-base sm:text-[25px] lg:text-[25px] font-bold text-white tracking-tight truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {pageTitle}
                </h1>
                <span className="hidden sm:inline-block text-[10px] sm:text-xs text-gray-500 bg-white/5 px-1.5 sm:px-2 py-0.5 rounded-full border border-white/5 whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Admin
                </span>
              </div>
            </div>

            {/* Right: user + logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0">
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

export default AdminLayout;
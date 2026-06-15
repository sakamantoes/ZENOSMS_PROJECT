// components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../service/auth";
import useAuth from "../store/useAuth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ role, children }) {
  const { user, status, setStatus, setAuthUser, clearAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      setStatus("checking");
      setIsChecking(true);

      try {
        const response = await getAuthUser();
        
        if (response && (response.status === 200 || response.status === 201)) {
          const userData = response.data || response;
          setAuthUser(userData);
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        clearAuth();
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    // Only check if we have a token but no user
    const token = localStorage.getItem("zenosms_token");
    if (token && !user) {
      checkUser();
    } else if (!token) {
      setIsChecking(false);
      setStatus("unauthenticated");
    } else {
      setIsChecking(false);
    }

    return () => {
      isMounted = false;
    };
  }, [clearAuth, setAuthUser, setStatus, user]);

  // Show loading spinner while checking
  if (isChecking || status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin w-8 h-8 text-green-500" />
          <p className="text-gray-400 text-sm">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (status === "unauthenticated" || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Check role if specified
  const authUser = user?.data || user;
  if (role && authUser?.role !== role) {
    return <Navigate to="/auth" replace />;
  }

  // Render children or outlet
  return children || <Outlet />;
}
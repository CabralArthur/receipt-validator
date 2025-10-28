import { useLocation, Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

import useIsLogged from "@/hooks/useIsLogged";

export default function PrivateRouteGuard() {
  const { user, loading } = useIsLogged();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (pathname === "/") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

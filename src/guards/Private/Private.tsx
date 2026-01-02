import { useLocation, Navigate, Outlet } from "react-router-dom";

import useIsLogged from "@/hooks/useIsLogged";

export default function PrivateRouteGuard() {
  const { user, loading } = useIsLogged();
  const { pathname } = useLocation();

  // Se estiver carregando, renderiza o Outlet (App) que tem seu próprio loading customizado
  if (loading) {
    return <Outlet />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (pathname === "/") {
    return <Navigate to="/employees" replace />;
  }

  return <Outlet />;
};

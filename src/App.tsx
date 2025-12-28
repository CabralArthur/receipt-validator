import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useUserStore } from "./stores/user.store";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "./processes/user";
import useIsLogged from "./hooks/useIsLogged";
import Logo from "./components/ui/logo";
import Sidebar from "./components/ui/sidebar";
import { Button } from "./components/ui/button";
import { Menu } from "lucide-react";

function App() {
  const { setUserInfo } = useUserStore();
  const { user } = useIsLogged();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Hide sidebar on integration success page
  const isIntegrationSuccessPage = location.pathname === '/integration-success';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const { isLoading } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const userInfo = await getUserInfo();

      if (userInfo) {
        // Transformar User para UserInfo
        const userStoreInfo = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name
        };
        setUserInfo(userStoreInfo);
      }

      return userInfo;
    },
    enabled: !!user, // Só executa se o usuário estiver logado
  });

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center gap-6">
          {/* Logo/Brand */}
          <Logo size="md" className="mb-4" />
          
          {/* Animated Loader */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full animate-spin border-t-green-700"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-green-300 opacity-20"></div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-1">
              Carregando suas informações
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Aguarde um momento...
            </p>
          </div>
          
          {/* Animated Dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-700 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar - hidden on integration success page */}
      {!isIntegrationSuccessPage && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile header - hidden on integration success page */}
        {!isIntegrationSuccessPage && (
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              refund.ai
            </h1>
            <div className="w-8" /> {/* Spacer for centering */}
          </div>
        )}

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto ${isIntegrationSuccessPage ? '' : 'p-6'}`}>
          {isIntegrationSuccessPage ? (
            <Outlet />
          ) : (
            <div className="p-6">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

import { Outlet } from "react-router-dom";
import { useUserStore } from "./stores/user.store";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "./processes/user";
import useIsLogged from "./hooks/useIsLogged";
import Logo from "./components/ui/logo";

function App() {
  const { setUserInfo } = useUserStore();
  const { user } = useIsLogged();

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
            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 rounded-full animate-spin border-t-blue-500"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-300 opacity-20"></div>
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
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default App;

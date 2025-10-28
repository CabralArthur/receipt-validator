import { Outlet } from "react-router-dom";
import { useUserStore } from "./stores/user.store";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "./processes/user";
import { Loader } from "lucide-react";
import useIsLogged from "./hooks/useIsLogged";

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
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading your information...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default App;

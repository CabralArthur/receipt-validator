import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  listInboxAliases, 
  updateUserProfile,
  updateUserPassword
} from "@/processes/inboxAliases";
import { useUserStore } from "@/stores/user.store";

interface UpdateProfileData {
  name: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const useSettingsContainer = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "email">("profile");

  const { userInfo, setUserInfo } = useUserStore();

  // Listar aliases de email
  const { data: aliases = [], isLoading: aliasesLoading, error: aliasesError } = useQuery({
    queryKey: ['inbox-aliases'],
    queryFn: listInboxAliases,
  });

  // Atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (_, variables) => {
      // Atualizar o store local
      if (userInfo) {
        setUserInfo({
          ...userInfo,
          name: variables.name,
        });
      }
    },
  });

  // Atualizar senha
  const updatePasswordMutation = useMutation({
    mutationFn: (data: { newPassword: string }) => updateUserPassword(data.newPassword),
  });

  // Handlers
  const handleUpdateProfile = (data: UpdateProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const handleUpdatePassword = (data: UpdatePasswordData) => {
    updatePasswordMutation.mutate({ newPassword: data.newPassword });
  };

  return {
    // Data
    aliases,
    userInfo,
    activeTab,
    
    // Loading states
    aliasesLoading,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    
    // Error states
    aliasesError,
    updateProfileError: updateProfileMutation.error,
    updatePasswordError: updatePasswordMutation.error,
    
    // Handlers
    handleUpdateProfile,
    handleUpdatePassword,
    
    // Tab control
    setActiveTab,
  };
};

export default useSettingsContainer;

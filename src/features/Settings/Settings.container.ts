import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listInboxAliases, 
  createInboxAlias, 
  deleteInboxAlias,
  updateUserProfile,
  updateUserPassword
} from "@/processes/inboxAliases";
import { InboxAlias } from "@/processes/inboxAliases";
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
  const [isCreateAliasModalOpen, setIsCreateAliasModalOpen] = useState(false);
  const [isDeleteAliasModalOpen, setIsDeleteAliasModalOpen] = useState(false);
  const [selectedAlias, setSelectedAlias] = useState<InboxAlias | null>(null);
  const [deleteAliasId, setDeleteAliasId] = useState<string | null>(null);

  const { userInfo, setUserInfo } = useUserStore();
  const queryClient = useQueryClient();

  // Listar aliases de email
  const { data: aliases = [], isLoading: aliasesLoading, error: aliasesError } = useQuery({
    queryKey: ['inbox-aliases'],
    queryFn: listInboxAliases,
  });

  // Criar alias
  const createAliasMutation = useMutation({
    mutationFn: createInboxAlias,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-aliases'] });
      setIsCreateAliasModalOpen(false);
    },
  });

  // Deletar alias
  const deleteAliasMutation = useMutation({
    mutationFn: deleteInboxAlias,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox-aliases'] });
      setIsDeleteAliasModalOpen(false);
      setDeleteAliasId(null);
    },
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
  const handleCreateAlias = (inbound_address: string) => {
    createAliasMutation.mutate(inbound_address);
  };

  const handleDeleteAlias = () => {
    if (deleteAliasId) {
      deleteAliasMutation.mutate(deleteAliasId);
    }
  };

  const handleUpdateProfile = (data: UpdateProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const handleUpdatePassword = (data: UpdatePasswordData) => {
    updatePasswordMutation.mutate({ newPassword: data.newPassword });
  };

  const openDeleteAliasModal = (aliasId: string) => {
    setDeleteAliasId(aliasId);
    setIsDeleteAliasModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateAliasModalOpen(false);
    setIsDeleteAliasModalOpen(false);
    setSelectedAlias(null);
    setDeleteAliasId(null);
  };

  return {
    // Data
    aliases,
    userInfo,
    activeTab,
    
    // Loading states
    aliasesLoading,
    isCreatingAlias: createAliasMutation.isPending,
    isDeletingAlias: deleteAliasMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    
    // Error states
    aliasesError,
    createAliasError: createAliasMutation.error,
    deleteAliasError: deleteAliasMutation.error,
    updateProfileError: updateProfileMutation.error,
    updatePasswordError: updatePasswordMutation.error,
    
    // Modal states
    isCreateAliasModalOpen,
    isDeleteAliasModalOpen,
    
    // Handlers
    handleCreateAlias,
    handleDeleteAlias,
    handleUpdateProfile,
    handleUpdatePassword,
    openDeleteAliasModal,
    closeModals,
    
    // Tab control
    setActiveTab,
    
    // Modal controls
    setIsCreateAliasModalOpen,
    setIsDeleteAliasModalOpen,
  };
};

export default useSettingsContainer;

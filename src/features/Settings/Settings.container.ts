import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listInboxAliases, 
  updateUserProfile,
  updateUserPassword
} from "@/processes/inboxAliases";
import { useUserStore } from "@/stores/user.store";
import { listEmployees } from "@/processes/employee";
import { 
  uploadAndCreatePolicy, 
  getLatestUserPolicy, 
  softDeleteReimbursementPolicy
} from "@/processes/reimbursementPolicies";

interface UpdateProfileData {
  name: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const useSettingsContainer = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "integrations" | "policy">("profile");
  const queryClient = useQueryClient();

  const { userInfo, setUserInfo } = useUserStore();

  // Listar aliases de email
  const { data: aliases = [], isLoading: aliasesLoading, error: aliasesError } = useQuery({
    queryKey: ['inbox-aliases'],
    queryFn: listInboxAliases,
  });

  // Listar employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: listEmployees,
  });

  // Buscar política atual
  const { data: currentPolicy, isLoading: policyLoading, error: policyError } = useQuery({
    queryKey: ['reimbursement-policy', userInfo?.id],
    queryFn: () => userInfo ? getLatestUserPolicy(userInfo.id) : null,
    enabled: !!userInfo,
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

  // Upload de política
  const uploadPolicyMutation = useMutation({
    mutationFn: (file: File) => {
      if (!userInfo) throw new Error("Usuário não encontrado");
      return uploadAndCreatePolicy(file, userInfo.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursement-policy'] });
    },
  });

  // Remover política
  const deletePolicyMutation = useMutation({
    mutationFn: (policyId: string) => softDeleteReimbursementPolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursement-policy'] });
    },
  });

  // Handlers
  const handleUpdateProfile = (data: UpdateProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const handleUpdatePassword = (data: UpdatePasswordData) => {
    updatePasswordMutation.mutate({ newPassword: data.newPassword });
  };

  const handleUploadPolicy = (file: File) => {
    uploadPolicyMutation.mutate(file);
  };

  const handleDeletePolicy = (policyId: string) => {
    deletePolicyMutation.mutate(policyId);
  };

  return {
    // Data
    aliases,
    userInfo,
    activeTab,
    employees,
    currentPolicy,
    
    // Loading states
    aliasesLoading,
    employeesLoading,
    policyLoading,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isUploadingPolicy: uploadPolicyMutation.isPending,
    isDeletingPolicy: deletePolicyMutation.isPending,
    
    // Error states
    aliasesError,
    policyError,
    updateProfileError: updateProfileMutation.error,
    updatePasswordError: updatePasswordMutation.error,
    uploadPolicyError: uploadPolicyMutation.error,
    deletePolicyError: deletePolicyMutation.error,
    
    // Handlers
    handleUpdateProfile,
    handleUpdatePassword,
    handleUploadPolicy,
    handleDeletePolicy,
    
    // Tab control
    setActiveTab,
  };
};

export default useSettingsContainer;

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
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
    // Polling: verificar a cada 5 segundos se não houver regras
    refetchInterval: (query) => {
      const policy = query.state.data;
      
      // Se não houver política, não faz polling
      if (!policy) {
        return false;
      }
      
      // Se já tiver regras, para o polling
      if (policy.rules && policy.rules.trim().length > 0) {
        return false;
      }
      
      // Se não houver regras, verifica se a política foi criada recentemente (últimas 2 horas)
      if (policy.created_at) {
        const createdAt = new Date(policy.created_at);
        const now = new Date();
        const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        
        // Se passou mais de 2 horas desde a criação, para o polling
        if (diffInMinutes > 120) {
          return false;
        }
      }
      
      // Faz polling a cada 5 segundos se não houver regras e a política for recente
      return 5000;
    },
    // Refetch quando a janela ganha foco (se não houver regras)
    refetchOnWindowFocus: (query) => {
      const policy = query.state.data;
      if (!policy) return false;
      if (policy.rules && policy.rules.trim().length > 0) return false;
      
      // Só refetch se a política for recente (últimas 2 horas)
      if (policy.created_at) {
        const createdAt = new Date(policy.created_at);
        const now = new Date();
        const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        return diffInMinutes <= 120;
      }
      
      return true;
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
    userInfo,
    activeTab,
    employees,
    currentPolicy,
    
    // Loading states
    employeesLoading,
    policyLoading,
    isUpdatingProfile: updateProfileMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isUploadingPolicy: uploadPolicyMutation.isPending,
    isDeletingPolicy: deletePolicyMutation.isPending,
    
    // Error states
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

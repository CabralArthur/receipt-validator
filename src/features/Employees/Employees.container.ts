import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listEmployees, 
  createEmployee, 
  updateEmployee, 
  softDeleteEmployee 
} from "@/processes/employee";
import { Employee } from "@/lib/supabaseClient";

interface CreateEmployeeData {
  name: string;
  email: string;
}

interface UpdateEmployeeData {
  id: string;
  name: string;
  email: string;
}

const useEmployeesContainer = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Listar employees
  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: listEmployees,
  });

  // Criar employee
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsCreateModalOpen(false);
    },
  });

  // Atualizar employee
  const updateMutation = useMutation({
    mutationFn: ({ id, name, email }: UpdateEmployeeData) => 
      updateEmployee(id, { name, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    },
  });

  // Deletar employee
  const deleteMutation = useMutation({
    mutationFn: softDeleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDeleteModalOpen(false);
      setDeleteEmployeeId(null);
    },
  });

  // Handlers
  const handleCreateEmployee = (data: CreateEmployeeData) => {
    createMutation.mutate(data);
  };

  const handleEditEmployee = (data: CreateEmployeeData) => {
    if (selectedEmployee) {
      updateMutation.mutate({
        id: selectedEmployee.id,
        ...data
      });
    }
  };

  const handleDeleteEmployee = () => {
    if (deleteEmployeeId) {
      deleteMutation.mutate(deleteEmployeeId);
    }
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (employeeId: string) => {
    setDeleteEmployeeId(employeeId);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
    setDeleteEmployeeId(null);
  };

  return {
    // Data
    employees,
    selectedEmployee,
    isLoading,
    error,
    
    // Modal states
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Handlers
    handleCreateEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    openEditModal,
    openDeleteModal,
    closeModals,
    
    // Modal controls
    setIsCreateModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
  };
};

export default useEmployeesContainer;
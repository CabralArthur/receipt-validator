import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Users, 
  FileText, 
  BarChart3, 
  Edit, 
  Trash2, 
  Mail, 
  Loader2
} from "lucide-react";
import { useEmployeesContainer, EmployeeModal, DeleteConfirmModal } from "./";

export default function Employees() {
  const {
    employees,
    isLoading,
    error,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedEmployee,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
    handleCreateEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    openEditModal,
    openDeleteModal,
    closeModals,
    setIsCreateModalOpen,
  } = useEmployeesContainer();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <p>Erro ao carregar funcionários</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Funcionários
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie os funcionários que enviaram documentos para validação
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              Funcionários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Aguardando validação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Validação</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              Documentos validados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os funcionários cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhum funcionário encontrado
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Comece adicionando seu primeiro funcionário
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Funcionário
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {employee.name}
                      </h3>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                        <Mail className="h-4 w-4 mr-1" />
                        {employee.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full border border-transparent bg-slate-100 text-slate-900 px-2.5 py-0.5 text-xs font-semibold dark:bg-slate-800 dark:text-slate-100">
                      Ativo
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(employee)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(employee.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEmployee}
        isLoading={isCreating}
        error={createError}
        title="Adicionar Funcionário"
        submitText="Criar Funcionário"
      />

      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => closeModals()}
        onSubmit={handleEditEmployee}
        isLoading={isUpdating}
        error={updateError}
        title="Editar Funcionário"
        submitText="Salvar Alterações"
        initialData={selectedEmployee ? {
          name: selectedEmployee.name,
          email: selectedEmployee.email
        } : undefined}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => closeModals()}
        onConfirm={handleDeleteEmployee}
        isLoading={isDeleting}
        error={deleteError}
        title="Excluir Funcionário"
        description="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
      />
    </div>
  );
}

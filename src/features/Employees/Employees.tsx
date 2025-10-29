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
  Eye,
  Search,
  CheckCircle,
  Clock
} from "lucide-react";
import { useEmployeesContainer, EmployeeModal, DeleteConfirmModal } from "./";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchDashboardStats, formatCurrency, calculateApprovalRate, DashboardStats } from "@/processes/dashboardStats";

export default function Employees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
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

  // Buscar estatísticas do dashboard
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const statsData = await fetchDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // Filtrar funcionários baseado na pesquisa
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Componente de Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 shimmer rounded mb-2"></div>
          <div className="h-4 w-80 shimmer rounded"></div>
        </div>
        <div className="h-10 w-40 shimmer rounded"></div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-12 w-full shimmer rounded-lg"></div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 shimmer rounded"></div>
              <div className="h-4 w-4 shimmer rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 shimmer rounded mb-2"></div>
              <div className="h-3 w-20 shimmer rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employees List Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 shimmer rounded mb-2"></div>
          <div className="h-4 w-64 shimmer rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 shimmer rounded-full"></div>
                  <div>
                    <div className="h-4 w-48 shimmer rounded mb-2"></div>
                    <div className="h-3 w-32 shimmer rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-16 shimmer rounded-full"></div>
                  <div className="h-8 w-8 shimmer rounded"></div>
                  <div className="h-8 w-8 shimmer rounded"></div>
                  <div className="h-8 w-8 shimmer rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .shimmer {
            background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
            background-size: 200% 100%;
            animation: shimmer 2s ease-in-out infinite;
          }
          .dark .shimmer {
            background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
            background-size: 200% 100%;
            animation: shimmer 2s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Pesquisar funcionários por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="h-8 w-12 shimmer rounded"></div>
              ) : (
                stats?.total_employees || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Funcionários ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comprovantes Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoadingStats ? (
                <div className="h-8 w-12 shimmer rounded"></div>
              ) : (
                stats?.approved_receipts || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor: {isLoadingStats ? (
                <div className="h-3 w-16 shimmer rounded inline-block"></div>
              ) : (
                formatCurrency(stats?.approved_amount || 0)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comprovantes Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoadingStats ? (
                <div className="h-8 w-12 shimmer rounded"></div>
              ) : (
                stats?.pending_receipts || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor: {isLoadingStats ? (
                <div className="h-3 w-16 shimmer rounded inline-block"></div>
              ) : (
                formatCurrency(stats?.pending_amount || 0)
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="h-8 w-12 shimmer rounded"></div>
              ) : (
                `${calculateApprovalRate(stats?.approved_receipts || 0, stats?.total_receipts || 0)}%`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingStats ? (
                <div className="h-3 w-20 shimmer rounded"></div>
              ) : (
                `${stats?.total_receipts || 0} comprovantes totais`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>
            {searchTerm ? (
              `Mostrando ${filteredEmployees.length} de ${employees.length} funcionários`
            ) : (
              "Visualize e gerencie todos os funcionários cadastrados"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                {searchTerm ? "Nenhum funcionário encontrado" : "Nenhum funcionário cadastrado"}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchTerm ? (
                  `Nenhum funcionário encontrado para "${searchTerm}"`
                ) : (
                  "Comece adicionando seu primeiro funcionário"
                )}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Funcionário
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
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
                        onClick={() => navigate(`/employees/${employee.id}`)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(employee)}
                        className="h-8 w-8 p-0"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(employee.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Excluir"
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

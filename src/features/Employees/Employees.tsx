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
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  XCircle
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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

  // Paginação
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Resetar página quando a pesquisa mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
    <div className="flex flex-col gap-4">
      {/* Shimmer styles */}
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
      
      {/* Header */}
      <div className="flex items-center justify-between mt-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Funcionários
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Gerencie os funcionários que enviaram documentos para validação
          </p>
        </div>
        <Button 
          size="sm"
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
          disabled={isLoadingStats}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Comprovantes Aprovados */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 dark:bg-green-900/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">Comprovantes Aprovados</CardTitle>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center relative z-10">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoadingStats ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <div className="h-7 w-6 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="h-3.5 w-3.5 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <div className="h-3.5 w-3.5 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    <div className="h-3.5 w-16 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 shimmer rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats?.approved_receipts || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Valor: {formatCurrency(stats?.approved_amount || 0)}
                </p>
                {stats && stats.total_receipts > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 dark:text-green-400 font-medium text-[10px]">
                        {Math.round((stats.approved_receipts / stats.total_receipts) * 100)}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">do total</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.approved_receipts / stats.total_receipts) * 100)}%` }}
                      ></div>
                    </div>  
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Comprovantes Pendentes */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 dark:bg-yellow-900/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">Comprovantes Pendentes</CardTitle>
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center relative z-10">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoadingStats ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <div className="h-7 w-6 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="h-3.5 w-3.5 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <div className="h-3.5 w-3.5 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    <div className="h-3.5 w-16 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 shimmer rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {stats?.pending_receipts || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Valor: {formatCurrency(stats?.pending_amount || 0)}
                </p>
                {stats && stats.total_receipts > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium text-[10px]">
                        {Math.round((stats.pending_receipts / stats.total_receipts) * 100)}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">do total</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.pending_receipts / stats.total_receipts) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Comprovantes Rejeitados */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 dark:bg-red-900/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">Comprovantes Rejeitados</CardTitle>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center relative z-10">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoadingStats ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <div className="h-7 w-6 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="h-3.5 w-3.5 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <div className="h-3.5 w-3.5 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    <div className="h-3.5 w-16 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 shimmer rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {stats?.rejected_receipts || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Valor: {formatCurrency(stats?.rejected_amount || 0)}
                </p>
                {stats && stats.total_receipts > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-600 dark:text-red-400 font-medium text-[10px]">
                        {Math.round((stats.rejected_receipts / stats.total_receipts) * 100)}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">do total</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.rejected_receipts / stats.total_receipts) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Taxa de Aprovação */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 dark:bg-blue-900/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">Taxa de Aprovação</CardTitle>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center relative z-10">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoadingStats ? (
              <>
                <div className="flex items-center gap-1 mb-1">
                  <div className="h-7 w-6 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <div className="h-3.5 w-3.5 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <div className="h-3.5 w-3.5 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                    </div>
                    <div className="h-3.5 w-16 shimmer rounded bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 shimmer rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {`${calculateApprovalRate(stats?.approved_receipts || 0, stats?.total_receipts || 0)}%`}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {`${stats?.total_receipts || 0} comprovantes totais`}
                </p>
                {stats && stats.total_receipts > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 text-[10px]">
                        <TrendingUp className="h-2.5 w-2.5" />
                        {calculateApprovalRate(stats.approved_receipts, stats.total_receipts)}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">do total</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, calculateApprovalRate(stats.approved_receipts, stats.total_receipts))}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                Lista de Funcionários
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {searchTerm ? (
                  `Mostrando ${filteredEmployees.length} de ${employees.length} funcionários`
                ) : (
                  "Visualize e gerencie todos os funcionários cadastrados"
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Users className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {employees.length} {employees.length === 1 ? 'funcionário' : 'funcionários'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shimmer"></div>
                    <div className="min-w-0">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded shimmer mb-1.5"></div>
                      <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded shimmer"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full shimmer"></div>
                    <div className="flex space-x-0.5">
                      <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded shimmer"></div>
                      <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded shimmer"></div>
                      <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded shimmer"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEmployees.length === 0 ? (
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
            <>
              <div className="space-y-2">
                {paginatedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-xs">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {employee.name}
                      </h3>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 truncate">
                        <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="inline-flex items-center rounded-full border border-transparent bg-slate-100 text-slate-900 px-2 py-0.5 text-[10px] font-semibold dark:bg-slate-800 dark:text-slate-100">
                      Ativo
                    </span>
                    <div className="flex space-x-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/employees/${employee.id}`)}
                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        title="Ver detalhes"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(employee)}
                        className="h-7 w-7 p-0"
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(employee.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredEmployees.length)} de {filteredEmployees.length} funcionários
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 text-xs"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1 text-xs">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Mostrar apenas algumas páginas ao redor da atual
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0 text-xs"
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <span key={page} className="px-2 text-slate-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 text-xs"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
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

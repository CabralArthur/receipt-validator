import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/ui/confirm-modal";
// Accordion components - implementação customizada
import { 
  ArrowLeft, 
  Mail, 
  FileText, 
  Download, 
  Eye,
  AlertCircle,
  ChevronDown,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { supabase, Employee } from "@/lib/supabaseClient";
import { 
  fetchEmployeeStats, 
  fetchEmployeeReceipts, 
  formatCurrency, 
  getFileNameFromUrl, 
  getFileTypeFromUrl,
  updateReceiptStatus,
  EmployeeStats,
  EmployeeReceipt
} from "@/processes/employeeReceipts";

// Removido interface Document - usando EmployeeReceipt do processo

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [receipts, setReceipts] = useState<EmployeeReceipt[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [updatingReceiptId, setUpdatingReceiptId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const itemsPerPage = 5;
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    receiptId: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
    currentStatus: 'APPROVED' | 'REJECTED' | 'PENDING';
  } | null>(null);
  // Removido sistema de tabs - apenas dashboard

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  // Resetar página quando o filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar dados do funcionário
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", id)
        .eq("user_id", authData.user.id)
        .is("deleted_at", null)
        .single();

      if (employeeError) {
        throw new Error("Funcionário não encontrado");
      }

      setEmployee(employeeData as Employee);

      // Buscar estatísticas e receipts do funcionário
      const [statsData, receiptsData] = await Promise.all([
        fetchEmployeeStats(id!),
        fetchEmployeeReceipts(id!)
      ]);

      setStats(statsData);
      setReceipts(receiptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Removido formatFileSize - não precisamos mais

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprovado';
      case 'PENDING':
        return 'Pendente';
      case 'REJECTED':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  const getAmountColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 dark:text-green-400';
      case 'REJECTED':
        return 'text-red-600 dark:text-red-400';
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleOpenConfirmModal = (receiptId: string, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING', currentStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    setConfirmModal({
      isOpen: true,
      receiptId,
      status: newStatus,
      currentStatus,
    });
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal(null);
  };

  const handleConfirmStatus = async () => {
    if (!id || !confirmModal) return;
    
    const { receiptId, status } = confirmModal;
    
    try {
      setUpdatingReceiptId(receiptId);
      const updatedReceipt = await updateReceiptStatus(receiptId, status, id);
      
      // Atualizar a lista de receipts
      setReceipts(prev => prev.map(r => r.id === receiptId ? updatedReceipt : r));
      
      // Recarregar estatísticas
      const updatedStats = await fetchEmployeeStats(id);
      setStats(updatedStats);
      
      // Fechar modal e dropdown
      handleCloseConfirmModal();
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert(err instanceof Error ? err.message : 'Erro ao atualizar status do comprovante');
    } finally {
      setUpdatingReceiptId(null);
    }
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openDropdownId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 dark:bg-slate-800/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* List Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1"></div>
                        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                      <div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Erro ao carregar funcionário
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {error || 'Funcionário não encontrado'}
        </p>
        <Button onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Funcionários
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/employees')}
            className="flex items-center gap-1.5 h-8 flex-shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
              {employee.name}
            </h1>
            <div className="flex items-center text-slate-600 dark:text-slate-400 mt-0.5 text-sm min-w-0">
              <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="inline-flex items-center rounded-full border border-transparent bg-green-100 text-green-800 px-2 py-0.5 text-[10px] font-semibold dark:bg-green-900/20 dark:text-green-400">
            Ativo
          </span>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total de Documentos */}
            <Card 
              className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === 'ALL' ? 'ring-2 ring-green-700 dark:ring-green-400' : ''}`}
              onClick={() => {
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 dark:bg-slate-800/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
                <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">Total de Documentos</CardTitle>
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800/30 rounded-lg flex items-center justify-center relative z-10">
                  <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {stats?.total_documents || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Valor total: {formatCurrency(stats?.total_amount || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Documentos Aprovados */}
            <Card 
              className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === 'APPROVED' ? 'ring-2 ring-green-700 dark:ring-green-400' : ''}`}
              onClick={() => {
                setStatusFilter('APPROVED');
                setCurrentPage(1);
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 dark:bg-green-900/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
                <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">Documentos Aprovados</CardTitle>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center relative z-10">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats?.approved_count || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Valor: {formatCurrency(stats?.approved_amount || 0)}
                </p>
                {stats && stats.total_documents > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-600 dark:text-green-400 font-medium text-[10px]">
                        {Math.round((stats.approved_count / stats.total_documents) * 100)}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">do total</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.approved_count / stats.total_documents) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documentos Pendentes */}
            <Card 
              className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === 'PENDING' ? 'ring-2 ring-yellow-600 dark:ring-yellow-400' : ''}`}
              onClick={() => {
                setStatusFilter('PENDING');
                setCurrentPage(1);
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-100 dark:bg-yellow-900/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
                <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">Documentos Pendentes</CardTitle>
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center relative z-10">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {stats?.pending_count || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Valor: {formatCurrency(stats?.pending_amount || 0)}
                </p>
                {stats && stats.total_documents > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium text-[10px]">
                        {Math.round((stats.pending_count / stats.total_documents) * 100)}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">do total</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.pending_count / stats.total_documents) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documentos Rejeitados */}
            <Card 
              className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${statusFilter === 'REJECTED' ? 'ring-2 ring-red-600 dark:ring-red-400' : ''}`}
              onClick={() => {
                setStatusFilter('REJECTED');
                setCurrentPage(1);
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 dark:bg-red-900/10 rounded-full -mr-12 -mt-12 z-0 blur-xl opacity-60"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 relative z-10">
                <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">Documentos Rejeitados</CardTitle>
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center relative z-10">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {stats?.rejected_count || 0}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Valor: {formatCurrency(stats?.rejected_amount || 0)}
                </p>
                {stats && stats.total_documents > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-600 dark:text-red-400 font-medium text-[10px]">
                        {Math.round((stats.rejected_count / stats.total_documents) * 100)}%
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">do total</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.rejected_count / stats.total_documents) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Receipts List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Comprovantes</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {statusFilter === 'ALL' 
                      ? 'Visualize e baixe todos os comprovantes enviados por este funcionário'
                      : `Mostrando apenas comprovantes ${getStatusText(statusFilter).toLowerCase()}`
                    }
                  </CardDescription>
                </div>
                {statusFilter !== 'ALL' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('ALL');
                      setCurrentPage(1);
                    }}
                    className="flex items-center gap-1 h-8 text-xs"
                  >
                    Limpar filtro
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {receipts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Nenhum comprovante encontrado
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Este funcionário ainda não enviou nenhum comprovante
                  </p>
                </div>
              ) : (
                <>
                  {(() => {
                    // Filtrar e ordenar comprovantes
                    let filteredReceipts = [...receipts];
                    
                    // Aplicar filtro de status
                    if (statusFilter !== 'ALL') {
                      filteredReceipts = filteredReceipts.filter(r => r.status === statusFilter);
                    }
                    
                    // Ordenar: pendentes primeiro, depois por data (mais recente primeiro)
                    filteredReceipts.sort((a, b) => {
                      // Pendentes sempre primeiro
                      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
                      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
                      // Depois ordenar por data (mais recente primeiro)
                      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                    });
                    
                    // Paginação
                    const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);
                    
                    return (
                      <>
                        <div className="space-y-2">
                          {paginatedReceipts.map((receipt) => {
                            const isExpanded = expandedItems.has(receipt.id);
                            // Verificar se há pelo menos um botão de status visível
                            const showApprove = receipt.status !== 'APPROVED';
                            const showReject = receipt.status !== 'REJECTED';
                            const showPending = receipt.status !== 'PENDING';
                            const hasStatusButtons = showApprove || showReject || showPending;
                            return (
                      <div key={receipt.id} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                        {/* Header clicável */}
                        <div 
                          className="px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => receipt.justification && toggleExpanded(receipt.id)}
                        >
                          <div className="flex items-center justify-between w-full min-w-0">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="h-4 w-4 text-white" />
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                                  {getFileNameFromUrl(receipt.receipt_url)}
                                </h3>
                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 min-w-0 overflow-hidden">
                                  <span className="truncate">{getFileTypeFromUrl(receipt.receipt_url)}</span>
                                  <span className="mx-1.5 flex-shrink-0">•</span>
                                  <span className={`font-semibold ${getAmountColor(receipt.status)} flex-shrink-0`}>
                                    {formatCurrency(receipt.amount)}
                                  </span>
                                  <span className="mx-1.5 flex-shrink-0">•</span>
                                  <span className="truncate">{formatDate(receipt.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1.5 relative flex-shrink-0 ml-2">
                              {/* Badge de alerta piscando para pendentes */}
                              {receipt.status === 'PENDING' && (
                                <div className="relative group">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                  <div className="absolute inset-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Valide o comprovante
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
                                  </div>
                                </div>
                              )}
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusColor(receipt.status)}`}>
                                {getStatusText(receipt.status)}
                              </span>
                              
                              {/* Dropdown Menu */}
                              <div className="relative dropdown-container">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(openDropdownId === receipt.id ? null : receipt.id);
                                  }}
                                  title="Mais opções"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                                
                                {openDropdownId === receipt.id && (
                                  <div className="absolute right-0 top-full mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-[100] border border-slate-200 dark:border-slate-700">
                                    <div className="py-1" role="menu">
                                      {/* Botões para trocar status */}
                                      {receipt.status !== 'APPROVED' && (
                                        <button
                                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenConfirmModal(receipt.id, 'APPROVED', receipt.status);
                                            setOpenDropdownId(null);
                                          }}
                                          disabled={updatingReceiptId === receipt.id}
                                        >
                                          {updatingReceiptId === receipt.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                          ) : (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                          )}
                                          <span>Marcar como Aprovado</span>
                                        </button>
                                      )}
                                      {receipt.status !== 'REJECTED' && (
                                        <button
                                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenConfirmModal(receipt.id, 'REJECTED', receipt.status);
                                            setOpenDropdownId(null);
                                          }}
                                          disabled={updatingReceiptId === receipt.id}
                                        >
                                          {updatingReceiptId === receipt.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                                          ) : (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                          )}
                                          <span>Marcar como Rejeitado</span>
                                        </button>
                                      )}
                                      {receipt.status !== 'PENDING' && (
                                        <button
                                          className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenConfirmModal(receipt.id, 'PENDING', receipt.status);
                                            setOpenDropdownId(null);
                                          }}
                                          disabled={updatingReceiptId === receipt.id}
                                        >
                                          {updatingReceiptId === receipt.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                                          ) : (
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                          )}
                                          <span>Marcar como Pendente</span>
                                        </button>
                                      )}
                                      
                                      {/* Divisor - mostrar apenas se houver botões de status */}
                                      {hasStatusButtons && (
                                        <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                      )}
                                      
                                      {/* Visualizar */}
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(receipt.receipt_url, '_blank');
                                          setOpenDropdownId(null);
                                        }}
                                      >
                                        <Eye className="h-4 w-4 text-green-600" />
                                        <span>Visualizar comprovante</span>
                                      </button>
                                      
                                      {/* Baixar */}
                                      <button
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const link = document.createElement('a');
                                          link.href = receipt.receipt_url;
                                          link.download = getFileNameFromUrl(receipt.receipt_url);
                                          link.click();
                                          setOpenDropdownId(null);
                                        }}
                                      >
                                        <Download className="h-4 w-4 text-green-600" />
                                        <span>Baixar comprovante</span>
                                      </button>
                                      
                                      {/* Ver justificativa da IA */}
                                      {receipt.justification && (
                                        <>
                                          <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                          <button
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleExpanded(receipt.id);
                                              setOpenDropdownId(null);
                                            }}
                                          >
                                            <ChevronDown 
                                              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                                                isExpanded ? 'rotate-180' : ''
                                              }`} 
                                            />
                                            <span>{isExpanded ? 'Fechar justificativa' : 'Ver justificativa da IA'}</span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Conteúdo expansível */}
                        {receipt.justification && isExpanded && (
                          <div className="px-3 pb-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="pt-3">
                              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-start space-x-2.5">
                                  <div className="flex-shrink-0">
                                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                      <Sparkles className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1.5">
                                      Processamento da IA
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                      {receipt.justification}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                            );
                          })}
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredReceipts.length)} de {filteredReceipts.length} comprovantes
                              {statusFilter !== 'ALL' && ` (filtrado por ${getStatusText(statusFilter)})`}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 h-8 text-xs"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Anterior
                              </Button>
                              <div className="flex items-center gap-1">
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
                                      <span key={page} className="px-1.5 text-slate-500 text-xs">
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
                                className="flex items-center gap-1 h-8 text-xs"
                              >
                                Próxima
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Modal de Confirmação */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={handleCloseConfirmModal}
          onConfirm={handleConfirmStatus}
          isLoading={updatingReceiptId === confirmModal.receiptId}
          title={
            confirmModal.status === 'APPROVED'
              ? 'Aprovar Comprovante'
              : confirmModal.status === 'REJECTED'
              ? 'Rejeitar Comprovante'
              : 'Marcar como Pendente'
          }
          description={
            confirmModal.status === 'APPROVED'
              ? `Tem certeza que deseja alterar o status deste comprovante de "${getStatusText(confirmModal.currentStatus)}" para "Aprovado"?`
              : confirmModal.status === 'REJECTED'
              ? `Tem certeza que deseja alterar o status deste comprovante de "${getStatusText(confirmModal.currentStatus)}" para "Rejeitado"?`
              : `Tem certeza que deseja alterar o status deste comprovante de "${getStatusText(confirmModal.currentStatus)}" para "Pendente"?`
          }
          confirmText={
            confirmModal.status === 'APPROVED' 
              ? 'Aprovar' 
              : confirmModal.status === 'REJECTED'
              ? 'Rejeitar'
              : 'Marcar como Pendente'
          }
          variant={
            confirmModal.status === 'APPROVED' 
              ? 'success' 
              : confirmModal.status === 'REJECTED'
              ? 'destructive'
              : 'warning'
          }
          icon={
            confirmModal.status === 'APPROVED' 
              ? 'success' 
              : confirmModal.status === 'REJECTED'
              ? 'error'
              : 'warning'
          }
        />
      )}
    </div>
  );
}

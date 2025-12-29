import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/ui/confirm-modal";
// Accordion components - implementação customizada
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  FileText, 
  Download, 
  Eye,
  AlertCircle,
  DollarSign,
  ChevronDown,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2
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
      
      // Fechar modal
      handleCloseConfirmModal();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert(err instanceof Error ? err.message : 'Erro ao atualizar status do comprovante');
    } finally {
      setUpdatingReceiptId(null);
    }
  };

  // Componente de Loading Skeleton Melhorado
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {/* Header Skeleton com animação suave */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-16 shimmer rounded"></div>
          <div>
            <div className="h-8 w-48 shimmer rounded mb-2"></div>
            <div className="h-4 w-64 shimmer rounded"></div>
          </div>
        </div>
        <div className="h-6 w-16 shimmer rounded-full"></div>
      </div>

      {/* Stats Cards Skeleton com animação escalonada */}
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

      {/* Receipts List Skeleton com animação mais suave */}
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
                  <div className="w-10 h-10 shimmer rounded-lg"></div>
                  <div>
                    <div className="h-4 w-48 shimmer rounded mb-2"></div>
                    <div className="h-3 w-32 shimmer rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-16 shimmer rounded-full"></div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/employees')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {employee.name}
            </h1>
            <div className="flex items-center text-slate-600 dark:text-slate-400 mt-1">
              <Mail className="h-4 w-4 mr-2" />
              {employee.email}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center rounded-full border border-transparent bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-semibold dark:bg-green-900/20 dark:text-green-400">
            Ativo
          </span>
        </div>
      </div>

      {/* Removido sistema de tabs */}

      {/* Dashboard Content */}
      <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Documentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_documents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Valor total: {formatCurrency(stats?.total_amount || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Aprovados</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.approved_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Valor: {formatCurrency(stats?.approved_amount || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Pendentes</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pending_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Valor: {formatCurrency(stats?.pending_amount || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos Rejeitados</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.rejected_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Valor: {formatCurrency(stats?.rejected_amount || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Receipts List */}
          <Card>
            <CardHeader>
              <CardTitle>Comprovantes</CardTitle>
              <CardDescription>
                Visualize e baixe todos os comprovantes enviados por este funcionário
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div className="space-y-2">
                  {receipts.map((receipt) => {
                    const isExpanded = expandedItems.has(receipt.id);
                    return (
                      <div key={receipt.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        {/* Header clicável */}
                        <div 
                          className="px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                          onClick={() => receipt.justification && toggleExpanded(receipt.id)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div className="text-left flex-1">
                                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                  {getFileNameFromUrl(receipt.receipt_url)}
                                </h3>
                                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                  <span>{getFileTypeFromUrl(receipt.receipt_url)}</span>
                                  <span className="mx-2">•</span>
                                  <span className={`font-semibold ${getAmountColor(receipt.status)}`}>
                                    {formatCurrency(receipt.amount)}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <span>{formatDate(receipt.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(receipt.status)}`}>
                                {getStatusText(receipt.status)}
                              </span>
                              
                              {/* Botões de ação separados */}
                              <div className="flex items-center space-x-1">
                                {/* Botões para trocar status - mostrar apenas os diferentes do status atual */}
                                {receipt.status !== 'APPROVED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenConfirmModal(receipt.id, 'APPROVED', receipt.status);
                                    }}
                                    disabled={updatingReceiptId === receipt.id}
                                    title="Marcar como Aprovado"
                                  >
                                    {updatingReceiptId === receipt.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                {receipt.status !== 'REJECTED' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenConfirmModal(receipt.id, 'REJECTED', receipt.status);
                                    }}
                                    disabled={updatingReceiptId === receipt.id}
                                    title="Marcar como Rejeitado"
                                  >
                                    {updatingReceiptId === receipt.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                {receipt.status !== 'PENDING' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenConfirmModal(receipt.id, 'PENDING', receipt.status);
                                    }}
                                    disabled={updatingReceiptId === receipt.id}
                                    title="Marcar como Pendente"
                                  >
                                    {updatingReceiptId === receipt.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(receipt.receipt_url, '_blank');
                                  }}
                                  title="Visualizar comprovante"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = receipt.receipt_url;
                                    link.download = getFileNameFromUrl(receipt.receipt_url);
                                    link.click();
                                  }}
                                  title="Baixar comprovante"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                
                                {/* Botão de expansão separado */}
                                {receipt.justification && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpanded(receipt.id);
                                    }}
                                    title={isExpanded ? "Fechar justificativa" : "Ver justificativa da IA"}
                                  >
                                    <ChevronDown 
                                      className={`h-4 w-4 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-180' : ''
                                      }`} 
                                    />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Conteúdo expansível */}
                        {receipt.justification && isExpanded && (
                          <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="pt-4">
                              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                      <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                                      Processamento da IA
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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

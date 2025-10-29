import { supabase } from "../lib/supabaseClient";

export interface DashboardStats {
  total_employees: number;
  total_receipts: number;
  total_amount: number;
  approved_receipts: number;
  approved_amount: number;
  pending_receipts: number;
  pending_amount: number;
  rejected_receipts: number;
  rejected_amount: number;
}

// Busca estatísticas gerais do dashboard
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado");
  }

  // Buscar estatísticas de funcionários
  const { data: employeesData, error: employeesError } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", authData.user.id)
    .is("deleted_at", null);

  if (employeesError) {
    throw new Error("Erro ao buscar funcionários");
  }

  const employeeIds = employeesData?.map(emp => emp.id) || [];

  if (employeeIds.length === 0) {
    return {
      total_employees: 0,
      total_receipts: 0,
      total_amount: 0,
      approved_receipts: 0,
      approved_amount: 0,
      pending_receipts: 0,
      pending_amount: 0,
      rejected_receipts: 0,
      rejected_amount: 0,
    };
  }

  // Buscar estatísticas de receipts
  const { data: receiptsData, error: receiptsError } = await supabase
    .from("receipt_employees")
    .select("amount, status")
    .in("employee_id", employeeIds);

  if (receiptsError) {
    throw new Error("Erro ao buscar comprovantes");
  }

  const receipts = receiptsData || [];

  // Calcular estatísticas
  const total_receipts = receipts.length;
  const total_amount = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
  
  const approved_receipts = receipts.filter(r => r.status === 'APPROVED').length;
  const approved_amount = receipts
    .filter(r => r.status === 'APPROVED')
    .reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
  
  const pending_receipts = receipts.filter(r => r.status === 'PENDING').length;
  const pending_amount = receipts
    .filter(r => r.status === 'PENDING')
    .reduce((sum, receipt) => sum + (receipt.amount || 0), 0);
  
  const rejected_receipts = receipts.filter(r => r.status === 'REJECTED').length;
  const rejected_amount = receipts
    .filter(r => r.status === 'REJECTED')
    .reduce((sum, receipt) => sum + (receipt.amount || 0), 0);

  return {
    total_employees: employeeIds.length,
    total_receipts,
    total_amount,
    approved_receipts,
    approved_amount,
    pending_receipts,
    pending_amount,
    rejected_receipts,
    rejected_amount,
  };
}

// Função para formatar valores monetários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Função para calcular taxa de aprovação
export function calculateApprovalRate(approved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((approved / total) * 100);
}

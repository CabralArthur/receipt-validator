import { supabase } from "../lib/supabaseClient";

export interface EmployeeStats {
  total_documents: number;
  total_amount: number;
  approved_count: number;
  approved_amount: number;
  pending_count: number;
  pending_amount: number;
  rejected_count: number;
  rejected_amount: number;
}

export interface EmployeeReceipt {
  id: string;
  amount: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  receipt_url: string;
  created_at: string;
  justification?: string;
}

// Busca estatísticas do funcionário
export async function fetchEmployeeStats(employeeId: string): Promise<EmployeeStats> {
  const { data, error } = await supabase
    .rpc("get_employee_receipt_stats", {
      p_employee_id: employeeId,
    });

  if (error) {
    console.error("stats error", error);
    throw error;
  }

  // data vem como array com 1 linha
  return data && data[0];
}

// Busca receipts do funcionário
export async function fetchEmployeeReceipts(employeeId: string): Promise<EmployeeReceipt[]> {
  const { data, error } = await supabase
    .from("receipt_employees")
    .select(`
      id,
      amount,
      status,
      receipt_url,
      created_at,
      justification
    `)
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Função para formatar valores monetários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Função para obter o nome do arquivo da URL
export function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || 'documento';
    return decodeURIComponent(fileName);
  } catch {
    return 'documento';
  }
}

// Função para obter o tipo de arquivo baseado na extensão
export function getFileTypeFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = pathname.split('.').pop()?.toUpperCase() || 'PDF';
    return extension;
  } catch {
    return 'PDF';
  }
}

// Função para atualizar o status de um comprovante
export async function updateReceiptStatus(
  receiptId: string,
  status: 'APPROVED' | 'REJECTED',
  employeeId: string
): Promise<EmployeeReceipt> {
  // Verificar autenticação
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar se o funcionário pertence ao usuário autenticado
  const { data: employeeData, error: employeeError } = await supabase
    .from("employees")
    .select("id, user_id")
    .eq("id", employeeId)
    .eq("user_id", authData.user.id)
    .is("deleted_at", null)
    .single();

  if (employeeError || !employeeData) {
    throw new Error("Funcionário não encontrado ou não autorizado");
  }

  // Verificar se o comprovante pertence ao funcionário
  const { data: receiptData, error: receiptError } = await supabase
    .from("receipt_employees")
    .select("id, employee_id")
    .eq("id", receiptId)
    .eq("employee_id", employeeId)
    .single();

  if (receiptError || !receiptData) {
    throw new Error("Comprovante não encontrado ou não pertence a este funcionário");
  }

  // Atualizar o status
  const { data, error } = await supabase
    .from("receipt_employees")
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", receiptId)
    .eq("employee_id", employeeId)
    .select(`
      id,
      amount,
      status,
      receipt_url,
      created_at,
      justification
    `)
    .single();

  if (error) {
    console.error("Erro ao atualizar status do comprovante:", error);
    throw new Error(error.message);
  }

  return data as EmployeeReceipt;
}

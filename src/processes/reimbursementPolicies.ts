import { supabase } from "@/lib/supabaseClient";
import axios from "axios";

export interface ReimbursementPolicy {
  id: string;
  user_id: string;
  name: string;
  rules: string | null;
  source_pdf_url: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const WEBHOOK_URL = "https://primary-production-6a2e.up.railway.app/webhook/1947cfd0-6ca9-4b26-aa0f-1ccf48178348";

async function sendFileToWebhook(file: File, userId: string): Promise<void> {
  try {
    const formData = new FormData();

    formData.append("data", file);
    formData.append("user_id", userId);

    await axios.post(WEBHOOK_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    // Loga o erro mas não interrompe o fluxo principal
    console.error("Erro ao enviar arquivo para webhook:", error);
    // Não lança erro para não interromper o processo de upload
  }
}

export async function uploadPolicyFile(file: File, userId: string): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Somente arquivos PDF são aceitos.");
  }

  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Caminho dentro do bucket. Na Storage API passamos o caminho relativo ao bucket
  const storageKey = `${userId}/${uuid}.pdf`;

  const { error } = await supabase
    .storage
    .from("validai-bucket")
    .upload(storageKey, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error("Erro ao fazer upload da policy:", error);
    throw new Error(error.message);
  }

  // Enviar arquivo para webhook após upload bem-sucedido
  await sendFileToWebhook(file, userId);

  // Para salvar no banco podemos preferir manter o prefixo do bucket
  return `validai-bucket/${storageKey}`;
}

export async function deactivateAllUserPolicies(userId: string): Promise<void> {
  // Verificar autenticação
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar se o userId corresponde ao usuário autenticado
  if (authData.user.id !== userId) {
    throw new Error("Não autorizado a modificar políticas de outro usuário");
  }

  const { error } = await supabase
    .from("reimbursement_policies")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .eq("is_active", true);

  if (error) {
    console.error("Erro ao desativar políticas anteriores:", error);
    throw new Error(error.message);
  }
}

export async function createReimbursementPolicy(
  userId: string,
  filePath: string,
  name: string,
): Promise<ReimbursementPolicy> {
  // Verificar autenticação e garantir que userId corresponde ao usuário autenticado
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado");
  }

  // Verificar se o userId corresponde ao usuário autenticado
  if (authData.user.id !== userId) {
    throw new Error("Não autorizado a criar políticas para outro usuário");
  }

  // Desativar todas as políticas anteriores antes de criar nova
  await deactivateAllUserPolicies(userId);

  const { data, error } = await supabase
    .from("reimbursement_policies")
    .insert({
      user_id: authData.user.id,
      name,
      source_pdf_url: filePath,
      rules: null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar registro da policy:", error);
    throw new Error(error.message);
  }

  return data as ReimbursementPolicy;
}

export async function updateReimbursementPolicy(
  policyId: string,
  fields: Partial<Pick<ReimbursementPolicy, "name" | "source_pdf_url" | "rules" | "is_active">>,
): Promise<ReimbursementPolicy> {
  const { data, error } = await supabase
    .from("reimbursement_policies")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", policyId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar policy:", error);
    throw new Error(error.message);
  }

  return data as ReimbursementPolicy;
}

export async function getNextMostRecentPolicy(userId: string, excludePolicyId: string): Promise<ReimbursementPolicy | null> {
  const { data, error } = await supabase
    .from("reimbursement_policies")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .neq("id", excludePolicyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") { // 116: Results contain 0 rows
    console.error("Erro ao buscar próxima política:", error);
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function softDeleteReimbursementPolicy(policyId: string): Promise<ReimbursementPolicy> {
  // Verificar autenticação
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado");
  }

  // Primeiro, buscar a política que será removida para obter o user_id e verificar permissão
  const { data: policyToDelete, error: fetchError } = await supabase
    .from("reimbursement_policies")
    .select("user_id")
    .eq("id", policyId)
    .single();

  if (fetchError || !policyToDelete) {
    console.error("Erro ao buscar política para remoção:", fetchError);
    throw new Error(fetchError?.message || "Política não encontrada");
  }

  // Verificar se o userId corresponde ao usuário autenticado
  if (policyToDelete.user_id !== authData.user.id) {
    throw new Error("Não autorizado a remover políticas de outro usuário");
  }

  // Remover a política atual (soft delete)
  const { data, error } = await supabase
    .from("reimbursement_policies")
    .update({ 
      deleted_at: new Date().toISOString(), 
      is_active: false, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", policyId)
    .eq("user_id", authData.user.id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao remover policy:", error);
    throw new Error(error.message);
  }

  // Buscar a próxima política mais recente e reativá-la
  const nextPolicy = await getNextMostRecentPolicy(policyToDelete.user_id, policyId);
  if (nextPolicy) {
    await updateReimbursementPolicy(nextPolicy.id, { is_active: true });
  }

  return data as ReimbursementPolicy;
}

export async function getLatestUserPolicy(userId: string): Promise<ReimbursementPolicy | null> {
  const { data, error } = await supabase
    .from("reimbursement_policies")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") { // 116: Results contain 0 rows
    console.error("Erro ao buscar policy do usuário:", error);
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function getPolicyPublicUrl(filePath: string): Promise<string | null> {
    // filePath pode vir como "validai-bucket/<user>/<file>.pdf"
    let relativePath = filePath;

    if (relativePath.startsWith("validai-bucket/")) {
      relativePath = relativePath.replace(/^validai-bucket\//, "");
    }

    const { data } = supabase.storage.from("validai-bucket").getPublicUrl(relativePath);
    return data?.publicUrl ?? null;
}

export async function deletePolicyFile(filePath: string): Promise<void> {
  // filePath salvo como "validai-bucket/<user>/<employee>/<file>.pdf"; precisamos do caminho relativo ao bucket
  let relativePath = filePath;
  if (relativePath.startsWith("validai-bucket/")) {
    relativePath = relativePath.replace(/^validai-bucket\//, "");
  }
  const { error } = await supabase.storage.from("validai-bucket").remove([relativePath]);
  if (error) {
    // Loga mas não interrompe o fluxo principal
    console.error("Erro ao remover arquivo antigo da policy:", error);
  }
}

export async function uploadAndCreatePolicy(
  file: File,
  userId: string
): Promise<ReimbursementPolicy> {
  // Usar o nome do arquivo (sem extensão) como nome da política
  const fileName = file.name.replace(/\.[^/.]+$/, "");

  // 1. Fazer upload do arquivo
  const filePath = await uploadPolicyFile(file, userId);

  // 2. Obter URL pública do arquivo
  const publicUrl = await getPolicyPublicUrl(filePath);

  if (!publicUrl) {
    throw new Error("Não foi possível obter URL pública do arquivo");
  }

  // 3. Criar registro no banco (já desativa políticas anteriores)
  const policy = await createReimbursementPolicy(userId, filePath, fileName);

  return policy;
}

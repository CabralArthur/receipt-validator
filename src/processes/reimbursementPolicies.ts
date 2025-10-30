import { supabase } from "@/lib/supabaseClient";

export interface ReimbursementPolicy {
  id: string;
  user_id: string;
  name: string;
  rules: string[] | null;
  source_pdf_url: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
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

  // Para salvar no banco podemos preferir manter o prefixo do bucket
  return `validai-bucket/${storageKey}`;
}

export async function createReimbursementPolicy(
  userId: string,
  filePath: string,
  name: string,
): Promise<ReimbursementPolicy> {
  const { data, error } = await supabase
    .from("reimbursement_policies")
    .insert({
      user_id: userId,
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

export async function softDeleteReimbursementPolicy(policyId: string): Promise<ReimbursementPolicy> {
  const { data, error } = await supabase
    .from("reimbursement_policies")
    .update({ deleted_at: new Date().toISOString(), is_active: false, updated_at: new Date().toISOString() })
    .eq("id", policyId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao remover policy:", error);
    throw new Error(error.message);
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
  // filePath salvo como "validai-bucket/<user>/<file>.pdf"; precisamos do caminho relativo ao bucket
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

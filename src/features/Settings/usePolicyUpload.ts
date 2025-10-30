import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ReimbursementPolicy,
  uploadPolicyFile,
  createReimbursementPolicy,
  getLatestUserPolicy,
  getPolicyPublicUrl,
  updateReimbursementPolicy,
} from "@/processes/reimbursementPolicies";

export type PolicyProcessingState = "none" | "processing" | "ready" | "error";

export function usePolicyUpload(webhookUrl = "https://meu-n8n.com/webhook/policy-ingest") {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [policy, setPolicy] = useState<ReimbursementPolicy | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const processingState: PolicyProcessingState = useMemo(() => {
    if (!policy) return "none";
    if (policy.rules === null) return "processing";
    if (Array.isArray(policy.rules)) return "ready";
    return "none";
  }, [policy]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) {
        setPolicy(null);
        setPublicUrl(null);
        return;
      }
      const p = await getLatestUserPolicy(userId);
      setPolicy(p);
      if (p?.source_pdf_url) {
        setPublicUrl(await getPolicyPublicUrl(p.source_pdf_url));
      } else {
        setPublicUrl(null);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || "Erro ao carregar política");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = useCallback(async () => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      if (!file) throw new Error("Selecione um arquivo PDF.");
      if (file.type !== "application/pdf") throw new Error("Envie apenas PDF.");

      setUploading(true);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) throw new Error("Usuário não autenticado");
      const userId = authData.user.id;

      const storagePath = await uploadPolicyFile(file, userId);

      let newPolicy: ReimbursementPolicy;
      if (policy) {
        newPolicy = await updateReimbursementPolicy(policy.id, {
          name: file.name,
          source_pdf_url: storagePath,
          rules: null,
        });
      } else {
        newPolicy = await createReimbursementPolicy(userId, storagePath, file.name);
      }

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy_id: newPolicy.id, user_id: userId }),
      });

      setSuccessMessage("Regras serão geradas em instantes.");
      setFile(null);
      setPolicy(newPolicy);
      setPublicUrl(await getPolicyPublicUrl(newPolicy.source_pdf_url || ""));
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e?.message || "Não consegui enviar o arquivo, tente de novo.");
    } finally {
      setUploading(false);
    }
  }, [file, policy, webhookUrl]);

  const reprocess = useCallback(async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId || !policy) return;
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy_id: policy.id, user_id: userId }),
      });
      setSuccessMessage("Reprocessamento iniciado.");
    } catch (e: any) {
      setErrorMessage(e?.message || "Falha ao reprocessar.");
    }
  }, [policy, webhookUrl]);

  return {
    // data
    file,
    policy,
    publicUrl,
    loading,
    uploading,
    processingState,
    errorMessage,
    successMessage,

    // actions
    setFile,
    upload,
    reprocess,
    refresh: load,
  };
}

export default usePolicyUpload;



import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UploadCloud, CheckCircle2, AlertTriangle, X, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadPolicyFile, getLatestUserPolicy, getPolicyPublicUrl, ReimbursementPolicy, deletePolicyFile } from "@/processes/reimbursementPolicies";
import { useEffect } from "react";

interface UploadPolicyProps {
  webhookUrl?: string;
}

export default function UploadPolicy({ webhookUrl = "https://gatewatch-n8n-sentiment-9c5a6b3c4f75.herokuapp.com/webhook/07736282-ebe8-4fd8-bdaa-4da9bfe4e9f4" }: UploadPolicyProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<ReimbursementPolicy | null>(null);
  const [currentPublicUrl, setCurrentPublicUrl] = useState<string | null>(null);
  const [loadingPolicy, setLoadingPolicy] = useState(true);
  const [allowReplace, setAllowReplace] = useState(false);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function loadExistingPolicy() {
    try {
      setLoadingPolicy(true);
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) {
        setCurrentPolicy(null);
        setCurrentPublicUrl(null);
        return;
      }
      const policy = await getLatestUserPolicy(userId);
      setCurrentPolicy(policy);

      if (policy?.source_pdf_url) {
        const url = await getPolicyPublicUrl(policy.source_pdf_url);
        setCurrentPublicUrl(url);
      } else {
        setCurrentPublicUrl(null);
      }
    } catch (e) {
      console.error("Erro ao carregar policy existente:", e);
    } finally {
      setLoadingPolicy(false);
    }
  }

  useEffect(() => {
    loadExistingPolicy();
  }, []);

  async function handleUpload() {
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      if (!file) {
        setErrorMsg("Selecione um arquivo PDF.");
        return;
      }

      if (file.type !== "application/pdf") {
        setErrorMsg("Somente arquivos PDF são aceitos.");
        return;
      }

      setIsUploading(true);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        throw new Error("Usuário não autenticado");
      }
      const userId = authData.user.id;

      // 1) Upload para o Storage (bucket privado policies)
      const storagePath = await uploadPolicyFile(file, userId);

      // 2) Criar/Atualizar registro na tabela reimbursement_policies
      const previousPath = currentPolicy?.source_pdf_url || null;

      // 3) Remover arquivo antigo do Storage (se existia)
      if (previousPath && previousPath !== storagePath) {
        await deletePolicyFile(previousPath);
      }

      setSuccessMsg("PDF enviado e substituído. Clique em 'Gerar regras' para processar.");
      setFile(null);
      setAllowReplace(false);
      await loadExistingPolicy();
    } catch (err: any) {
      console.error("Erro no upload de política:", err);
      setErrorMsg(err?.message || "Erro ao enviar política");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleGenerateRules() {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (!currentPolicy?.source_pdf_url) return;
      setIsGenerating(true);
      const publicUrl = await getPolicyPublicUrl(currentPolicy.source_pdf_url);
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyid: currentPolicy.id,
          url: publicUrl,
        }),
      });
      setSuccessMsg("Processamento iniciado. Regras serão geradas em instantes.");
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || "Falha ao iniciar processamento.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Política de Reembolso</CardTitle>
            <CardDescription>Envie seu PDF de política para ser processado pela IA</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loadingPolicy && (
            <div className="space-y-4">
              {/* Skeleton do bloco da policy atual */}
              <div className="rounded-md border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3 w-full">
                    <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
                    </div>
                  </div>
                  <div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              </div>

              {/* Skeleton da dropzone */}
              <div className="rounded-lg border-2 border-dashed p-6">
                <div className="mx-auto h-8 w-8 rounded bg-slate-200 dark:bg-slate-700 animate-pulse mb-3" />
                <div className="mx-auto h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="mx-auto h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>

              {/* Skeleton botões */}
              <div className="flex items-center gap-2">
                <div className="h-10 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-10 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
            </div>
          )}
          {/* Policy atual */}
          {!loadingPolicy && currentPolicy && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-slate-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{currentPolicy.name}</p>
                    <p className="truncate text-xs text-slate-500">{currentPolicy.source_pdf_url}</p>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      <span>Enviado em {currentPolicy.created_at ? new Date(currentPolicy.created_at).toLocaleString() : "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {currentPublicUrl && (
                    <a
                      href={currentPublicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Baixar
                    </a>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setAllowReplace((v) => !v)}>
                    {allowReplace ? "Cancelar" : "Trocar arquivo"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleGenerateRules} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <UploadCloud className="h-4 w-4 animate-bounce" />
                        Gerando...
                      </>
                    ) : (
                      <>Gerar regras</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Regras */}
              {Array.isArray(currentPolicy.rules) && currentPolicy.rules?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-sm font-medium text-slate-800 dark:text-slate-200">Regras:</p>
                  <ul className="space-y-2 pl-1">
                    {currentPolicy.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Sparkles className="mt-0.5 h-4 w-4 text-purple-500" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!loadingPolicy && (allowReplace || !currentPolicy) && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Arquivo PDF
            </label>

            <input
              id="policy-file"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={isUploading}
            />

            <label
              htmlFor="policy-file"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) setFile(dropped);
              }}
              className={`flex ${(!allowReplace && currentPolicy) ? "cursor-not-allowed opacity-60" : "cursor-pointer"} flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/10"
                  : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
              }`}
              aria-disabled={!allowReplace && !!currentPolicy}
            >
              <UploadCloud className="mb-2 h-8 w-8 text-slate-500 dark:text-slate-400" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {(!allowReplace && currentPolicy)
                  ? "Já existe um PDF enviado. Clique em 'Trocar arquivo' para substituir."
                  : "Arraste e solte o PDF aqui, ou clique para selecionar"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Somente arquivo PDF</p>
            </label>

            {file && (
              <div className="mt-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="truncate text-sm text-slate-800 dark:text-slate-200">{file.name}</span>
                  <span className="text-xs text-slate-500">· {formatSize(file.size)}</span>
                </div>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                  onClick={() => setFile(null)}
                  aria-label="Remover arquivo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="mt-3">
              <Button onClick={handleUpload} disabled={isUploading || !file || (!allowReplace && !!currentPolicy)} className="flex items-center gap-2">
                {isUploading ? (
                  <>
                    <UploadCloud className="h-4 w-4 animate-bounce" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Enviar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <p className="text-sm">{successMsg}</p>
            </div>
          )}
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



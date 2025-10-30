import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, FileText, Loader2, UploadCloud, X } from "lucide-react";
import usePolicyUpload from "./usePolicyUpload";

interface PolicyUploadCardProps {
  webhookUrl?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PolicyUploadCard({ webhookUrl }: PolicyUploadCardProps) {
  const {
    file,
    setFile,
    policy,
    publicUrl,
    loading,
    uploading,
    processingState,
    errorMessage,
    successMessage,
    upload,
    reprocess,
  } = usePolicyUpload(webhookUrl);

  const [isDragging, setIsDragging] = useState(false);

  const hasPolicy = !!policy;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Política de reembolso</CardTitle>
        <CardDescription>
          Envie o PDF da política para que o sistema leia e gere as regras automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Estado de carregamento inicial */}
        {loading ? (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        ) : (
          <div className="space-y-5">
            {/* Bloco de arquivo atual (se existir) */}
            {hasPolicy && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-slate-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{policy?.name}</p>
                      <p className="truncate text-xs text-slate-500">{policy?.source_pdf_url}</p>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                        {/* created_at como data de upload */}
                        <span>Enviado em {policy?.created_at ? new Date(policy.created_at).toLocaleString() : "—"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {publicUrl && (
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Baixar
                      </a>
                    )}
                    <Button variant="ghost" size="sm">
                      Trocar arquivo
                    </Button>
                  </div>
                </div>

                {/* Estados de processamento */}
                <div className="mt-3">
                  {processingState === "processing" && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processando... Regras serão geradas em instantes.
                    </div>
                  )}
                  {processingState === "ready" && Array.isArray(policy?.rules) && (
                    <div className="mt-2">
                      <p className="mb-1 text-sm font-medium text-slate-800 dark:text-slate-200">Regras:</p>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                        {policy!.rules!.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dropzone */}
            <div>
              <input
                id="policy-file"
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                disabled={uploading}
              />
              <label
                htmlFor="policy-file"
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) setFile(dropped);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/10"
                    : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500"
                }`}
              >
                <UploadCloud className="mb-2 h-8 w-8 text-slate-500 dark:text-slate-400" />
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Arraste e solte o PDF aqui, ou clique para selecionar
                </p>
                <p className="mt-1 text-xs text-slate-500">Somente arquivo PDF</p>
              </label>

              {/* pré-visualização */}
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
                    onClick={() => { (document.getElementById("policy-file") as HTMLInputElement).value = ""; setFile(null); }}
                    aria-label="Remover arquivo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={upload} disabled={uploading || !file} className="flex items-center gap-2">
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" /> Enviar PDF
                  </>
                )}
              </Button>
              {hasPolicy && (
                <Button type="button" variant="secondary" disabled={uploading} onClick={reprocess}>
                  Reprocessar
                </Button>
              )}
            </div>

            {/* Mensagens */}
            {successMessage && (
              <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <p className="text-sm">{successMessage}</p>
              </div>
            )}
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



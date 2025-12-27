import { useState, useRef } from "react";
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, Trash2, Download, X, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSettingsContainer from "./Settings.container";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { getPolicyPublicUrl } from "@/processes/reimbursementPolicies";

export default function PolicyTab() {
  const {
    currentPolicy,
    policyLoading,
    isUploadingPolicy,
    isDeletingPolicy,
    uploadPolicyError,
    deletePolicyError,
    handleUploadPolicy,
    handleDeletePolicy,
  } = useSettingsContainer();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Somente arquivos PDF são aceitos.");
        return;
      }
      setSelectedFile(file);
      // Criar URL de preview
      const url = URL.createObjectURL(file);
      setPdfPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }

    try {
      await handleUploadPolicy(selectedFile);
      // Limpar formulário após sucesso
      handleRemoveFile();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
  };

  const handleDownloadPolicy = async () => {
    if (!currentPolicy?.source_pdf_url) return;

    try {
      const publicUrl = await getPolicyPublicUrl(currentPolicy.source_pdf_url);
      if (publicUrl) {
        window.open(publicUrl, "_blank");
      }
    } catch (error) {
      console.error("Erro ao baixar política:", error);
      alert("Erro ao baixar o arquivo. Tente novamente.");
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (currentPolicy?.id) {
      handleDeletePolicy(currentPolicy.id);
      setIsDeleteModalOpen(false);
    }
  };

  if (policyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Policy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enviar Política de Reembolso
          </CardTitle>
          <CardDescription>
            Envie sua política de reembolso em PDF para processamento automatizado. O nome do arquivo será usado como nome da política.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {uploadPolicyError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {uploadPolicyError.message || "Erro ao fazer upload da política"}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isUploadingPolicy && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Enviando política e processando regras...
                  </p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="pdfFile">Arquivo PDF</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id="pdfFile"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Somente arquivos PDF são aceitos
                  </p>
                </div>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUploadingPolicy || !selectedFile}>
                {isUploadingPolicy ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Política
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Policy Section */}
      {currentPolicy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Política Atual
            </CardTitle>
            <CardDescription>
              Visualize ou remova a política de reembolso ativa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                      {currentPolicy.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      Criada em {currentPolicy.created_at 
                        ? new Date(currentPolicy.created_at).toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Data não disponível'}
                    </p>
                    <div className="flex items-center gap-2">
                      {currentPolicy.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                          Inativa
                        </span>
                      )}
                      {currentPolicy.rules && currentPolicy.rules.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          {currentPolicy.rules.length} regra(s) processada(s)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPolicy}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Visualizar PDF
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteClick}
                      disabled={isDeletingPolicy}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rules List */}
              {currentPolicy.rules && currentPolicy.rules.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-green-500 dark:text-green-400" />
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Regras Processadas
                    </h4>
                    <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                      {currentPolicy.rules.length} {currentPolicy.rules.length === 1 ? 'regra' : 'regras'}
                    </span>
                  </div>
                  <div className="max-h-96 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {currentPolicy.rules.map((rule, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-3 p-4 bg-gradient-to-r from-green-50/50 to-indigo-50/50 dark:from-green-950/20 dark:to-indigo-950/20 rounded-lg border border-green-100 dark:border-green-900/30 hover:border-green-200 dark:hover:border-green-800 transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {rule}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingPolicy}
        error={deletePolicyError}
        title="Remover Política de Reembolso"
        description="Tem certeza que deseja remover esta política? Esta ação não pode ser desfeita e a política anterior será reativada."
      />
    </div>
  );
}

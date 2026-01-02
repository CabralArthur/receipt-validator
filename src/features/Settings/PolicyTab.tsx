import { useState, useRef, useEffect } from "react";
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, Trash2, Download, X, Sparkles, Clock, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSettingsContainer from "./Settings.container";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { getPolicyPublicUrl } from "@/processes/reimbursementPolicies";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [isRulesExpanded, setIsRulesExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rulesCardRef = useRef<HTMLDivElement>(null);

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

  // Scroll para o card quando o accordion for expandido
  useEffect(() => {
    if (isRulesExpanded && rulesCardRef.current) {
      setTimeout(() => {
        rulesCardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); // Pequeno delay para garantir que o conteúdo foi renderizado
    }
  }, [isRulesExpanded]);

  if (policyLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Policy Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Enviar Política de Reembolso</span>
          </CardTitle>
          <CardDescription className="text-xs mt-0.5 truncate">
            Envie sua política de reembolso em PDF para processamento automatizado. O nome do arquivo será usado como nome da política.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Error Message */}
            {uploadPolicyError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {uploadPolicyError.message || "Erro ao fazer upload da política"}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isUploadingPolicy && (
              <div className="p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-700" />
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Enviando política e processando regras...
                  </p>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-1.5">
              <Label htmlFor="pdfFile" className="text-xs">Arquivo PDF</Label>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Input
                    id="pdfFile"
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer h-9 text-sm"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    Somente arquivos PDF são aceitos
                  </p>
                </div>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="flex items-center gap-1.5 h-8 text-xs mt-[2px] flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Remover</span>
                  </Button>
                )}
              </div>
              {selectedFile && (
                <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isUploadingPolicy || !selectedFile} size="sm" className="h-8 text-xs">
                {isUploadingPolicy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin flex-shrink-0" />
                    <span className="hidden sm:inline">Enviando...</span>
                    <span className="sm:hidden">Enviando</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Enviar Política</span>
                    <span className="sm:hidden">Enviar</span>
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Política Atual</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5 truncate">
              Visualize ou remova a política de reembolso ativa
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1 truncate">
                      {currentPolicy.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      {currentPolicy.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                          <CheckCircle className="h-2.5 w-2.5 mr-1" />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 flex-shrink-0">
                          Inativa
                        </span>
                      )}
                      {currentPolicy.rules && currentPolicy.rules.trim().length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                          Regras processadas
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0">
                          <Clock className="h-2.5 w-2.5 mr-1" />
                          Regras pendentes
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPolicy}
                      className="flex items-center gap-1.5 h-8 text-xs"
                    >
                      <Download className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">Visualizar PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteClick}
                      disabled={isDeletingPolicy}
                      className="flex items-center gap-1.5 h-8 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="hidden sm:inline">Remover</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rules Section */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                {currentPolicy.rules && currentPolicy.rules.trim().length > 0 ? (
                  <Card ref={rulesCardRef}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors pb-2 px-4 pt-3"
                      onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                    >
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Sparkles className="h-4 w-4 text-green-700 dark:text-green-400 flex-shrink-0" />
                          <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            Regras Processadas
                          </CardTitle>
                        </div>
                        <ChevronDown 
                          className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                            isRulesExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </CardHeader>
                    {isRulesExpanded && (
                      <CardContent className="px-4 pb-4">
                        <div className="flex items-start gap-2.5">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                              <Sparkles className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 prose prose-sm dark:prose-invert max-w-none 
                            prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-headings:font-semibold
                            prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-xs
                            prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-semibold
                            prose-code:text-green-600 dark:prose-code:text-green-400 prose-code:bg-green-50 dark:prose-code:bg-green-950/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[10px] prose-code:font-mono
                            prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:text-slate-800 dark:prose-pre:text-slate-200 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700
                            prose-ul:text-slate-700 dark:prose-ul:text-slate-300 prose-ol:text-slate-700 dark:prose-ol:text-slate-300
                            prose-li:text-slate-700 dark:prose-li:text-slate-300
                            prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
                            prose-blockquote:border-l-green-500 dark:prose-blockquote:border-l-green-400 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 max-h-[300px] overflow-y-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {currentPolicy.rules}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3 min-w-0">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        Regras Pendentes
                      </h4>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                      <div className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                            <Loader2 className="h-3 w-3 text-amber-600 dark:text-amber-400 animate-spin" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                            As regras estão sendo processadas pela IA. Isso pode levar alguns minutos. 
                            As regras serão exibidas aqui assim que estiverem prontas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
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

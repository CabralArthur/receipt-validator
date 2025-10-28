import { useState } from "react";
import { Mail, Plus, Trash2, Loader2, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSettingsContainer from "./Settings.container";
import { CreateAliasModal, DeleteConfirmModal } from "./";

export default function EmailTab() {
  const {
    aliases,
    aliasesLoading,
    aliasesError,
    isCreatingAlias,
    isDeletingAlias,
    createAliasError,
    deleteAliasError,
    isCreateAliasModalOpen,
    isDeleteAliasModalOpen,
    handleCreateAlias,
    handleDeleteAlias,
    openDeleteAliasModal,
    closeModals,
    setIsCreateAliasModalOpen,
  } = useSettingsContainer();

  const [copiedAlias, setCopiedAlias] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAlias(text);
      setTimeout(() => setCopiedAlias(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  if (aliasesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (aliasesError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-12 w-12 mx-auto mb-2" />
          <p>Erro ao carregar endereços de email</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Endereços de Email
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Gerencie os endereços de email para recebimento de documentos
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateAliasModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Adicionar Email
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Como funciona?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Os endereços de email permitem que você receba documentos em endereços específicos. 
                Cada e-mail criado será um ponto de entrada para documentos que serão processados automaticamente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aliases List */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Emails</CardTitle>
          <CardDescription>
            Gerencie os endereços de email para recebimento de documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aliases.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Nenhum email encontrado
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Comece criando seu primeiro email
              </p>
              <Button onClick={() => setIsCreateAliasModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Email
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {aliases.map((alias) => (
                <div
                  key={alias.id}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {alias.inbound_address}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Criado em {new Date(alias.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(alias.inbound_address)}
                      className="h-8 w-8 p-0"
                      title="Copiar email"
                    >
                      {copiedAlias === alias.inbound_address ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteAliasModal(alias.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Excluir alias"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateAliasModal
        isOpen={isCreateAliasModalOpen}
        onClose={() => setIsCreateAliasModalOpen(false)}
        onSubmit={handleCreateAlias}
        isLoading={isCreatingAlias}
        error={createAliasError}
      />

      <DeleteConfirmModal
        isOpen={isDeleteAliasModalOpen}
        onClose={() => closeModals()}
        onConfirm={handleDeleteAlias}
        isLoading={isDeletingAlias}
        error={deleteAliasError}
        title="Excluir Endereço de Email"
        description="Tem certeza que deseja excluir este endereço de email? Esta ação não pode ser desfeita."
      />
    </div>
  );
}

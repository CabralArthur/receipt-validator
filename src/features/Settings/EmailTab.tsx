import { useState } from "react";
import { Mail, Loader2, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSettingsContainer from "./Settings.container";

export default function EmailTab() {
  const {
    aliases,
    aliasesLoading,
    aliasesError,
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
            Visualize os endereços de email para recebimento de documentos
          </p>
        </div>
      </div>

      {/* Aliases List */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Emails</CardTitle>
          <CardDescription>
            Visualize os endereços de email para recebimento de documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aliases.length === 0 ? (
            <div className="text-center py-6">
              {/* Icon */}
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>

              {/* Main Message */}
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Aguardando criação do endereço de email
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-md mx-auto text-sm">
                Nossa equipe está criando um endereço de email exclusivo para você. 
                Você será notificado por email quando estiver pronto!
              </p>

              {/* Process Flow */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 max-w-2xl mx-auto">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm">
                  Como funciona o processo
                </h4>
                
                <div className="space-y-2">
                  {/* Step 1 */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      1
                    </div>
                    <div className="text-left">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                        Cadastro realizado
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Sua conta foi criada com sucesso
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      2
                    </div>
                    <div className="text-left">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                        Criação do endereço de email
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Nossa equipe está criando um endereço exclusivo para você
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      3
                    </div>
                    <div className="text-left">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                        Notificação por email
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Você receberá um email quando o endereço estiver pronto
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      4
                    </div>
                    <div className="text-left">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                        Conta ativa para recebimento
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Sua conta estará pronta para receber e processar documentos
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      5
                    </div>
                    <div className="text-left">
                      <h5 className="font-medium text-slate-900 dark:text-slate-100 text-xs">
                        Acompanhamento de status
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Você poderá acompanhar o status de cada documento processado
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Mail className="h-3 w-3" />
                    <span>
                      Precisa de ajuda? Entre em contato conosco
                    </span>
                  </div>
                </div>
              </div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

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

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Endereços de Email
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Visualize os endereços de email disponíveis para recebimento de documentos.
                Os endereços de email para recebimento de documentos são criados pela nossa equipe.
                <br/>Se precisar de mais endereços, entre em contato conosco.
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
            Visualize os endereços de email para recebimento de documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aliases.length === 0 ? (
            <div className="text-center py-16">
              {/* Icon */}
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-slate-400" />
              </div>

              {/* Main Message */}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Nenhum endereço de email encontrado
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Os endereços de email para recebimento de documentos aparecerão aqui quando forem criados pela nossa equipe.
              </p>
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

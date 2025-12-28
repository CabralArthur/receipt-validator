import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useIntegrationSuccessContainer from './IntegrationSuccess.container';

export default function IntegrationSuccess() {
  const { countdown, closeScreen } = useIntegrationSuccessContainer();

  // Don't render if closeScreen is false (will redirect)
  if (!closeScreen) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center flex-1 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Integração Conectada!</CardTitle>
            <CardDescription className="text-base">
              Sua integração foi configurada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Esta janela será fechada automaticamente em {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
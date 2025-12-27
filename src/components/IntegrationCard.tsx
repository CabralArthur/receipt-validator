import { useState } from 'react';
import { IntegrationWithUser } from '@/types/integrations';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Plug, PlugZap, AlertCircle, XCircle } from 'lucide-react';

interface IntegrationCardProps {
  integration: IntegrationWithUser;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onEnable: (id: string) => void;
  isLoading?: boolean;
}

const statusConfig = {
  connected: {
    label: 'Conectado',
    variant: 'default' as const,
    icon: PlugZap,
    color: 'text-green-600 dark:text-green-400',
  },
  not_connected: {
    label: 'Não Conectado',
    variant: 'outline' as const,
    icon: Plug,
    color: 'text-slate-500 dark:text-slate-400',
  },
  disabled: {
    label: 'Desabilitado',
    variant: 'secondary' as const,
    icon: XCircle,
    color: 'text-slate-600 dark:text-slate-300',
  },
  error: {
    label: 'Erro',
    variant: 'destructive' as const,
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
  },
};

export default function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onEnable,
  isLoading = false,
}: IntegrationCardProps) {
  const [imageError, setImageError] = useState(false);
  const status = integration.status || 'not_connected';
  const statusInfo = statusConfig[status] || statusConfig.not_connected;
  const StatusIcon = statusInfo.icon;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'há poucos instantes';
      if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      if (diffDays < 30) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
      
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) return `há ${diffMonths} mês${diffMonths > 1 ? 'es' : ''}`;
      
      const diffYears = Math.floor(diffDays / 365);
      return `há ${diffYears} ano${diffYears > 1 ? 's' : ''}`;
    } catch {
      return null;
    }
  };

  const handleAction = () => {
    if (status === 'not_connected' || status === null) {
      onConnect(integration.id);
    } else if (status === 'disabled') {
      onEnable(integration.id);
    } else if (status === 'error') {
      // Try to reconnect on error
      onConnect(integration.id);
    }
  };

  const handleDisconnect = () => {
    onDisconnect(integration.id);
  };

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardContent className="flex-1 p-6">
        {/* Header with icon and badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {integration.icon_url && !imageError ? (
              <img
                src={integration.icon_url}
                alt={integration.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(integration.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {integration.name}
              </h3>
              {integration.category && (
                <Badge variant="secondary" className="mt-1">
                  {integration.category}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {integration.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {integration.description}
          </p>
        )}

        {/* Status badge */}
        <div className="flex items-center gap-2 mb-4">
          <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
          <Badge variant={statusInfo.variant} className="text-xs">
            {statusInfo.label}
          </Badge>
        </div>

        {/* Connected date */}
        {integration.connected_at && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Conectado {formatDate(integration.connected_at)}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 p-6 pt-0">
        {status === 'connected' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Desconectando...
              </>
            ) : (
              'Desconectar'
            )}
          </Button>
        )}
        {(status === 'not_connected' || status === null) && (
          <Button
            variant="default"
            size="sm"
            onClick={handleAction}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Conectando...
              </>
            ) : (
              'Conectar'
            )}
          </Button>
        )}
        {status === 'disabled' && (
          <Button
            variant="default"
            size="sm"
            onClick={handleAction}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Habilitando...
              </>
            ) : (
              'Habilitar'
            )}
          </Button>
        )}
        {status === 'error' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAction}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reconectando...
              </>
            ) : (
              'Tentar Novamente'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}


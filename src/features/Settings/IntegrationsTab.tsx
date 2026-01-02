import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import IntegrationCard from '@/components/IntegrationCard';
import useIntegrationsContainer from '@/features/Integrations/Integrations.container';

export default function IntegrationsTab() {
  const {
    integrations,
    searchQuery,
    setSearchQuery,
    isLoading,
    isConnecting,
    isDisconnecting,
    isEnabling,
    error,
    connectError,
    disconnectError,
    enableError,
    handleConnect,
    handleDisconnect,
    handleEnable,
  } = useIntegrationsContainer();

  const isActionLoading = isConnecting || isDisconnecting || isEnabling;
  const hasError = error || connectError || disconnectError || enableError;

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {hasError && (
        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">
              {error?.message || 
               connectError?.message || 
               disconnectError?.message || 
               enableError?.message || 
               'Ocorreu um erro. Tente novamente.'}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar integrações..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {integrations.length} {integrations.length === 1 ? 'integração encontrada' : 'integrações encontradas'}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-green-700 mb-3" />
          <p className="text-xs text-slate-600 dark:text-slate-400">Carregando integrações...</p>
        </div>
      )}

      {/* Integrations Grid */}
      {!isLoading && integrations.length === 0 && (
        <div className="text-center py-8">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {searchQuery
              ? 'Nenhuma integração encontrada com esse nome.'
              : 'Nenhuma integração disponível no momento.'}
          </p>
        </div>
      )}

      {!isLoading && integrations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onEnable={handleEnable}
              isLoading={isActionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}


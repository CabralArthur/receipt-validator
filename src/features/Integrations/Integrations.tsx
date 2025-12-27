import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import IntegrationCard from '@/components/IntegrationCard';
import useIntegrationsContainer from './Integrations.container';

export default function Integrations() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Integrações
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Conecte e gerencie suas integrações
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {hasError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar integrações..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {integrations.length} {integrations.length === 1 ? 'integração encontrada' : 'integrações encontradas'}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-700 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando integrações...</p>
        </div>
      )}

      {/* Integrations Grid */}
      {!isLoading && integrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            {searchQuery
              ? 'Nenhuma integração encontrada com esse nome.'
              : 'Nenhuma integração disponível no momento.'}
          </p>
        </div>
      )}

      {!isLoading && integrations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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


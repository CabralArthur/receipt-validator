import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IntegrationCard from '@/components/IntegrationCard';
import useIntegrationsContainer from '@/features/Integrations/Integrations.container';
import { cn } from '@/lib/utils';

export default function IntegrationsTab() {
  const {
    integrations,
    categories,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    isLoading,
    isConnecting,
    isDisconnecting,
    isEnabling,
    isDisabling,
    error,
    connectError,
    disconnectError,
    enableError,
    disableError,
    handleConnect,
    handleDisconnect,
    handleEnable,
    handleDisable,
  } = useIntegrationsContainer();

  const statusOptions: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'connected', label: 'Conectados' },
    { value: 'not_connected', label: 'Não Conectados' },
    { value: 'disabled', label: 'Desabilitados' },
    { value: 'error', label: 'Erro' },
  ];

  const isActionLoading = isConnecting || isDisconnecting || isEnabling || isDisabling;
  const hasError = error || connectError || disconnectError || enableError || disableError;

  return (
    <div className="space-y-6">
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
               disableError?.message || 
               'Ocorreu um erro. Tente novamente.'}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
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

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Category Filter */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Label htmlFor="category-filter" className="text-sm text-slate-600 dark:text-slate-400">
              Categoria
            </Label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              )}
            >
              <option value="all">Todas</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <Label htmlFor="status-filter" className="text-sm text-slate-600 dark:text-slate-400">
              Status
            </Label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={cn(
                "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              )}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
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
          <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Carregando integrações...</p>
        </div>
      )}

      {/* Integrations Grid */}
      {!isLoading && integrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600 dark:text-slate-400">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Nenhuma integração encontrada com os filtros aplicados.'
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
              onDisable={handleDisable}
              isLoading={isActionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}


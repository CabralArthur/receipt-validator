import { useState, useMemo } from 'react';
import { useIntegrations } from '@/hooks/useIntegrations';

export type StatusFilter = 'all' | 'connected' | 'not_connected' | 'disabled' | 'error';

const useIntegrationsContainer = () => {
  const {
    integrations,
    isLoading,
    error,
    connect,
    disconnect,
    enable,
    disable,
    isConnecting,
    isDisconnecting,
    isEnabling,
    isDisabling,
    connectError,
    disconnectError,
    enableError,
    disableError,
  } = useIntegrations();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Get unique categories from integrations
  const categories = useMemo(() => {
    const cats = integrations
      .map((i) => i.category)
      .filter((cat): cat is string => cat !== null && cat !== undefined);
    return Array.from(new Set(cats)).sort();
  }, [integrations]);

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    let filtered = [...integrations];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (integration) =>
          integration.name.toLowerCase().includes(query) ||
          integration.description?.toLowerCase().includes(query) ||
          integration.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((integration) => integration.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((integration) => {
        const status = integration.status || 'not_connected';
        return status === statusFilter;
      });
    }

    return filtered;
  }, [integrations, searchQuery, categoryFilter, statusFilter]);

  // Handlers
  const handleConnect = (integrationId: string) => {
    connect(integrationId, {
      onError: (error) => {
        console.error('Erro ao conectar:', error);
      },
    });
  };

  const handleDisconnect = (integrationId: string) => {
    disconnect(integrationId, {
      onError: (error) => {
        console.error('Erro ao desconectar:', error);
      },
    });
  };

  const handleEnable = (integrationId: string) => {
    enable(integrationId, {
      onError: (error) => {
        console.error('Erro ao habilitar:', error);
      },
    });
  };

  const handleDisable = (integrationId: string) => {
    disable(integrationId, {
      onError: (error) => {
        console.error('Erro ao desabilitar:', error);
      },
    });
  };

  return {
    // Data
    integrations: filteredIntegrations,
    allIntegrations: integrations,
    categories,
    
    // Filters
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    
    // Loading states
    isLoading,
    isConnecting,
    isDisconnecting,
    isEnabling,
    isDisabling,
    
    // Errors
    error,
    connectError,
    disconnectError,
    enableError,
    disableError,
    
    // Actions
    handleConnect,
    handleDisconnect,
    handleEnable,
    handleDisable,
  };
};

export default useIntegrationsContainer;


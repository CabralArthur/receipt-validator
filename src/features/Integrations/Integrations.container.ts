import { useState, useMemo } from 'react';
import { useIntegrations } from '@/hooks/useIntegrations';

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

  // Filter integrations by name only
  const filteredIntegrations = useMemo(() => {
    if (!searchQuery.trim()) {
      return integrations;
    }

    const query = searchQuery.toLowerCase();
    return integrations.filter((integration) =>
      integration.name.toLowerCase().includes(query)
    );
  }, [integrations, searchQuery]);

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
    
    // Filters
    searchQuery,
    setSearchQuery,
    
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


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { IntegrationWithUser } from '@/types/integrations';

// Fetch integrations with user status
async function fetchIntegrationsWithUser(): Promise<IntegrationWithUser[]> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('Usuário não autenticado');
  }

  // Try to fetch from view first
  const { data: viewData, error: viewError } = await supabase
    .from('integrations_with_user')
    .select('*');

  if (!viewError && viewData) {
    return viewData as IntegrationWithUser[];
  }

  // Fallback: fetch from integrations table and join manually
  const { data: integrations, error: integrationsError } = await supabase
    .from('integrations')
    .select('*')
    .order('name');

  if (integrationsError) {
    throw new Error(`Erro ao buscar integrações: ${integrationsError.message}`);
  }

  if (!integrations || integrations.length === 0) {
    return [];
  }

  // Fetch user integrations
  const { data: userIntegrations, error: userIntegrationsError } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', user.user.id);

  if (userIntegrationsError) {
    throw new Error(`Erro ao buscar integrações do usuário: ${userIntegrationsError.message}`);
  }

  // Join manually
  return integrations.map((integration) => {
    const userIntegration = userIntegrations?.find(
      (ui) => ui.integration_id === integration.id
    );

    return {
      id: integration.id,
      key: integration.key,
      name: integration.name,
      description: integration.description,
      category: integration.category,
      icon_url: integration.icon_url,
      auth_type: integration.auth_type || 'none',
      user_integration_id: userIntegration?.id || null,
      status: (userIntegration?.status as IntegrationWithUser['status']) || 'not_connected',
      connected_at: userIntegration?.connected_at || null,
      last_synced_at: userIntegration?.last_synced_at || null,
      settings: userIntegration?.settings || null,
    } as IntegrationWithUser;
  });
}

// Connect integration
async function connectIntegration(integrationId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('user_integrations')
    .upsert({
      user_id: user.user.id,
      integration_id: integrationId,
      status: 'connected',
      connected_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,integration_id',
    });

  if (error) {
    throw new Error(`Erro ao conectar integração: ${error.message}`);
  }
}

// Disconnect integration
async function disconnectIntegration(integrationId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('user_integrations')
    .delete()
    .eq('user_id', user.user.id)
    .eq('integration_id', integrationId);

  if (error) {
    throw new Error(`Erro ao desconectar integração: ${error.message}`);
  }
}

// Enable integration
async function enableIntegration(integrationId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('Usuário não autenticado');
  }

  // Use upsert to create if doesn't exist, or update if exists
  const { error } = await supabase
    .from('user_integrations')
    .upsert({
      user_id: user.user.id,
      integration_id: integrationId,
      status: 'connected',
      connected_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,integration_id',
    });

  if (error) {
    throw new Error(`Erro ao habilitar integração: ${error.message}`);
  }
}

// Disable integration
async function disableIntegration(integrationId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('user_integrations')
    .update({ status: 'disabled' })
    .eq('user_id', user.user.id)
    .eq('integration_id', integrationId);

  if (error) {
    throw new Error(`Erro ao desabilitar integração: ${error.message}`);
  }
}

export function useIntegrations() {
  const queryClient = useQueryClient();

  // Fetch integrations
  const {
    data: integrations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['integrations'],
    queryFn: fetchIntegrationsWithUser,
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: connectIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: disconnectIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  // Enable mutation
  const enableMutation = useMutation({
    mutationFn: enableIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  // Disable mutation
  const disableMutation = useMutation({
    mutationFn: disableIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  return {
    integrations,
    isLoading,
    error,
    connect: connectMutation.mutate,
    disconnect: disconnectMutation.mutate,
    enable: enableMutation.mutate,
    disable: disableMutation.mutate,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isEnabling: enableMutation.isPending,
    isDisabling: disableMutation.isPending,
    connectError: connectMutation.error,
    disconnectError: disconnectMutation.error,
    enableError: enableMutation.error,
    disableError: disableMutation.error,
  };
}


export type IntegrationStatus = 'connected' | 'not_connected' | 'disabled' | 'error' | null;

export type IntegrationAuthType = 'oauth' | 'api_key' | 'webhook' | 'none';

export interface IntegrationWithUser {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string | null;
  icon_url: string | null;
  auth_type: IntegrationAuthType;
  user_integration_id: string | null;
  status: IntegrationStatus;
  connected_at: string | null;
  last_synced_at: string | null;
  settings: Record<string, any> | null;
}





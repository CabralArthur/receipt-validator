import { supabase } from '@/lib/supabaseClient';

export interface User {
  id: string
  email: string
  name: string
}

export const getUserInfo = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Transformar dados do Supabase para o formato esperado
    const userInfo: User = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.email || '',
    };

    return userInfo;
  } catch {
    return null;
  }
}
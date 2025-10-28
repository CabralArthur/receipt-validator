import { supabase } from '@/lib/supabaseClient';

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    throw new Error(error.message);
  }
};

export const updatePassword = async (password: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password: password
  });
  
  if (error) {
    throw new Error(error.message);
  }
};

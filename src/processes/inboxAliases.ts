import { supabase } from "../lib/supabaseClient";

export interface InboxAlias {
  id: string;
  owner_user_id: string;
  inbound_address: string;
  created_at: string;
}

// Lista todos os aliases do usuário logado
export async function listInboxAliases(): Promise<InboxAlias[]> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("inbox_aliases")
    .select("*")
    .eq("owner_user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Erro ao listar aliases de email");
  }

  return data as InboxAlias[];
}

// Cria um novo alias de email
export async function createInboxAlias(inbound_address: string): Promise<InboxAlias> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado");
  }

  const { data, error } = await supabase
    .from("inbox_aliases")
    .insert([
      {
        owner_user_id: authData.user.id,
        inbound_address,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error(error);
    
    // Tratar erro de email duplicado de forma mais amigável
    if (error.code === '23505' && error.message.includes('inbox_aliases_inbound_address_key')) {
      throw new Error("Este endereço de email já está sendo usado. Por favor, escolha outro endereço.");
    }
    
    throw new Error(error.message || "Erro ao criar endereço de email");
  }

  return data as InboxAlias;
}

// Deleta um alias de email
export async function deleteInboxAlias(id: string): Promise<void> {
  const { error } = await supabase
    .from("inbox_aliases")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Erro ao deletar alias de email");
  }
}

// Atualiza dados do usuário (nome)
export async function updateUserProfile(data: { name: string }): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: {
      name: data.name,
    },
  });

  if (error) {
    console.error(error);
    throw new Error("Erro ao atualizar perfil");
  }
}

// Atualiza senha do usuário
export async function updateUserPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error(error);
    throw new Error("Erro ao atualizar senha");
  }
}

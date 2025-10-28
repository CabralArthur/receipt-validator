// src/services/employeesService.ts
import { supabase, Employee } from "../lib/supabaseClient"

// Lista todos os employees ativos do usuário logado
export async function listEmployees(): Promise<Employee[]> {
  // pega user atual
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado")
  }

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("user_id", authData.user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    throw new Error("Erro ao listar funcionários")
  }

  return data as Employee[]
}

// Cria um novo employee para o usuário logado
export async function createEmployee(payload: { name: string; email: string }): Promise<Employee> {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) {
    throw new Error("Usuário não autenticado")
  }

  const { data, error } = await supabase
    .from("employees")
    .insert([
      {
        name: payload.name,
        email: payload.email,
        user_id: authData.user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error(error)
    throw new Error(error.message || "Erro ao criar funcionário")
  }

  return data as Employee
}

// Atualiza nome/email do employee
export async function updateEmployee(id: string, payload: { name: string; email: string }): Promise<Employee> {
  const { data, error } = await supabase
    .from("employees")
    .update({
      name: payload.name,
      email: payload.email,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(error)
    throw new Error("Erro ao atualizar funcionário")
  }

  return data as Employee
}

// Soft delete: marca deleted_at agora
export async function softDeleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from("employees")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error(error)
    throw new Error("Erro ao remover funcionário")
  }
}

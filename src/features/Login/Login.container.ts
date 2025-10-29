import * as yup from 'yup';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import { loginSchema } from "@/schemas/auth";
import { supabase } from "@/lib/supabaseClient";

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginContainer() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema)
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return authData;
    },
    onSuccess: (data) => {
      setErrorMsg(null);
      console.log("session:", data.session);
      // Redirecionar para a página principal após login bem-sucedido
      navigate("/");
    },
    onError: (error: Error) => {
      setErrorMsg(error.message);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setErrorMsg(null);
    loginMutation.mutate(data);
  };

  return {
    register,
    errors,
    onSubmit,
    handleSubmit,
    isLoading: loginMutation.isPending,
    showPassword,
    setShowPassword,
    errorMsg
  }
}
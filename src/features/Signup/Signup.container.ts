import * as yup from "yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";

import { signupSchema } from "@/schemas/auth";
import { supabase } from "@/lib/supabaseClient";

type SignupFormData = yup.InferType<typeof signupSchema>;

export default function SignupContainer() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<
    SignupFormData
  >({
    resolver: yupResolver(signupSchema)
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return authData;
    },
    onSuccess: () => {
      setErrorMsg(null);
      setSuccessMsg("Conta criada com sucesso! Verifique seu e-mail para confirmar.");
    },
    onError: (error: Error) => {
      setSuccessMsg(null);
      setErrorMsg(error.message);
    },
  });

  const onSubmit = (data: SignupFormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    signupMutation.mutate(data);
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isPending: signupMutation.isPending,
    errorMsg,
    successMsg
  }
}
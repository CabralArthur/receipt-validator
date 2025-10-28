import * as yup from "yup";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

import { resetPasswordSchema } from "@/schemas/auth";
import { updatePassword } from "@/processes/auth";

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

export default function ResetPasswordContainer() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    
    const { 
        register, 
        handleSubmit,
        formState: { errors }
    } = useForm<ResetPasswordFormData>({
        resolver: yupResolver(resetPasswordSchema)
    });

    // Verificar se o usuário está autenticado
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error || !session) {
                    setErrorMsg("Sessão expirada. Por favor, solicite um novo link de redefinição de senha.");
                    setTimeout(() => {
                        navigate("/request-password-reset");
                    }, 3000);
                    return;
                }
                
                setIsCheckingSession(false);
            } catch (error) {
                setErrorMsg("Erro ao verificar sessão. Tente novamente.");
                setIsCheckingSession(false);
            }
        };

        checkSession();
    }, [navigate]);

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: ResetPasswordFormData) => {
            await updatePassword(data.password);
        },
        onSuccess: () => {
            setErrorMsg(null);
            setSuccessMsg("Senha redefinida com sucesso! Redirecionando para o login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        },
        onError: (error: Error) => {
            setSuccessMsg(null);
            setErrorMsg(error.message);
        },
    });

    const onSubmit = (data: ResetPasswordFormData) => {
        setErrorMsg(null);
        setSuccessMsg(null);
        
        // Validação de confirmação de senha
        if (data.password !== data.confirmPassword) {
            setErrorMsg("As senhas não conferem.");
            return;
        }
        
        resetPasswordMutation.mutate(data);
    };

    return { 
        register, 
        handleSubmit, 
        errors, 
        onSubmit, 
        isLoading: resetPasswordMutation.isPending || isCheckingSession, 
        showPassword, 
        setShowPassword, 
        showConfirmPassword, 
        setShowConfirmPassword,
        errorMsg,
        successMsg,
        statusMsg: successMsg,
        isCheckingSession
    };
}

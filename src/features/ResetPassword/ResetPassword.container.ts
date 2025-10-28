import * as yup from "yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { resetPasswordSchema } from "@/schemas/auth";
import { updatePassword } from "@/processes/auth";

type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

export default function ResetPasswordContainer() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    const { 
        register, 
        handleSubmit,
        formState: { errors }
    } = useForm<ResetPasswordFormData>({
        resolver: yupResolver(resetPasswordSchema)
    });

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
        resetPasswordMutation.mutate(data);
    };

    return { 
        register, 
        handleSubmit, 
        errors, 
        onSubmit, 
        isLoading: resetPasswordMutation.isPending, 
        showPassword, 
        setShowPassword, 
        showConfirmPassword, 
        setShowConfirmPassword,
        errorMsg,
        successMsg
    };
}

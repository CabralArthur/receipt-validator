import * as yup from "yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset } from "@/processes/auth";
import { requestPasswordResetSchema } from "@/schemas/auth";

type RequestPasswordResetFormData = yup.InferType<typeof requestPasswordResetSchema>;

export default function RequestPasswordResetPageContainer() {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const { 
        register, 
        handleSubmit,
        formState: { errors }
    } = useForm<RequestPasswordResetFormData>({
        resolver: yupResolver(requestPasswordResetSchema)
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: RequestPasswordResetFormData) => {
            await requestPasswordReset(data.email);
        },
        onSuccess: () => {
            setErrorMsg(null);
            setSuccessMsg("Email de redefinição enviado! Verifique sua caixa de entrada.");
        },
        onError: (error: Error) => {
            setSuccessMsg(null);
            setErrorMsg(error.message);
        },
    });

    const onSubmit = (data: RequestPasswordResetFormData) => {
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
        errorMsg,
        successMsg,
        statusMsg: successMsg
    };
}
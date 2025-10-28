import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createPortal } from "react-dom";
import { X, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = yup.object({
  inbound_address: yup
    .string()
    .required("Endereço de email é obrigatório")
    .email("Digite um email válido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
});

interface CreateAliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inbound_address: string) => void;
  isLoading: boolean;
  error: any;
}

export default function CreateAliasModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
}: CreateAliasModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      inbound_address: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: { inbound_address: string }) => {
    onSubmit(data.inbound_address);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Criar Endereço de Email
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Não foi possível criar o endereço de email
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error.message || "Erro ao processar solicitação"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Como funciona?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Use um endereço de email único que será usado para receber documentos. 
                  Exemplo: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">documentos@seudominio.com</code>
                </p>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="inbound_address" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Endereço de Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="inbound_address"
                type="email"
                {...register("inbound_address")}
                placeholder="exemplo@seudominio.com"
                className={`pl-10 transition-colors ${
                  errors.inbound_address 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                    : "focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
            </div>
            {errors.inbound_address && (
              <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.inbound_address.message}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Criar Alias
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

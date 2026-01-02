import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { User, Lock, Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSettingsContainer from "./Settings.container";

const profileSchema = yup.object({
  name: yup
    .string()
    .required("Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
});

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Senha atual é obrigatória"),
  newPassword: yup
    .string()
    .required("Nova senha é obrigatória")
    .min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: yup
    .string()
    .required("Confirmação de senha é obrigatória")
    .oneOf([yup.ref("newPassword")], "Senhas não coincidem"),
});

export default function ProfileTab() {
  const {
    userInfo,
    isUpdatingProfile,
    isUpdatingPassword,
    updateProfileError,
    updatePasswordError,
    handleUpdateProfile,
    handleUpdatePassword,
  } = useSettingsContainer();

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: userInfo?.name || "",
    },
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (data: { name: string }) => {
    handleUpdateProfile(data);
  };

  const onPasswordSubmit = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    handleUpdatePassword(data);
    passwordForm.reset();
    setShowPasswordForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Profile Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Informações do Perfil
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Atualize suas informações pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-3">
            {/* Error Message */}
            {updateProfileError && (
              <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {updateProfileError.message || "Erro ao atualizar perfil"}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isUpdatingProfile && (
              <div className="p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-700" />
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Atualizando perfil...
                  </p>
                </div>
              </div>
            )}

            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={userInfo?.email || ""}
                  disabled
                  className="pl-9 h-9 text-sm bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                O email não pode ser alterado
              </p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Nome</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  id="name"
                  {...profileForm.register("name")}
                  placeholder="Digite seu nome"
                  className={`pl-9 h-9 text-sm ${profileForm.formState.errors.name ? "border-red-500" : ""}`}
                />
              </div>
              {profileForm.formState.errors.name && (
                <p className="text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={isUpdatingProfile} size="sm" className="h-8 text-xs">
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" />
            Segurança
          </CardTitle>
          <CardDescription className="text-xs mt-0.5">
            Gerencie sua senha e configurações de segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {!showPasswordForm ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Mantenha sua conta segura com uma senha forte
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(true)}
                className="h-8 text-xs"
              >
                Alterar Senha
              </Button>
            </div>
          ) : (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
              {/* Error Message */}
              {updatePasswordError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {updatePasswordError.message || "Erro ao atualizar senha"}
                    </p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {isUpdatingPassword && (
                <div className="p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-700" />
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Atualizando senha...
                    </p>
                  </div>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  placeholder="Digite sua senha atual"
                  className={`h-9 text-sm ${passwordForm.formState.errors.currentPassword ? "border-red-500" : ""}`}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  placeholder="Digite sua nova senha"
                  className={`h-9 text-sm ${passwordForm.formState.errors.newPassword ? "border-red-500" : ""}`}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                  placeholder="Confirme sua nova senha"
                  className={`h-9 text-sm ${passwordForm.formState.errors.confirmPassword ? "border-red-500" : ""}`}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPasswordForm(false);
                    passwordForm.reset();
                  }}
                  disabled={isUpdatingPassword}
                  className="h-8 text-xs"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdatingPassword} size="sm" className="h-8 text-xs">
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Senha"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

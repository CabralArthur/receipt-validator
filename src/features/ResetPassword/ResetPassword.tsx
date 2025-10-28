import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeOffIcon, EyeIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import useResetPasswordContainer from "./ResetPassword.container";

export default function ResetPassword() {
    const {
        register,
        handleSubmit,
        errors,
        onSubmit,
        isLoading,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        errorMsg,
        statusMsg,
        isCheckingSession
    } = useResetPasswordContainer();

    if (isCheckingSession) {
        return (
            <div className="flex min-h-screen flex-1 items-center justify-center">
                <div className="mx-auto w-full max-w-sm min-w-[400px]">
                    <Card className="md:min-w-[400px]">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-sm text-muted-foreground">Verificando sessão...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center">
      <div className="mx-auto w-full max-w-sm min-w-[400px]">
        <Card className="md:min-w-[400px]">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              valida
              <span className="text-blue-500">.ai</span>
            </CardTitle>
            <CardDescription>
              Definir nova senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {errorMsg && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{errorMsg}</p>
                </div>
              )}
              {statusMsg && (
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-800">{statusMsg}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Atualizar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



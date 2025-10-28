import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader
} from "@/components/ui/card";
import Logo from "@/components/ui/logo";

import useLoginPageContainer from "./Login.container";
export default function LoginPage() {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    showPassword,
    setShowPassword,
    errorMsg
  } =
    useLoginPageContainer() || {};

  return (
    <div className="flex min-h-screen items-center justify-center flex-1">
        <div className="mx-auto w-full max-w-sm min-w-[400px]">
          <Card className="md:min-w-[400px]">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <Logo size="md" />
              </div>
              <CardDescription>
                Entre com seu e-mail e senha para acessar sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seuemail@dominio.com"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                  {errors.email &&
                    <p className="text-sm text-red-500">E-mail é obrigatório</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      {...register("password")}
                      aria-invalid={errors.password ? "true" : "false"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-0.5 h-8 w-8 px-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword
                        ? <EyeOffIcon className="h-4 w-4" />
                        : <EyeIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password &&
                    <p className="text-sm text-red-500">
                      Senha é obrigatória
                    </p>}
                </div>
                {errorMsg && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{errorMsg}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="flex flex-col mt-4 space-y-2">
                <div className="flex text-sm">
                  <span className="text-muted-foreground">
                    Esqueceu sua senha?{" "}
                    <Link
                      to="/request-password-reset"
                      className="font-medium text-primary hover:underline"
                    >
                      Resetar senha
                    </Link>
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-primary hover:underline"
                  >
                    Criar conta
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

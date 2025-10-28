import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { EyeOffIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";

import useSignupContainer from "./Signup.container";

const Signup = () => {
  const {
    register,
    handleSubmit,
    errors,
    isPending,
    onSubmit,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    errorMsg,
    successMsg
  } = useSignupContainer();

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
                    Crie sua conta para começar
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register("name")}
                    aria-invalid={errors.name ? "true" : "false"}
                    />
                    {errors.name &&
                    <p className="text-sm text-destructive">
                        {errors.name.message}
                    </p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="youremail@domain.com"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email &&
                    <p className="text-sm text-destructive">
                        {errors.email.message}
                    </p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
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
                        {showPassword
                        ? <EyeOffIcon className="h-4 w-4" />
                        : <EyeIcon className="h-4 w-4" />}
                    </Button>
                    </div>
                    {errors.password &&
                    <p className="text-sm text-destructive">
                        {errors.password.message}
                    </p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword
                        ? <EyeOffIcon className="h-4 w-4" />
                        : <EyeIcon className="h-4 w-4" />}
                    </Button>
                    </div>
                    {errors.confirmPassword &&
                    <p className="text-sm text-destructive">
                        {errors.confirmPassword.message}
                    </p>}
                </div>
                {errorMsg && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="rounded-md bg-green-50 p-4">
                        <p className="text-sm text-green-800">{successMsg}</p>
                    </div>
                )}
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Criando conta..." : "Criar conta"}
                </Button>
                </form>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                    to="/login"
                    className="font-medium text-primary hover:underline"
                >
                    Entrar
                </Link>
                </div>
            </CardContent>
            </Card>
        </div>
    </div>
  );
};

export default Signup;

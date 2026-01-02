import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { EyeOffIcon } from "lucide-react";
import { EyeIcon } from "lucide-react";
import backgroundImage from "@/assets/img/background-2.png";
import logoSource from "@/assets/svg/logo-reembolso-ia.svg";
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
  } = useSignupContainer() || {};

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden flex-item lg:flex flex-col justify-between w-[40vw] overflow-hidden shadow-md m-4 rounded-[24px]">
        <div className="relative h-full w-full flex flex-col justify-between rounded-[24px]">
          <img
            src={backgroundImage}
            alt="Testimonial background"
            className="absolute inset-0 w-full h-full object-cover object-center rounded-[24px]"
          />
          <div className="relative z-10 p-8 flex flex-col h-full justify-between rounded-[24px]">
            <div className="flex items-center gap-2">
                <img src={logoSource} alt="logo" className="h-10 w-[30px]" />
                <span className="text-white text-xl font-light">Reembolso.ia</span>
            </div>
            <div className="flex-1 flex flex-col justify-end pb-8">
              <p className="text-white text-2xl font-semibold mb-2">
                Crie sua conta para começar a gerenciar seus reembolsos!
              </p>
              <span className="text-gray-200 text-sm">Crie sua conta para começar a gerenciar seus reembolsos com mais eficiência.</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/40 z-0 rounded-[24px]" />
        </div>
      </div>
      <div className="flex-item flex flex-1 flex-col px-4 w-[60vw] py-12 lg:flex-none sm:px-6 lg:px-8 bg-gray-100 justify-center items-center">
        <div className="flex flex-col items-center text-center justify-center mb-4 gap-2">
            <span className="text-3xl font-semibold">Crie sua conta</span>
            <span className="text-sm text-muted-foreground max-w-[300px] text-center">Crie sua conta para começar a gerenciar seus reembolsos com mais eficiência.</span>
        </div>
        <div className="mx-auto max-w-lg w-[300px] md:w-[400px] flex flex-col items-center">
          <Card className="min-w-[300px] md:min-w-[400px] w-full pt-6">
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                    id="name"
                    type="text"
                    placeholder="Arthur Silva"
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
                    placeholder="arthur@silva.com"
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
                <Button type="submit" className="w-full bg-green-800 text-white hover:bg-green-900" disabled={isPending}>
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
    </div>
  );
};

export default Signup;

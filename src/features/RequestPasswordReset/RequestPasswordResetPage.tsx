import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Waves } from "@/components/ui/wave-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import useRequestPasswordResetPageContainer from "./RequestPasswordResetPage.container";
export default function RequestPasswordReset() {
  const {
    register,
    handleSubmit,
    onSubmit,
    isLoading,
    errorMsg,
    statusMsg
  } = useRequestPasswordResetPageContainer();

  return (
    <div className="flex min-h-screen flex-1">
      <div className="w-full bg-slate-200 flex flex-col items-center justify-center antialiased relative hidden lg:block">
        <div className="absolute inset-0">
          <Waves
            lineColor="rgba(0, 0, 0, 0.3)"
            backgroundColor="transparent"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-12 lg:flex-none sm:px-6 lg:px-8">
        <Card className="md:min-w-[400px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">
              Recuperar senha
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              Digite seu e-mail e vamos te enviar um link para redefinir a senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  {...register("email")}
                />
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
                {isLoading ? "Enviando..." : "Enviar link"}
              </Button>
              <div className="text-center">
                <Button variant="link" asChild>
                  <Link to="/login">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Voltar ao login
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

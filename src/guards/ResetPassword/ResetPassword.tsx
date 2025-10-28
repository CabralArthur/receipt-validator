import { Loader2 } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

import useIsLogged from '@/hooks/useIsLogged';

export default function ResetPasswordGuard() {
    const { user, loading } = useIsLogged();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }

    // Para reset de senha, permitimos usuários autenticados pelo Supabase
    // mas não redirecionamos para home - eles precisam redefinir a senha
    return <Outlet />;
}

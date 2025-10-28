import { Loader2 } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

import useIsLogged from '@/hooks/useIsLogged';

export default function PublicRouteGuard() {
    const { user, loading } = useIsLogged();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

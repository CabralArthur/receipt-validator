import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

const useIsLogged = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Verificar sessão atual
		const getSession = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			setUser(session?.user ?? null);
			setLoading(false);
		};

		getSession();

		// Escutar mudanças na autenticação
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(_, session) => {
				setUser(session?.user ?? null);
				setLoading(false);
			}
		);

		return () => subscription.unsubscribe();
	}, []);

	return { user, loading };
};

export default useIsLogged;

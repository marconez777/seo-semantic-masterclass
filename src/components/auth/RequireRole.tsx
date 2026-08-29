import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface RequireRoleProps {
  role: 'admin' | 'user';
  children: JSX.Element;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const [user, setUser] = useState<User | null>(null);
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const location = useLocation();

  // Once we've rendered children, never fall back to the loading screen again:
  // isso desmontaria a árvore inteira e apagaria o estado das páginas (ex.: editor do blog).
  const resolvedOnce = useRef(false);

  // Helper: check role using RPC (SECURITY DEFINER - bypasses RLS)
  const checkRole = useCallback(async (userId: string, requiredRole: 'admin' | 'user'): Promise<boolean> => {
    if (requiredRole === 'user') {
      // 'user' role just means authenticated
      return true;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: requiredRole
      });

      if (error) {
        console.error('Error checking role');
        return false;
      }

      return !!data;
    } catch {
      return false;
    }
  }, []);

  // Effect 1: Handle auth state (sync callback only!)
  useEffect(() => {
    // Mantém a MESMA referência quando é o mesmo usuário. O Supabase dispara
    // TOKEN_REFRESHED/SIGNED_IN ao voltar o foco da aba; sem isso, cada evento
    // criava um objeto novo e re-disparava a checagem de role.
    const applyUser = (next: User | null) => {
      setUser((prev) => (prev?.id === next?.id ? prev : next));
      setAuthLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      applyUser(session?.user ?? null);
    });

    // Listen for auth changes - SYNC callback!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      applyUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect 2: Check role when user changes (separate from auth callback)
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setHasRole(null);
      resolvedOnce.current = false;
      return;
    }

    if (role === 'user') {
      // Just needs to be authenticated
      setHasRole(true);
      return;
    }

    // For admin role, check via RPC.
    // Revalidação em background: só bloqueia a tela na primeira checagem.
    if (!resolvedOnce.current) setRoleLoading(true);
    let cancelled = false;
    checkRole(user.id, role).then((result) => {
      if (cancelled) return;
      setHasRole(result);
      setRoleLoading(false);
    });

    return () => { cancelled = true; };
  }, [user, role, authLoading, checkRole]);

  // Loading state (apenas antes da primeira resolução)
  if ((authLoading || roleLoading) && !resolvedOnce.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Admin required but user doesn't have it
  if (role === 'admin' && hasRole === false) {
    return <Navigate to="/403" replace />;
  }

  resolvedOnce.current = true;
  return children;
}

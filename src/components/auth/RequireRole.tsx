import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for auth changes - SYNC callback!
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect 2: Check role when user changes (separate from auth callback)
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setHasRole(null);
      return;
    }

    if (role === 'user') {
      // Just needs to be authenticated
      setHasRole(true);
      return;
    }

    // For admin role, check via RPC
    setRoleLoading(true);
    checkRole(user.id, role).then((result) => {
      setHasRole(result);
      setRoleLoading(false);
    });
  }, [user, role, authLoading, checkRole]);

  // Loading state
  if (authLoading || roleLoading) {
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

  return children;
}

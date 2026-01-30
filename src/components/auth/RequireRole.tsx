import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RequireRoleProps {
  role: 'admin' | 'user';
  children: JSX.Element;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const [user, setUser] = useState<any>(null);
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        setUser(session.user);

        if (role === 'admin') {
          // Check user_roles table for admin role
          const { data: roleData, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (error) {
            console.error('Error checking user role:', error);
            // Fallback to profiles.is_admin for backwards compatibility
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('user_id', session.user.id)
              .single();
            setHasRole(profile?.is_admin ?? false);
          } else {
            setHasRole(!!roleData);
          }
        } else {
          // 'user' role - just needs to be authenticated
          setHasRole(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(checkAuth);
    return () => subscription.unsubscribe();
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (role === 'admin' && !hasRole) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

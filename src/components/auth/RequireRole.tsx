import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RequireRoleProps {
  role: 'admin' | 'user';
  children: JSX.Element;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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

        // Check role from JWT first, then fallback to database
        const jwtRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
        
        if (jwtRole) {
          setUserRole(jwtRole);
          setLoading(false);
        } else {
          // Fallback: check database
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setUserRole(profile?.role || 'user');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(checkAuth);
    return () => subscription.unsubscribe();
  }, []);

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

  if (role === 'admin' && userRole !== 'admin') {
    return <Navigate to="/403" replace />;
  }

  return children;
}
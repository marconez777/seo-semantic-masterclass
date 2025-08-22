import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<null | boolean>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) {
          setAllowed(false);
          navigate('/admin/login');
        }
        return;
      }

      // Try via RPC is_admin(); fallback via profiles.is_admin
      let isAdmin = false;
      const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin', { uid: user.id });

      if (rpcError) {
        console.error("Error checking admin status via rpc:", rpcError);
      }

      if (rpcData === true) {
        isAdmin = true;
      }

      if (!isAdmin) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
            console.error("Error checking admin status via profile:", profileError);
        }

        isAdmin = !!profile?.is_admin;
      }

      if (mounted) {
        setAllowed(isAdmin);
        if (!isAdmin) {
          navigate('/admin/login');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (allowed === null) {
    return null; // Or a loading spinner
  }

  return <>{allowed ? children : null}</>;
}

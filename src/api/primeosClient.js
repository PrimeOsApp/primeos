import { supabase } from '@/lib/supabase';

export const primeos = {
  auth: {
    me: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        role: user.user_metadata?.role || 'admin',
      };
    },
    logout: async () => {
      await supabase.auth.signOut();
      window.location.href = '/login.html';
    },
    logUserInApp: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  },
  db: {
    from: (table) => supabase.from(table),
  },
  supabase,
};

export default primeos;

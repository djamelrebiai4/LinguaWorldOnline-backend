import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export const supabaseClient = createClient(env.supabaseUrl, env.supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const verifyJwt = (token: string): Promise<any> => {
  return supabaseClient.auth.getUser(token).then(({ data, error }) => {
    if (error || !data?.user) {
      throw new Error('Invalid token');
    }
    return {
      sub: data.user.id,
      email: data.user.email,
    };
  });
};

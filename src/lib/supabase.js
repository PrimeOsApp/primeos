import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://foeahubnrbclbelsqikp.supabase.co';
// @ts-ignore
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MnURfwn0NCO-70pR4pF4Vw_Sl4r3CLA';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
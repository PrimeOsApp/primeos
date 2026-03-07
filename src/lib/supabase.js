import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://foeahubnrbclbelsqikp.supabase.co';
const supabaseKey = 'sb_publishable_MnURfwn0NCO-70pR4pF4Vw_Sl4r3CLA';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ongjigyppegbcktiwbvm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tKXkxVOISaihvtTtCsaKYg_edvIegRU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Utility to check if supabase is responsive and has initialized schema.
 * If tables are missing (prior to user executing the SQL setup), it gracefully
 * falls back to full-stack reactive offline localStorage emulation.
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.warn("Supabase tables not detected yet. Run SQL Migrations in developers panel.", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase unreachable or tables not present.", err);
    return false;
  }
}

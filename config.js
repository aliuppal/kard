/* Kard — runtime configuration
   Fill these in from Supabase → Project Settings → API.
   The anon ("publishable") key is designed to be public: what it can do is
   limited by the row-level-security policies in supabase/schema.sql.
   NEVER put the service_role key in this file. */
window.KARD_CONFIG = {
  supabaseUrl: '',        // e.g. https://abcdxyz.supabase.co
  supabaseAnonKey: '',    // the anon / publishable key
  sampleNotice: true      // set to false once the database holds real, verified deals
};

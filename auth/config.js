// Filled in when the pages are published (see content_src/audit/accounts.md).
// Only the PUBLIC anon key belongs here, never the service-role key.
// With a custom Supabase domain, add it to connect-src in the two pages'
// Content-Security-Policy as well.
window.TALKVELA_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};

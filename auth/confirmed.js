// The confirmation link of the sign-up mail leads here.
//   * Recommended template: ?token_hash=…&type=email — verified here, so a
//     mail scanner that opens links without running scripts cannot use it up.
//   * Default template: Supabase verified already and adds #access_token=…
//     or #error=… to the address.
// No session is kept: the learner signs in in the app.
(function () {
  "use strict";
  var A = window.TalkvelaAuth;
  A.start();

  if (A.hash.get("error") || A.hash.get("error_code")) {
    return A.show("bad", "link_bad_title");
  }
  if (A.hash.get("access_token")) return A.show("ok", "confirm_ok_title");

  var tokenHash = A.query.get("token_hash");
  var type = A.query.get("type") || "email";
  if (type === "signup") type = "email";
  if (!tokenHash || ["email", "email_change"].indexOf(type) < 0) {
    return A.show("missing", null);
  }
  var supabase = A.client();
  if (!supabase) return A.show("not-ready", null);

  A.show("checking", "checking");
  supabase.auth
    .verifyOtp({ token_hash: tokenHash, type: type })
    .then(function (r) {
      if (r.error) return A.show("bad", "link_bad_title");
      A.show("ok", "confirm_ok_title");
      return supabase.auth.signOut({ scope: "local" });
    })
    .catch(function () {
      A.show("error", "link_bad_title");
    });
})();

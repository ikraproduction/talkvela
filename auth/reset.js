// The link of the password-reset mail leads here.
//   * Recommended template: ?token_hash=…&type=recovery (verified here).
//   * Default template: Supabase verified already and adds
//     #access_token=…&refresh_token=…&type=recovery, or #error=….
// The session lives in memory only, is used for the one password change,
// and is ended right after it.
(function () {
  "use strict";
  var A = window.TalkvelaAuth;
  A.start();

  var supabase = A.client();
  var form = document.getElementById("form");
  var pw = document.getElementById("pw");
  var pw2 = document.getElementById("pw2");
  var showPw = document.getElementById("show");
  var problem = document.getElementById("problem");
  var save = document.getElementById("save");

  function fail(key) {
    problem.setAttribute("data-t", key);
    problem.textContent = A.t(key);
    problem.hidden = false;
  }

  // Same rule as the app: 8+ characters with letters and digits.
  function goodEnough(p) {
    return p.length >= 8 && /\p{L}/u.test(p) && /\p{Nd}/u.test(p);
  }

  showPw.addEventListener("change", function () {
    pw.type = pw2.type = showPw.checked ? "text" : "password";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    problem.hidden = true;
    if (!goodEnough(pw.value)) return fail("pw_rule");
    if (pw.value !== pw2.value) return fail("pw_mismatch");
    save.disabled = true;
    supabase.auth
      .updateUser({ password: pw.value })
      .then(function (r) {
        save.disabled = false;
        if (r.error) {
          var code = r.error.code || "";
          if (code === "same_password") return fail("pw_same");
          if (code === "weak_password") return fail("pw_weak");
          if (r.error.status === 401 || r.error.status === 403) {
            return A.show("bad", "link_bad_title");
          }
          return fail("error");
        }
        pw.value = pw2.value = "";
        A.show("ok", "reset_ok_title");
        return supabase.auth.signOut({ scope: "local" });
      })
      .catch(function () {
        save.disabled = false;
        fail("error");
      });
  });

  if (A.hash.get("error") || A.hash.get("error_code")) {
    return A.show("bad", "link_bad_title");
  }
  if (!supabase) return A.show("not-ready", null);

  var tokenHash = A.query.get("token_hash");
  var access = A.hash.get("access_token");
  var refresh = A.hash.get("refresh_token");
  var started;
  if (tokenHash && (A.query.get("type") || "recovery") === "recovery") {
    started = supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
  } else if (access && refresh && A.hash.get("type") === "recovery") {
    started = supabase.auth.setSession({ access_token: access, refresh_token: refresh });
  } else {
    return A.show("missing", null);
  }

  A.show("checking", "checking");
  started
    .then(function (r) {
      if (r.error || !r.data || !r.data.session) {
        return A.show("bad", "link_bad_title");
      }
      A.show("form", "reset_title");
    })
    .catch(function () {
      A.show("error", "link_bad_title");
    });
})();

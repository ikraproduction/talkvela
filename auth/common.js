// Shared by confirmed.html and reset.html: language switch, reading the
// link parameters, and a Supabase client that keeps nothing in the browser.
(function () {
  "use strict";
  var TEXT = window.TALKVELA_TEXT;
  var ORDER = ["de", "sq", "en", "tr", "ar", "uk", "fa"];

  // Read the link once, then remove tokens and codes from the address bar
  // and the browser history.
  var query = new URLSearchParams(window.location.search);
  var hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  var wanted = query.get("lang");
  if (window.history && window.history.replaceState) {
    var clean = window.location.pathname + (wanted ? "?lang=" + encodeURIComponent(wanted) : "");
    window.history.replaceState(null, "", clean);
  }

  function pickLang() {
    if (wanted && TEXT[wanted]) return wanted;
    var langs = navigator.languages || [navigator.language || "de"];
    for (var i = 0; i < langs.length; i++) {
      var code = String(langs[i]).toLowerCase().split("-")[0];
      if (code === "prs") code = "fa"; // Dari
      if (TEXT[code]) return code;
    }
    return "de";
  }

  var lang = pickLang();
  var state = null;

  function t(key) {
    return (TEXT[lang] && TEXT[lang][key]) || TEXT.de[key] || key;
  }

  function apply() {
    var root = document.documentElement;
    root.lang = lang;
    root.dir = TEXT[lang].rtl ? "rtl" : "ltr";
    var nodes = document.querySelectorAll("[data-t]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-t"));
    }
    document.title = state ? t(state) + " – Talkvela" : "Talkvela";
  }

  function setUpSwitch() {
    var select = document.getElementById("lang");
    ORDER.forEach(function (code) {
      var o = document.createElement("option");
      o.value = code;
      o.lang = code;
      o.textContent = TEXT[code].name;
      select.appendChild(o);
    });
    select.value = lang;
    select.addEventListener("change", function () {
      lang = select.value;
      apply();
    });
  }

  /** Shows the part of the page with id [id]; [titleKey] names the tab. */
  function show(id, titleKey) {
    var parts = document.querySelectorAll("[data-part]");
    for (var i = 0; i < parts.length; i++) {
      parts[i].hidden = parts[i].getAttribute("data-part") !== id;
    }
    state = titleKey;
    apply();
    var h = document.querySelector('[data-part="' + id + '"] h1');
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus();
    }
  }

  function client() {
    var c = window.TALKVELA_CONFIG || {};
    if (!c.supabaseUrl || !c.supabaseAnonKey || !window.supabase) return null;
    if (!/^https:\/\//.test(c.supabaseUrl)) return null;
    return window.supabase.createClient(c.supabaseUrl, c.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  window.TalkvelaAuth = {
    query: query,
    hash: hash,
    t: t,
    show: show,
    client: client,
    start: function () {
      setUpSwitch();
      apply();
    }
  };
})();

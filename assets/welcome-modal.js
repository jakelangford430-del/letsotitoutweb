(function () {
  "use strict";

  // Replaces the old launch banner. Same underlying message — the site is new,
  // tell Jake if something looks broken — but it opens as a welcome with a short
  // intro rather than a strip pinned above the nav.

  var SEEN_KEY = "lsio_welcome_seen";

  // localStorage, not sessionStorage: a welcome is a once-ever thing. Coming back
  // tomorrow and being introduced to the site again would just be nagging.
  var store = {
    seen: function () {
      try { return window.localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { return false; }
    },
    markSeen: function () {
      try { window.localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* private browsing */ }
    }
  };

  // Pages where a first-time welcome would land badly: someone who just sent the
  // contact form does not need introducing, and the account area is for people
  // who have already signed up.
  var SKIP = ["/connect/thanks/", "/account/"];

  var WHATSAPP_URL =
    "https://wa.me/61472544399?text=" +
    encodeURIComponent(
      "Hi Jake, found something on the website that looks off - here's what happened: "
    );

  function shouldShow() {
    if (store.seen()) return false;
    var path = window.location.pathname.replace(/index\.html$/, "");
    for (var i = 0; i < SKIP.length; i++) {
      if (path === SKIP[i]) return false;
    }
    // <dialog>.showModal() gives focus trapping, Esc-to-close and focus restore
    // for free. Without it, skip the modal rather than ship a half-accessible one.
    return typeof window.HTMLDialogElement === "function" &&
      typeof document.createElement("dialog").showModal === "function";
  }

  var CSS = [
    "#lsio-welcome{border:none;padding:0;max-width:min(560px,calc(100vw - 32px));width:100%;",
    "background:#1B231D;color:#F7F1E5;border-radius:14px;overflow:hidden;",
    "box-shadow:0 24px 60px rgba(0,0,0,.45);border-top:4px solid #D4712A;}",
    "#lsio-welcome::backdrop{background:rgba(10,14,11,.72);}",
    "#lsio-welcome .lsio-w-inner{padding:32px 30px 26px;font-family:Inter,Arial,sans-serif;}",
    "#lsio-welcome .lsio-w-eyebrow{font-family:Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;",
    "letter-spacing:.08em;font-size:.72rem;font-weight:700;color:#D4712A;margin:0 0 10px;}",
    "#lsio-welcome h2{font-family:Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;",
    "font-size:1.85rem;line-height:1.05;font-weight:700;margin:0 0 14px;color:#FAF8F5;letter-spacing:.01em;}",
    "#lsio-welcome p{margin:0 0 14px;font-size:.95rem;line-height:1.6;color:rgba(247,241,229,.85);}",
    "#lsio-welcome .lsio-w-note{font-size:.85rem;color:rgba(247,241,229,.62);border-left:2px solid rgba(212,113,42,.55);",
    "padding-left:12px;margin:18px 0 0;}",
    "#lsio-welcome .lsio-w-note a{color:#E08D4D;text-decoration:underline;text-underline-offset:2px;}",
    "#lsio-welcome .lsio-w-actions{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 0;}",
    "#lsio-welcome .lsio-w-btn{font-family:Antonio,'Arial Narrow',sans-serif;text-transform:uppercase;",
    "font-size:.82rem;font-weight:700;letter-spacing:.03em;padding:11px 20px;border-radius:4px;",
    "border:none;cursor:pointer;text-decoration:none;display:inline-block;}",
    "#lsio-welcome .lsio-w-primary{background:#D4712A;color:#fff;}",
    "#lsio-welcome .lsio-w-primary:hover{background:#B85C20;}",
    "#lsio-welcome .lsio-w-secondary{background:transparent;color:#F7F1E5;border:1px solid rgba(247,241,229,.3);}",
    "#lsio-welcome .lsio-w-secondary:hover{border-color:rgba(247,241,229,.6);}",
    "#lsio-welcome .lsio-w-close{position:absolute;top:10px;right:12px;background:none;border:none;",
    "color:rgba(247,241,229,.6);font-size:1.6rem;line-height:1;cursor:pointer;padding:6px 10px;}",
    "#lsio-welcome .lsio-w-close:hover{color:#fff;}",
    // The dialog takes focus on open only so the heading is announced; it is not
    // an interactive target, so it should not paint a ring. Its controls should.
    "#lsio-welcome:focus{outline:none;}",
    "#lsio-welcome .lsio-w-btn:focus-visible,#lsio-welcome .lsio-w-close:focus-visible",
    "{outline:2px solid #E08D4D;outline-offset:2px;}",
    "@media(prefers-reduced-motion:no-preference){",
    "#lsio-welcome[open]{animation:lsio-w-in .22s ease-out;}",
    "@keyframes lsio-w-in{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}}",
    "@media(max-width:520px){#lsio-welcome .lsio-w-inner{padding:26px 20px 22px;}",
    "#lsio-welcome h2{font-size:1.5rem;}",
    "#lsio-welcome .lsio-w-actions .lsio-w-btn{flex:1 1 100%;text-align:center;}}"
  ].join("");

  function mount() {
    if (document.getElementById("lsio-welcome")) return;

    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var dialog = document.createElement("dialog");
    dialog.id = "lsio-welcome";
    dialog.setAttribute("aria-labelledby", "lsio-welcome-title");
    // Without this, showModal() lands focus on the first focusable child — the
    // close button — which rings the dismiss control and reads it out before the
    // welcome itself. Focus the dialog so the heading is announced first.
    dialog.setAttribute("tabindex", "-1");
    dialog.innerHTML =
      '<button type="button" class="lsio-w-close" aria-label="Close welcome message">&times;</button>' +
      '<div class="lsio-w-inner">' +
        '<p class="lsio-w-eyebrow">First time here?</p>' +
        '<h2 id="lsio-welcome-title">Welcome. Glad you found us.</h2>' +
        "<p>This is where you get the digital side of your business sorted: your domain, a " +
          "proper email address, and a website that actually brings work in.</p>" +
        "<p>Websites start at $110, and the domain and logins end up in your name, not mine. " +
          "There are also over twenty free tools and guides if you would rather do it yourself.</p>" +
        '<div class="lsio-w-actions">' +
          '<a class="lsio-w-btn lsio-w-primary" href="/what-we-sort-out/">See what I sort out</a>' +
          '<button type="button" class="lsio-w-btn lsio-w-secondary" data-lsio-dismiss>I\'ll have a look around</button>' +
        "</div>" +
        '<p class="lsio-w-note">Fair warning: the site is still being polished, so some wording ' +
          'and layouts may shift. Spot something broken? <a href="' + WHATSAPP_URL + '" ' +
          'target="_blank" rel="noopener noreferrer">Tell Jake</a>.</p>' +
      "</div>";

    document.body.appendChild(dialog);

    function close() {
      store.markSeen();
      if (dialog.open) dialog.close();
    }

    dialog.querySelector(".lsio-w-close").addEventListener("click", close);
    dialog.querySelector("[data-lsio-dismiss]").addEventListener("click", close);
    // Following the primary link counts as being welcomed — don't greet them again.
    dialog.querySelector(".lsio-w-primary").addEventListener("click", function () { store.markSeen(); });
    // Esc fires 'close' without going through our handlers, so record it here too.
    dialog.addEventListener("close", function () { store.markSeen(); });
    // Click on the backdrop, which lands on the dialog element itself.
    dialog.addEventListener("click", function (event) { if (event.target === dialog) close(); });

    dialog.showModal();
    dialog.focus();
    if (window.trackEvent) window.trackEvent("welcome_modal_shown");
  }

  function start() {
    if (!shouldShow()) return;
    // A short beat after load so the page paints first and the modal reads as a
    // greeting rather than a wall thrown up before anything is visible.
    window.setTimeout(mount, 900);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
})();

(function () {
  "use strict";

  // Skip if already dismissed this session
  if (sessionStorage.getItem("lsio_launch_banner_dismissed") === "1") return;

  var WHATSAPP_URL =
    "https://wa.me/61472544399?text=" +
    encodeURIComponent(
      "Hi Jake, found something on the website that looks off - here's what happened: "
    );

  var style = document.createElement("style");
  style.textContent =
    "#lsio-launch-banner{position:relative;z-index:999;background:#111813;color:#faf8f5;" +
    "font-family:Inter,Arial,sans-serif;font-size:.85rem;line-height:1.4;" +
    "padding:12px 44px 12px 16px;display:flex;flex-wrap:wrap;gap:8px 16px;" +
    "align-items:center;justify-content:center;text-align:center;" +
    "border-bottom:2px solid #d4712a;}" +
    "#lsio-launch-banner strong{font-family:Antonio,\"Arial Narrow\",sans-serif;" +
    "text-transform:uppercase;color:#d4712a;letter-spacing:.02em;}" +
    "#lsio-launch-banner a.lsio-report{background:#d4712a;color:#fff;text-decoration:none;" +
    "font-family:Antonio,\"Arial Narrow\",sans-serif;text-transform:uppercase;" +
    "font-size:.78rem;font-weight:700;padding:6px 14px;border-radius:3px;" +
    "white-space:nowrap;display:inline-block;}" +
    "#lsio-launch-banner a.lsio-report:hover{background:#b85c20;}" +
    "#lsio-launch-banner .lsio-close{position:absolute;right:10px;top:50%;" +
    "transform:translateY(-50%);background:none;border:none;color:rgba(250,248,245,.7);" +
    "font-size:1.3rem;line-height:1;cursor:pointer;padding:6px 8px;}" +
    "#lsio-launch-banner .lsio-close:hover{color:#fff;}" +
    "@media(max-width:600px){#lsio-launch-banner{font-size:.78rem;padding:12px 40px 12px 12px;}}";
  document.head.appendChild(style);

  function mountBanner() {
    if (!document.body || document.getElementById("lsio-launch-banner")) return;

    var banner = document.createElement("div");
    banner.id = "lsio-launch-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Launch notice");
    banner.innerHTML =
      "<span><strong>Heads up:</strong> this site is new and still being polished. " +
      "Some wording, links or layouts may move while the last checks are finished. " +
      "Spot something broken?</span>" +
      '<a class="lsio-report" href="' +
      WHATSAPP_URL +
      '" rel="noopener noreferrer" target="_blank">Tell Jake &rarr;</a>' +
      '<button type="button" class="lsio-close" aria-label="Dismiss this message">&times;</button>';

    document.body.insertBefore(banner, document.body.firstChild);

    banner.querySelector(".lsio-close").addEventListener("click", function () {
      banner.remove();
      sessionStorage.setItem("lsio_launch_banner_dismissed", "1");
    });
  }

  if (document.body) {
    mountBanner();
  } else {
    document.addEventListener("DOMContentLoaded", mountBanner, { once: true });
  }
})();

(function () {
  if (window.LSIOMobileShell) return;
  window.LSIOMobileShell = true;

  const style = document.createElement("style");
  style.textContent = `
    .lsio-support-strip {
      background: #f5f0e6;
      border-top: 1px solid rgba(44,62,45,.16);
      border-bottom: 1px solid rgba(44,62,45,.16);
    }

    .lsio-support-strip__inner {
      width: min(1120px, calc(100% - 40px));
      margin: 0 auto;
      padding: 34px 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 24px;
      align-items: center;
    }

    .lsio-support-strip h2 {
      margin: 0 0 7px;
      color: #111813;
      font: 700 2.35rem/.96 Antonio, "Arial Narrow", sans-serif;
      text-transform: uppercase;
    }

    .lsio-support-strip p {
      max-width: 700px;
      margin: 0;
      color: #59615d;
      font: 400 .95rem/1.55 Inter, Arial, sans-serif;
    }

    .lsio-support-strip__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: flex-end;
    }

    .lsio-support-strip__actions a {
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 18px;
      border: 2px solid #d4712a;
      border-radius: 3px;
      color: #d4712a;
      font: 700 .9rem/1 Antonio, "Arial Narrow", sans-serif;
      text-decoration: none;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .lsio-support-strip__actions a:first-child {
      background: #d4712a;
      color: #faf8f5;
    }

    @media (max-width: 760px) {
      .lsio-support-strip__inner {
        width: min(100% - 32px, 1120px);
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 28px 0;
      }

      .lsio-support-strip h2 {
        font-size: 1.8rem;
      }

      .lsio-support-strip p {
        font-size: .88rem;
      }

      .lsio-support-strip__actions {
        display: grid;
        grid-template-columns: 1fr;
      }

      .lsio-support-strip__actions a {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  // business-in-a-box/ is deliberately excluded: it's a paid landing page with its
  // own Tally funnel, and this strip's free-review CTA competes with that funnel.
  const supportStripPaths = [
    "/free-tools/",
    "/what-we-sort-out/",
    "/implementation-support/",
    "/website-setup/",
    "/stop-doing-it-twice/",
    "/software-stack/",
    "/workflow-order/",
    "/business-sort-out-map/",
    "/automation-opportunity-finder/",
    "/customer-journey-check/",
    "/brand-colour-picker/",
    "/business-thinking/",
    "/learning-hub/",
    "/ai-guide/",
    "/google-workspace-for-sales/",
    "/people-hub/"
  ];

  const hasPageSupportPath = document.querySelector(".cta, .final-cta, .feedback-section, .result-connect, #cta-block, main a[href*='tally.so/r/Bz5xN7']");
  if (!hasPageSupportPath && !document.querySelector(".lsio-support-strip") && supportStripPaths.some((item) => path.startsWith(item))) {
    const supportStrip = document.createElement("section");
    supportStrip.className = "lsio-support-strip";
    supportStrip.setAttribute("aria-label", "Get practical support from Jake");
    supportStrip.innerHTML = `
      <div class="lsio-support-strip__inner">
        <div>
          <h2>Useful answer, but too much to build?</h2>
          <p>Send Jake the problem. He can help turn the tool output into a cleaner process, training guide, automation, website fix or setup that actually gets used.</p>
        </div>
        <div class="lsio-support-strip__actions">
          <a href="https://tally.so/r/Bz5xN7">Review My Business</a>
          <a href="https://wa.me/61472544399?text=Hi%20Jake%2C%20I%20used%20a%20Let%27s%20Sort%20It%20Out%20tool%20and%20want%20help%20turning%20it%20into%20action." rel="noopener noreferrer" target="_blank">Message Jake</a>
        </div>
      </div>`;
    const footer = document.querySelector("footer, .footer");
    if (footer?.parentNode) footer.parentNode.insertBefore(supportStrip, footer);
    else (document.querySelector("main") || document.body).appendChild(supportStrip);
  }
})();

(function(){
  // ---------------------------------------------------------------------------
  // THE ONLY LINE YOU NEED TO CHANGE.
  // Paste the GA4 Measurement ID from Google Analytics (Admin > Data streams >
  // your web stream). It looks like G-ABC1234XYZ. Until a real ID is set here,
  // every tracking call below stays a harmless no-op and nothing is sent.
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  // ---------------------------------------------------------------------------

  // Define the stubs FIRST, before the early return, so pages can always call
  // these without a typeof guard, and so member-tools.js can wrap
  // trackToolCompletion to sync saved results whether or not GA is switched on.
  window.trackToolCompletion = function(){};
  window.trackToolStart = function(){};
  window.trackEvent = function(){};

  var idLooksReal = /^G-[A-Z0-9]{6,}$/.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
  if (!idLooksReal) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);

  // Tool answers routinely contain business, customer and employee detail, so
  // only ever send the small labelled fields each caller passes deliberately —
  // never free-text input, and never anything identifying a person.
  function send(eventName, params){
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params || {});
  }

  // Fired when someone opens a tool and starts answering.
  // Example: window.trackToolStart('workflow_order');
  window.trackToolStart = function(toolName, extraParams){
    send('tool_start', Object.assign({ tool_name: toolName }, extraParams || {}));
  };

  // Fired when someone reaches a result/completion screen.
  // Example: window.trackToolCompletion('workflow_order', {priority: 'high'});
  window.trackToolCompletion = function(toolName, extraParams){
    send('tool_completion', Object.assign({ tool_name: toolName }, extraParams || {}));
  };

  // Generic escape hatch for CTA clicks and other one-off events.
  // Example: window.trackEvent('cta_click', {cta: 'review_my_business'});
  window.trackEvent = function(eventName, extraParams){
    send(eventName, extraParams);
  };
})();

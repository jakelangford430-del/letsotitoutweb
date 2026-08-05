(function(){
  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

  window.trackToolCompletion = function(){};

  if (!/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID) || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    return;
  }

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);

  // Call this from any tool once someone reaches a result/completion screen.
  // Example: window.trackToolCompletion('automation_opportunity_finder', {verdict: 'automate'});
  window.trackToolCompletion = function(toolName, extraParams){
    if (typeof window.gtag !== 'function') return;
    var params = Object.assign({ tool_name: toolName }, extraParams || {});
    window.gtag('event', 'tool_completion', params);
  };
})();

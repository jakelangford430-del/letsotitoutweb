(function(){
  // Pages can opt into absolute (site-root) links instead of computed relative
  // ones — used by 404.html, which can be served at any URL depth regardless
  // of where the physical file lives.
  const useAbsolute=document.documentElement.hasAttribute('data-absolute-nav');
  const depth=useAbsolute?0:window.location.pathname.replace(/\/index\.html$/,'/').split('/').filter(Boolean).length;
  // depth 0 is the site root itself — "../".repeat(0) is "", which would leave
  // hrefs like href="" (a broken/ambiguous self-link), so use "./" instead.
  const prefix=useAbsolute?'/':(depth===0?'./':'../'.repeat(depth));

  function buildNav(){
    // Every page's chrome funnels into one of three shapes: a bare <nav> as
    // the first thing in body (older Tailwind tool pages), a <header> with no
    // nested nav (guide-shell's app-header), or a <header> wrapping a nav
    // (the homepage, marketing pages, People Hub, account, 404). Replace
    // whichever one is found — this is now the single nav design for the
    // whole site, not just a fallback for pages that had nothing.
    const oldNav=document.querySelector('body.jj-site > nav:first-of-type, body > nav:first-of-type');
    let oldHeader=null;
    if(!oldNav){
      const header=document.querySelector('header');
      if(header && (header.classList.contains('app-header') || header.querySelector('nav'))) oldHeader=header;
    }
    const target=oldNav||oldHeader;

    const saveExitBtn=oldHeader?oldHeader.querySelector('#save-exit'):null;

    const nav=document.createElement('nav');nav.className='jj-tool-nav';nav.setAttribute('aria-label','Main navigation');
    nav.innerHTML='<div class="jj-tool-nav__inner"><a class="jj-tool-nav__brand" href="'+prefix+'">LET’S SORT IT OUT</a><button class="jj-tool-nav__menu" type="button" aria-expanded="false" aria-controls="jj-tool-links">Menu</button><div id="jj-tool-links" class="jj-tool-nav__links"><a href="'+prefix+'web-design/">Websites</a><a href="'+prefix+'business-email/">Business Email</a><a href="'+prefix+'domains-dns/">Domains &amp; DNS</a><a href="'+prefix+'resources/">Resources</a><a class="jj-tool-nav__cta" href="https://tally.so/r/Bz5xN7">Get My Setup Sorted</a></div></div>';
    if(target) target.replaceWith(nav);
    else document.body.prepend(nav);

    const links=nav.querySelector('.jj-tool-nav__links');
    if(saveExitBtn){
      saveExitBtn.classList.add('jj-tool-nav__save-exit');
      links.insertBefore(saveExitBtn,links.querySelector('.jj-tool-nav__cta'));
    }

    const button=nav.querySelector('.jj-tool-nav__menu');
    button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));links.classList.toggle('open',!open)});
    links.addEventListener('click',event=>{if(event.target.closest('a')){links.classList.remove('open');button.setAttribute('aria-expanded','false')}});
  }

  function buildFooter(){
    const oldFooter=document.querySelector('footer');
    const footer=document.createElement('footer');
    footer.className='jj-tool-footer';
    footer.innerHTML=
      '<div class="jj-tool-footer__inner">'+
        '<nav aria-label="Site links" class="jj-tool-footer__links">'+
          '<div class="jj-tool-footer__group"><h3>What I sort out</h3>'+
            '<a href="'+prefix+'web-design/">Website Design &amp; Build</a>'+
            '<a href="'+prefix+'business-email/">Business Email</a>'+
            '<a href="'+prefix+'domains-dns/">Domains, DNS &amp; Hosting</a>'+
            '<a href="'+prefix+'business-in-a-box/">Business in a Box</a>'+
            '<a href="'+prefix+'what-we-sort-out/">All Services</a>'+
          '</div>'+
          '<div class="jj-tool-footer__group"><h3>Free resources</h3>'+
            '<a href="'+prefix+'resources/">All Resources</a>'+
            '<a href="'+prefix+'free-tools/">Free Tools</a>'+
            '<a href="'+prefix+'people-hub/">People Hub</a>'+
            '<a href="'+prefix+'learning-hub/">Learning Hub</a>'+
            '<a href="'+prefix+'implementation-support/">Implementation Support</a>'+
          '</div>'+
          '<div class="jj-tool-footer__group"><h3>Get in touch</h3>'+
            '<a href="'+prefix+'#jake">Meet Jake</a>'+
            '<a href="'+prefix+'#faqs">FAQs</a>'+
            '<a href="https://tally.so/r/Bz5xN7">Get My Setup Sorted</a>'+
            '<a href="https://wa.me/61472544399?text=Hi%20Jake%2C%20I%20found%20Let%27s%20Sort%20It%20Out%20and%20would%20like%20to%20have%20a%20quick%20chat." rel="noopener noreferrer" target="_blank">Message Jake on WhatsApp</a>'+
          '</div>'+
        '</nav>'+
        '<div class="jj-tool-footer__bottom">'+
          '<a class="jj-tool-footer__brand" href="'+prefix+'">LET’S SORT IT OUT</a>'+
          '<span>© 2026 Let’s Sort It Out · <a href="'+prefix+'privacy/">Privacy Policy</a></span>'+
        '</div>'+
      '</div>';
    if(oldFooter) oldFooter.replaceWith(footer);
    else document.body.append(footer);
  }

  buildNav();

  // Some pages place this script before their <footer> in source order (it has
  // to run early, ahead of the page's own tool.js/guide.js), so the footer may
  // not exist in the DOM yet. Defer the swap to DOMContentLoaded, which fires
  // only once the whole document is parsed — otherwise this would find nothing,
  // append a new footer, and then the original one would still land right
  // after it once parsing continues.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildFooter);
  } else {
    buildFooter();
  }
})();

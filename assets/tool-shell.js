(function(){
  const oldNav=document.querySelector('body.jj-site > nav:first-of-type, body > nav:first-of-type');
  const oldHeader=!oldNav?document.querySelector('header.app-header'):null;
  const target=oldNav||oldHeader;
  if(!target)return;

  // Guide-shell tool pages live at different depths (top-level tools vs
  // people-hub/<tool>/), so the "../" links can't be hardcoded — work out
  // how many levels deep the current page is and build the prefix from that.
  const depth=Math.max(1,window.location.pathname.replace(/\/index\.html$/,'/').split('/').filter(Boolean).length);
  const prefix='../'.repeat(depth);

  const saveExitBtn=oldHeader?oldHeader.querySelector('#save-exit'):null;

  const nav=document.createElement('nav');nav.className='jj-tool-nav';nav.setAttribute('aria-label','Main navigation');
  nav.innerHTML='<div class="jj-tool-nav__inner"><a class="jj-tool-nav__brand" href="'+prefix+'">LET’S SORT IT OUT</a><button class="jj-tool-nav__menu" type="button" aria-expanded="false" aria-controls="jj-tool-links">Menu</button><div id="jj-tool-links" class="jj-tool-nav__links"><a href="'+prefix+'what-we-sort-out/">What We Sort Out</a><a href="'+prefix+'free-tools/">Free Tools</a><a href="'+prefix+'learning-hub/">Learning Hub</a><a href="'+prefix+'people-hub/">People Hub</a><a href="'+prefix+'implementation-support/">Implementation Support</a><a class="jj-tool-nav__cta" href="https://tally.so/r/Bz5xN7">Review My Business</a></div></div>';
  target.replaceWith(nav);

  const links=nav.querySelector('.jj-tool-nav__links');
  if(saveExitBtn){
    saveExitBtn.classList.add('jj-tool-nav__save-exit');
    links.insertBefore(saveExitBtn,links.querySelector('.jj-tool-nav__cta'));
  }

  const button=nav.querySelector('.jj-tool-nav__menu');
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));links.classList.toggle('open',!open)});
  links.addEventListener('click',event=>{if(event.target.closest('a')){links.classList.remove('open');button.setAttribute('aria-expanded','false')}});
})();

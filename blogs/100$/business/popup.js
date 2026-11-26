(function(){
  if(window.__zrPopupLoaded)return;
  window.__zrPopupLoaded=true;

  function closeBackdrop(node){if(node&&node.parentNode)node.parentNode.removeChild(node);}

  function showOriginalPopup(){
    if(document.querySelector('.zr-backdrop'))return;
    var b=document.createElement('div');
    b.className='zr-backdrop';
    b.innerHTML='<section class="zr-box" role="dialog" aria-modal="true" aria-labelledby="zr-popup-title"><button class="zr-close" type="button" aria-label="Close">×</button><p class="eyebrow">ZONGO RIDE · DRIVERS &amp; PASSENGERS</p><h2 id="zr-popup-title">Ready for your next ride opportunity?</h2><p>Drivers can create a profile and share the routes they offer. Passengers can explore ride options and make booking enquiries. Visit Zongo Ride to get started.</p><a class="zr-cta" href="https://zongo.shop/">Explore Zongo Ride</a><button class="zr-dismiss" type="button">Continue reading</button></section>';
    document.body.appendChild(b);
    b.querySelector('.zr-close').addEventListener('click',function(){closeBackdrop(b);});
    b.querySelector('.zr-dismiss').addEventListener('click',function(){closeBackdrop(b);});
    b.addEventListener('click',function(e){if(e.target===b)closeBackdrop(b);});
  }

  function showBusinessPopup(){
    if(document.querySelector('.zr-backdrop'))return;
    var b=document.createElement('div');
    b.className='zr-backdrop zr-business-backdrop';
    b.innerHTML='<section class="zr-box zr-business-box" role="dialog" aria-modal="true" aria-labelledby="zr-business-popup-title"><button class="zr-close" type="button" aria-label="Close">×</button><p class="eyebrow">GROW WITH ZONGO RIDE</p><h2 id="zr-business-popup-title">Turn a journey into a new opportunity</h2><p>Are you a driver looking for passengers, or a passenger looking for a ride? Explore Zongo Ride, create your profile and discover the options available in your area.</p><div class="zr-business-popup-actions"><a class="zr-cta" href="https://zongo.shop/">Join as a Driver</a><a class="zr-cta zr-cta-secondary" href="https://zongo.shop/">Find a Ride</a></div><button class="zr-dismiss" type="button">Keep reading</button></section>';
    document.body.appendChild(b);
    b.querySelector('.zr-close').addEventListener('click',function(){closeBackdrop(b);});
    b.querySelector('.zr-dismiss').addEventListener('click',function(){closeBackdrop(b);});
    b.addEventListener('click',function(e){if(e.target===b)closeBackdrop(b);});
  }

  function addOriginalFloating(){
    if(document.querySelector('.zr-floating-register'))return;
    var f=document.createElement('aside');
    f.className='zr-floating-register';
    f.setAttribute('aria-label','Register with Zongo Ride');
    f.innerHTML='<button type="button" class="zr-float-close" aria-label="Close message">×</button><strong>Join Zongo Ride</strong><p>Register and enjoy more opportunities as a driver or convenient ride options as a passenger.</p><a href="https://zongo.shop/" class="zr-float-link">Register / Explore Zongo Ride</a>';
    document.body.appendChild(f);
    f.querySelector('.zr-float-close').addEventListener('click',function(){f.remove();});
  }

  function addBusinessFloating(){
    if(document.querySelector('.zr-floating-business'))return;
    var f=document.createElement('aside');
    f.className='zr-floating-business';
    f.setAttribute('aria-label','Business and ride registration invitation');
    f.innerHTML='<button type="button" class="zr-business-float-close" aria-label="Close message">×</button><strong>More journeys. More possibilities.</strong><p>Drivers: register to offer rides. Passengers: explore ride options. Start with Zongo Ride today.</p><a href="https://zongo.shop/" class="zr-business-float-link">Get Started</a>';
    document.body.appendChild(f);
    f.querySelector('.zr-business-float-close').addEventListener('click',function(){f.remove();});
  }

  function start(){
    setTimeout(showOriginalPopup,1200);
    setInterval(showOriginalPopup,180000);
    setTimeout(showBusinessPopup,45000);
    setInterval(showBusinessPopup,480000);
    addOriginalFloating();
    addBusinessFloating();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
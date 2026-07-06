/* Chehak Khera — shared site behaviour
   particles · nav · scroll reveals · counters · tilt · spotlight */
(function(){
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- active nav link + mobile menu ---------- */
  var page = document.body.dataset.page;
  document.querySelectorAll('.nav-links a').forEach(function(a){
    if(a.dataset.page === page){ a.classList.add('active'); a.setAttribute('aria-current','page'); }
  });
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){ links.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
    });
  }

  /* ---------- scroll reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion){
    var ro = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -40px 0px'});
    revealEls.forEach(function(el){ ro.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- animated counters (data-count, data-decimals, data-prefix/suffix) ---------- */
  function animateCounter(el){
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    if(reduceMotion){ el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
    var dur = 1400, start = null;
    function step(ts){
      if(start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window){
    var co = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ animateCounter(en.target); co.unobserve(en.target); }
      });
    }, {threshold: 0.4});
    counters.forEach(function(el){ co.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- cursor spotlight on glass cards ---------- */
  if(window.matchMedia('(hover: hover)').matches){
    document.addEventListener('pointermove', function(e){
      var card = e.target.closest ? e.target.closest('.glass') : null;
      if(!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, {passive: true});
  }

  /* ---------- 3D tilt ---------- */
  if(!reduceMotion && window.matchMedia('(hover: hover)').matches){
    var MAX = 7; // degrees
    document.querySelectorAll('.tilt').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * MAX) + 'deg');
        card.style.setProperty('--rx', (-py * MAX) + 'deg');
      });
      card.addEventListener('pointerleave', function(){
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- particle network background ---------- */
  var canvas = document.getElementById('bg-particles');
  if(canvas && !reduceMotion){
    var ctx = canvas.getContext('2d');
    var nodes = [], raf = null, W = 0, H = 0;
    var COUNT = window.innerWidth < 720 ? 34 : 62;
    var LINK = 150;

    function resize(){
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed(){
      nodes = [];
      for(var i = 0; i < COUNT; i++){
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.5 + 0.7
        });
      }
    }
    function frame(){
      ctx.clearRect(0, 0, W, H);
      for(var i = 0; i < nodes.length; i++){
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if(n.x < -10) n.x = W + 10; if(n.x > W + 10) n.x = -10;
        if(n.y < -10) n.y = H + 10; if(n.y > H + 10) n.y = -10;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150,190,255,0.35)';
        ctx.fill();
      }
      for(var a = 0; a < nodes.length; a++){
        for(var b = a + 1; b < nodes.length; b++){
          var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if(d < LINK){
            ctx.beginPath();
            ctx.moveTo(nodes[a].x, nodes[a].y);
            ctx.lineTo(nodes[b].x, nodes[b].y);
            ctx.strokeStyle = 'rgba(120,160,255,' + (0.10 * (1 - d / LINK)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }
    function start(){ if(raf === null){ raf = requestAnimationFrame(frame); } }
    function stop(){ if(raf !== null){ cancelAnimationFrame(raf); raf = null; } }

    resize(); seed(); start();
    var rt;
    window.addEventListener('resize', function(){
      clearTimeout(rt);
      rt = setTimeout(function(){ resize(); seed(); }, 200);
    });
    document.addEventListener('visibilitychange', function(){
      if(document.hidden) stop(); else start();
    });
  }

  /* ---------- footer year ---------- */
  var yr = document.getElementById('year');
  if(yr) yr.textContent = new Date().getFullYear();

  /* ---------- navbar photo avatar (all pages) ----------
     Injects images/chehak.jpg into the brand mark when the file exists;
     silently keeps the CK monogram otherwise. */
  var brandMark = document.querySelector('.brand-mark');
  var intro = document.getElementById('intro');
  function mountBrandPhoto(deferReveal){
    if(!brandMark) return;
    var av = new Image();
    av.alt = '';
    av.className = 'brand-photo';
    av.onload = function(){
      if(deferReveal) brandMark.classList.add('photo-pending');
      brandMark.appendChild(av);
    };
    av.src = 'images/chehak.jpg';
  }

  /* ---------- intro splash (index only) ---------- */
  var introShown = false;
  try { introShown = sessionStorage.getItem('ck-intro') === '1'; } catch(e){}
  function killIntro(){
    if(intro && intro.parentNode){ intro.parentNode.removeChild(intro); }
    document.body.style.overflow = '';
  }
  if(intro && (reduceMotion || introShown)){
    killIntro();
    mountBrandPhoto(false);
  } else if(intro){
    document.body.style.overflow = 'hidden';
    mountBrandPhoto(true);
    var photo = intro.querySelector('.intro-photo');
    var photoImg = intro.querySelector('.intro-photo img');
    var finished = false;

    function revealAvatar(){
      if(brandMark) brandMark.classList.remove('photo-pending');
    }
    function finishIntro(instant){
      if(finished) return;
      finished = true;
      try { sessionStorage.setItem('ck-intro', '1'); } catch(e){}
      if(instant){ revealAvatar(); killIntro(); return; }
      // FLIP: fly the big photo into the navbar brand mark
      var target = brandMark ? brandMark.getBoundingClientRect() : null;
      if(target && photoImg && photoImg.naturalWidth){
        var r = photo.getBoundingClientRect();
        photo.style.cssText += 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;' +
          'width:' + r.width + 'px;height:' + r.height + 'px;margin:0;z-index:210;opacity:1;transform:none;';
        // force layout so the next styles transition
        void photo.offsetWidth;
        photo.style.transition = 'all 0.85s cubic-bezier(0.4,0,0.2,1)';
        photo.style.left = target.left + 'px';
        photo.style.top = target.top + 'px';
        photo.style.width = target.width + 'px';
        photo.style.height = target.height + 'px';
        photo.style.borderRadius = '10px';
        photo.style.borderWidth = '0px';
        photo.style.boxShadow = 'none';
        setTimeout(function(){
          revealAvatar();
          intro.classList.add('done');
          setTimeout(killIntro, 650);
        }, 870);
      } else {
        revealAvatar();
        intro.classList.add('done');
        setTimeout(killIntro, 650);
      }
    }

    // Only play when the photo actually loads; otherwise skip instantly.
    var playTimer = null;
    function startPlay(){
      intro.classList.add('play');
      playTimer = setTimeout(function(){ finishIntro(false); }, 2600);
    }
    function armIntroStart(){
      if(photoImg){
        if(photoImg.complete && photoImg.naturalWidth){ startPlay(); }
        else {
          photoImg.onload = startPlay;
          photoImg.onerror = function(){ finishIntro(true); };
          // safety net: never hold the page hostage
          setTimeout(function(){
            if(!finished && !(photoImg.complete && photoImg.naturalWidth)) finishIntro(true);
          }, 2500);
        }
      } else { finishIntro(true); }
    }
    // Opened in a background tab (e.g. ctrl+click from LinkedIn): hold the
    // intro until the tab is actually looked at, so the animation isn't
    // burned while hidden.
    if(document.visibilityState === 'hidden'){
      document.addEventListener('visibilitychange', function onVis(){
        if(document.visibilityState === 'visible' && !finished){
          document.removeEventListener('visibilitychange', onVis);
          armIntroStart();
        }
      });
    } else { armIntroStart(); }

    var skipBtn = intro.querySelector('.intro-skip');
    if(skipBtn) skipBtn.addEventListener('click', function(){ clearTimeout(playTimer); finishIntro(false); });
    intro.addEventListener('click', function(e){ if(e.target === intro){ clearTimeout(playTimer); finishIntro(false); } });
    document.addEventListener('keydown', function esc(e){
      if((e.key === 'Escape' || e.key === 'Enter') && !finished){ clearTimeout(playTimer); finishIntro(false); }
      if(finished) document.removeEventListener('keydown', esc);
    });
  } else {
    mountBrandPhoto(false);
  }

  /* ---------- hero photo card fallback (index) ---------- */
  var heroCard = document.getElementById('heroPhotoCard');
  if(heroCard){
    var heroImg = heroCard.querySelector('img');
    if(heroImg) heroImg.onerror = function(){ heroCard.style.display = 'none'; };
  }

  /* ---------- typewriter roles (index) ---------- */
  var typed = document.getElementById('typedRole');
  if(typed){
    var ROLES = ['equity research', 'volatility modelling', 'commodity markets', 'risk analysis', 'DCF valuation'];
    if(reduceMotion){
      typed.textContent = ROLES[0];
    } else {
      var ri = 0, ci = 0, deleting = false;
      (function tick(){
        var word = ROLES[ri];
        typed.textContent = word.slice(0, ci);
        var delay;
        if(!deleting){
          ci++;
          delay = 70;
          if(ci > word.length){ deleting = true; delay = 1600; }
        } else {
          ci--;
          delay = 38;
          if(ci === 0){ deleting = false; ri = (ri + 1) % ROLES.length; delay = 320; }
        }
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- live NSE market-hours chip (index) ---------- */
  var mktText = document.getElementById('mktText');
  var mktDot = document.getElementById('mktDot');
  if(mktText && mktDot){
    function pad(n){ return (n < 10 ? '0' : '') + n; }
    function updateMarket(){
      try {
        var parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
        }).formatToParts(new Date());
        var get = function(t){ var p = parts.find(function(x){ return x.type === t; }); return p ? p.value : ''; };
        var wd = get('weekday'), h = +get('hour') % 24, m = +get('minute');
        var mins = h * 60 + m;
        var OPEN = 9 * 60 + 15, CLOSE = 15 * 60 + 30;
        var weekend = (wd === 'Sat' || wd === 'Sun');
        if(!weekend && mins >= OPEN && mins < CLOSE){
          var left = CLOSE - mins;
          mktText.textContent = 'NSE LIVE · closes in ' + Math.floor(left / 60) + 'h ' + pad(left % 60) + 'm · open to opportunities';
          mktDot.classList.remove('closed');
        } else if(!weekend && mins < OPEN){
          var till = OPEN - mins;
          mktText.textContent = 'NSE opens in ' + Math.floor(till / 60) + 'h ' + pad(till % 60) + 'm · open to opportunities';
          mktDot.classList.add('closed');
        } else {
          var day = (wd === 'Fri' && mins >= CLOSE) || weekend ? 'Monday' : 'tomorrow';
          mktText.textContent = 'NSE reopens ' + day + ' 09:15 IST · open to opportunities';
          mktDot.classList.add('closed');
        }
      } catch(e){ /* keep default text */ }
    }
    updateMarket();
    setInterval(updateMarket, 60000);
  }

  /* ---------- magnetic hero CTAs ---------- */
  if(!reduceMotion && window.matchMedia('(hover: hover)').matches){
    document.querySelectorAll('.hero-ctas .btn').forEach(function(b){
      b.addEventListener('pointermove', function(e){
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12) + 'px,' +
          ((e.clientY - r.top - r.height / 2) * 0.18) + 'px)';
      });
      b.addEventListener('pointerleave', function(){ b.style.transform = ''; });
    });
  }
})();

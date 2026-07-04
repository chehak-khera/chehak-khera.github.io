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
})();

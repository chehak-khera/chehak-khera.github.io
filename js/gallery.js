/* Chehak Khera — achievements gallery
   Tiles are defined in ACHIEVEMENTS below. Each tile loads images/<id>.jpg;
   if that file doesn't exist it falls back to the shipped placeholder
   images/<id>.svg — so real photos can be dropped in with zero code changes. */
(function(){
  'use strict';

  var ACHIEVEMENTS = [
    {id:'achievement-01', cat:'academics',      size:'lg', title:'University Topper — B.Com (Hons.)', sub:'94.1% · GGSIP University · 2023'},
    {id:'achievement-02', cat:'certifications', size:'',   title:'NISM-XA Investment Adviser L1',     sub:'Certified · 2025'},
    {id:'achievement-03', cat:'leadership',     size:'',   title:'Alumni Meet — Lead Organizer',      sub:'100+ alumni & faculty · AJNIFM · 2025'},
    {id:'achievement-04', cat:'certifications', size:'wide', title:'Actuarial Exams CB1 · CB2 · CS1', sub:'Institute of Actuaries · 2023'},
    {id:'achievement-05', cat:'academics',      size:'',   title:'MBA in Finance',                    sub:'AJNIFM · 7.25/9.00 CGPA · 2024–26'},
    {id:'achievement-06', cat:'leadership',     size:'lg', title:'Cultural Events Lead',              sub:'300+ participants · 20-member team · 2025'},
    {id:'achievement-07', cat:'leadership',     size:'',   title:'Conference Coordinator',            sub:'200+ attendees · speakers & logistics · 2023'},
    {id:'achievement-08', cat:'academics',      size:'',   title:'Class XII — 90%',                   sub:'Banasthali Public School · CBSE · 2020'},
    {id:'achievement-09', cat:'academics',      size:'wide', title:'India VIX Research Project',      sub:'ARIMA & ANN forecasting · Python'}
  ];
  var CAT_LABEL = {academics:'Academics', certifications:'Certifications', leadership:'Leadership'};

  var grid = document.getElementById('gallery');
  if(!grid) return;

  /* ---------- build tiles ---------- */
  ACHIEVEMENTS.forEach(function(a, i){
    var tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'g-tile' + (a.size ? ' ' + a.size : '');
    tile.dataset.cat = a.cat;
    tile.dataset.index = i;
    tile.setAttribute('aria-label', 'Open: ' + a.title);

    var img = document.createElement('img');
    img.alt = a.title + ' — ' + a.sub;
    img.loading = 'lazy';
    img.src = 'images/' + a.id + '.jpg';
    img.onerror = function(){
      this.onerror = null;                       // don't loop if the svg is missing too
      this.src = 'images/' + a.id + '.svg';
    };

    var cat = document.createElement('span');
    cat.className = 'g-cat';
    cat.textContent = CAT_LABEL[a.cat];

    var cap = document.createElement('span');
    cap.className = 'g-cap';
    cap.innerHTML = '<span class="g-title"></span><span class="g-sub" style="display:block"></span>';
    cap.querySelector('.g-title').textContent = a.title;
    cap.querySelector('.g-sub').textContent = a.sub;

    tile.appendChild(img);
    tile.appendChild(cat);
    tile.appendChild(cap);
    tile.addEventListener('click', function(){ openLightbox(i); });
    grid.appendChild(tile);
  });

  /* ---------- filters ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      var f = btn.dataset.filter;
      grid.querySelectorAll('.g-tile').forEach(function(t){
        t.classList.toggle('hidden', f !== 'all' && t.dataset.cat !== f);
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('.lb-img-wrap img');
  var lbTitle = lb.querySelector('.lb-title');
  var lbSub = lb.querySelector('.lb-sub');
  var lbCount = lb.querySelector('.lb-count');
  var current = 0, lastFocus = null;

  function visibleIndices(){
    var out = [];
    grid.querySelectorAll('.g-tile').forEach(function(t){
      if(!t.classList.contains('hidden')) out.push(parseInt(t.dataset.index, 10));
    });
    return out;
  }
  function show(i){
    var a = ACHIEVEMENTS[i];
    current = i;
    lbImg.src = 'images/' + a.id + '.jpg';
    lbImg.onerror = function(){ this.onerror = null; this.src = 'images/' + a.id + '.svg'; };
    lbImg.alt = a.title + ' — ' + a.sub;
    lbTitle.textContent = a.title;
    lbSub.textContent = a.sub;
    var vis = visibleIndices();
    lbCount.textContent = (vis.indexOf(i) + 1) + ' / ' + vis.length;
  }
  function openLightbox(i){
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function closeLightbox(){
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if(lastFocus) lastFocus.focus();
  }
  function stepLightbox(dir){
    var vis = visibleIndices();
    if(!vis.length) return;
    var pos = vis.indexOf(current);
    var next = vis[(pos + dir + vis.length) % vis.length];
    show(next);
  }

  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-prev').addEventListener('click', function(){ stepLightbox(-1); });
  lb.querySelector('.lb-next').addEventListener('click', function(){ stepLightbox(1); });
  lb.addEventListener('click', function(e){ if(e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape') closeLightbox();
    else if(e.key === 'ArrowLeft') stepLightbox(-1);
    else if(e.key === 'ArrowRight') stepLightbox(1);
    else if(e.key === 'Tab'){
      // trap focus among the lightbox controls so it can't escape to hidden background content
      var focusable = lb.querySelectorAll('.lb-btn');
      if(!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      else if(!lb.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
    }
  });

  /* swipe */
  var touchX = null;
  lb.addEventListener('touchstart', function(e){ touchX = e.changedTouches[0].clientX; }, {passive: true});
  lb.addEventListener('touchend', function(e){
    if(touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if(Math.abs(dx) > 48) stepLightbox(dx > 0 ? -1 : 1);
    touchX = null;
  }, {passive: true});
})();

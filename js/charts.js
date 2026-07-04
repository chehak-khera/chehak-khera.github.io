/* Chehak Khera — projects page: VIX chart, DCF football field, retirement calculator.
   All chart data is illustrative — it exists to visualise the kind of work each
   project involved, not to reproduce the actual study outputs. */
(function(){
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent){
    var n = document.createElementNS(SVGNS, name);
    for(var k in attrs) n.setAttribute(k, attrs[k]);
    if(parent) parent.appendChild(n);
    return n;
  }
  function onVisible(target, cb){
    if(!('IntersectionObserver' in window) || reduceMotion){ cb(); return; }
    var o = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ cb(); o.disconnect(); } });
    }, {threshold: 0.35});
    o.observe(target);
  }

  /* ================= India VIX forecast chart ================= */
  var vixHost = document.getElementById('vix-chart');
  if(vixHost){
    var hist = [17.2,16.1,15.4,18.9,22.5,20.1,17.8,16.5,15.2,14.8,13.9,14.6,
                15.8,17.4,21.2,25.6,23.1,19.4,17.2,16.0,15.1,14.3,13.8,14.9,
                16.7,15.9,14.2,13.5,12.9,13.4];
    var fc    = [13.4,13.9,14.5,15.1,15.6,15.9,16.1];           // starts at last hist point
    var fcLo  = [13.4,13.0,13.2,13.4,13.5,13.5,13.4];
    var fcHi  = [13.4,14.8,15.9,16.9,17.7,18.3,18.8];

    var W = 680, H = 300, PL = 44, PR = 16, PT = 18, PB = 34;
    var total = hist.length + fc.length - 2;   // last plotted index (fc[0] overlaps hist's last point)
    var yMin = 10, yMax = 30;
    function X(i){ return PL + (W - PL - PR) * (i / total); }
    function Y(v){ return PT + (H - PT - PB) * (1 - (v - yMin) / (yMax - yMin)); }

    var svg = el('svg', {viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Line chart: India VIX history with a model forecast band rising gently from about 13 to 16.'}, vixHost);

    var defs = el('defs', {}, svg);
    var grad = el('linearGradient', {id: 'vix-area', x1: 0, y1: 0, x2: 0, y2: 1}, defs);
    el('stop', {offset: '0%', 'stop-color': '#2dd4bf', 'stop-opacity': 0.25}, grad);
    el('stop', {offset: '100%', 'stop-color': '#2dd4bf', 'stop-opacity': 0}, grad);

    // grid + y labels
    [10,15,20,25,30].forEach(function(v){
      el('line', {x1: PL, y1: Y(v), x2: W - PR, y2: Y(v), stroke: 'rgba(255,255,255,0.07)', 'stroke-width': 1}, svg);
      var t = el('text', {x: PL - 9, y: Y(v) + 4, 'text-anchor': 'end', fill: '#77839a',
        'font-size': 11, 'font-family': 'IBM Plex Mono, monospace'}, svg);
      t.textContent = v;
    });
    // x labels
    [['M−30', 0], ['M−20', 10], ['M−10', 20], ['Now', hist.length - 1], ['+6M', total]].forEach(function(lab){
      var t = el('text', {x: X(lab[1]), y: H - 12, 'text-anchor': 'middle', fill: '#77839a',
        'font-size': 11, 'font-family': 'IBM Plex Mono, monospace'}, svg);
      t.textContent = lab[0];
    });

    // "now" divider
    el('line', {x1: X(hist.length - 1), y1: PT, x2: X(hist.length - 1), y2: H - PB,
      stroke: 'rgba(232,193,90,0.4)', 'stroke-width': 1, 'stroke-dasharray': '3 4'}, svg);

    // forecast confidence band
    var bandPts = [];
    fcHi.forEach(function(v, i){ bandPts.push(X(hist.length - 1 + i) + ',' + Y(v)); });
    for(var i = fcLo.length - 1; i >= 0; i--){ bandPts.push(X(hist.length - 1 + i) + ',' + Y(fcLo[i])); }
    el('polygon', {points: bandPts.join(' '), fill: 'rgba(167,139,250,0.14)'}, svg);

    // history area + line
    var histPts = hist.map(function(v, i){ return X(i) + ',' + Y(v); });
    el('polygon', {points: histPts.join(' ') + ' ' + X(hist.length - 1) + ',' + Y(yMin) + ' ' + X(0) + ',' + Y(yMin),
      fill: 'url(#vix-area)'}, svg);
    var histLine = el('polyline', {points: histPts.join(' '), fill: 'none', stroke: '#2dd4bf',
      'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}, svg);

    // forecast line
    var fcPts = fc.map(function(v, i){ return X(hist.length - 1 + i) + ',' + Y(v); });
    var fcLine = el('polyline', {points: fcPts.join(' '), fill: 'none', stroke: '#a78bfa',
      'stroke-width': 2.4, 'stroke-dasharray': '6 6', 'stroke-linecap': 'round'}, svg);

    // end dot
    el('circle', {cx: X(hist.length - 1), cy: Y(hist[hist.length - 1]), r: 4.5,
      fill: '#05070d', stroke: '#2dd4bf', 'stroke-width': 2.5}, svg);

    // draw-in animation
    if(!reduceMotion){
      [histLine, fcLine].forEach(function(line){
        var len = line.getTotalLength();
        line.style.strokeDasharray = line === fcLine ? '6 6' : len;
        if(line !== fcLine){
          line.style.strokeDashoffset = len;
          line.style.transition = 'stroke-dashoffset 1.8s ease';
        } else {
          line.style.opacity = 0;
          line.style.transition = 'opacity 0.8s ease 1.4s';
        }
      });
      onVisible(vixHost, function(){
        histLine.style.strokeDashoffset = 0;
        fcLine.style.opacity = 1;
      });
    }
  }

  /* ================= Dabur DCF football field ================= */
  var ffHost = document.getElementById('ff-chart');
  if(ffHost){
    var rows = [
      {lbl: 'DCF (FCFF)',       lo: 495, hi: 610, color: '#2dd4bf'},
      {lbl: 'EV/EBITDA comps',  lo: 455, hi: 540, color: '#a78bfa'},
      {lbl: 'P/E comps',        lo: 470, hi: 560, color: '#a78bfa'},
      {lbl: '52-week range',    lo: 420, hi: 585, color: '#77839a'}
    ];
    var price = 505;
    var W2 = 680, ROW = 52, PT2 = 24, PB2 = 38, PL2 = 150, PR2 = 46;
    var H2 = PT2 + rows.length * ROW + PB2;
    var lo = 380, hi = 660;
    function FX(v){ return PL2 + (W2 - PL2 - PR2) * ((v - lo) / (hi - lo)); }

    var svg2 = el('svg', {viewBox: '0 0 ' + W2 + ' ' + H2, role: 'img',
      'aria-label': 'Football-field valuation chart: DCF and comparable ranges for Dabur India around a current price marker.'}, ffHost);

    [400,450,500,550,600,650].forEach(function(v){
      el('line', {x1: FX(v), y1: PT2 - 6, x2: FX(v), y2: H2 - PB2 + 4, stroke: 'rgba(255,255,255,0.06)'}, svg2);
      var t = el('text', {x: FX(v), y: H2 - 16, 'text-anchor': 'middle', fill: '#77839a',
        'font-size': 11, 'font-family': 'IBM Plex Mono, monospace'}, svg2);
      t.textContent = '₹' + v;
    });

    var bars = [];
    rows.forEach(function(r, i){
      var y = PT2 + i * ROW + ROW / 2;
      var t = el('text', {x: PL2 - 14, y: y + 4, 'text-anchor': 'end', fill: '#a3aec2', 'font-size': 12.5,
        'font-family': 'Inter, sans-serif'}, svg2);
      t.textContent = r.lbl;
      el('line', {x1: FX(lo), y1: y, x2: FX(hi), y2: y, stroke: 'rgba(255,255,255,0.06)', 'stroke-width': 1}, svg2);
      var bar = el('rect', {x: FX(r.lo), y: y - 8, width: Math.max(FX(r.hi) - FX(r.lo), 0), height: 16, rx: 8,
        fill: r.color, 'fill-opacity': 0.32, stroke: r.color, 'stroke-opacity': 0.9, 'stroke-width': 1.2}, svg2);
      bars.push(bar);
      [r.lo, r.hi].forEach(function(v, k){
        var vt = el('text', {x: FX(v) + (k ? 8 : -8), y: y + 4, 'text-anchor': k ? 'start' : 'end',
          fill: '#77839a', 'font-size': 10.5, 'font-family': 'IBM Plex Mono, monospace'}, svg2);
        vt.textContent = v;
      });
    });

    // current price marker
    el('line', {x1: FX(price), y1: PT2 - 8, x2: FX(price), y2: H2 - PB2 + 6,
      stroke: '#e8c15a', 'stroke-width': 1.6, 'stroke-dasharray': '4 4'}, svg2);
    var pt = el('text', {x: FX(price), y: PT2 - 12, 'text-anchor': 'middle', fill: '#e8c15a',
      'font-size': 11, 'font-family': 'IBM Plex Mono, monospace'}, svg2);
    pt.textContent = 'CMP ₹' + price;

    if(!reduceMotion){
      bars.forEach(function(b, i){
        var w = parseFloat(b.getAttribute('width')), x = parseFloat(b.getAttribute('x'));
        b.setAttribute('width', 0);
        b.setAttribute('x', x + w / 2);
        b.style.transition = 'all 0.9s cubic-bezier(0.22,1,0.36,1) ' + (i * 0.12) + 's';
        b.dataset.w = w; b.dataset.x = x;
      });
      onVisible(ffHost, function(){
        bars.forEach(function(b){
          b.setAttribute('width', b.dataset.w);
          b.setAttribute('x', b.dataset.x);
        });
      });
    }
  }

  /* ================= Retirement corpus calculator ================= */
  var calc = document.getElementById('calc');
  if(calc){
    var $ = function(id){ return document.getElementById(id); };
    var inputs = {
      age: $('in-age'), retire: $('in-retire'), sip: $('in-sip'),
      ret: $('in-return'), savings: $('in-savings')
    };
    var outCorpus = $('out-corpus'), outInvested = $('out-invested'), outGrowth = $('out-growth');

    function inr(v){
      if(v >= 1e7) return '₹' + (v / 1e7).toFixed(2) + ' Cr';
      if(v >= 1e5) return '₹' + (v / 1e5).toFixed(1) + ' L';
      return '₹' + Math.round(v).toLocaleString('en-IN');
    }
    function fill(input){
      var p = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--fill', p + '%');
    }
    function compute(){
      var age = +inputs.age.value, retire = +inputs.retire.value;
      if(retire <= age){ retire = age + 1; inputs.retire.value = retire; fill(inputs.retire); }
      var years = retire - age;
      var months = years * 12;
      var r = +inputs.ret.value / 100;
      var i = r / 12;
      var sip = +inputs.sip.value;
      var savings = +inputs.savings.value;

      var fvSavings = savings * Math.pow(1 + r, years);
      var fvSip = sip * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
      var corpus = fvSavings + fvSip;
      var invested = savings + sip * months;

      outCorpus.textContent = inr(corpus);
      outInvested.textContent = inr(invested);
      outGrowth.textContent = inr(corpus - invested);

      $('lab-age').textContent = age + ' yrs';
      $('lab-retire').textContent = retire + ' yrs';
      $('lab-sip').textContent = inr(sip) + '/mo';
      $('lab-return').textContent = (+inputs.ret.value).toFixed(1) + '% p.a.';
      $('lab-savings').textContent = inr(savings);
    }
    Object.keys(inputs).forEach(function(k){
      inputs[k].addEventListener('input', function(){ fill(inputs[k]); compute(); });
      fill(inputs[k]);
    });
    compute();
  }
})();

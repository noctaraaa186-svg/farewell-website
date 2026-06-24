// ===== LOVE LOADING PHASE =====
var loadingProgress = 0;
var loadingInterval;

function startLoveLoading() {
  var fill = document.getElementById('love-bar-fill');
  var pct  = document.getElementById('love-bar-pct');
  loadingInterval = setInterval(function() {
    var step = loadingProgress < 70 ? (1.8 + Math.random() * 1.4) : (0.6 + Math.random() * 0.8);
    loadingProgress = Math.min(100, loadingProgress + step);
    if (fill) fill.style.width = loadingProgress + '%';
    if (pct)  pct.textContent  = Math.floor(loadingProgress) + '%';
    if (loadingProgress >= 100) {
      clearInterval(loadingInterval);
      setTimeout(transitionToMain, 400);
    }
  }, 50);
}

function transitionToMain() {
  var splash = document.getElementById('love-splash');
  if (splash) splash.classList.add('exit');
  setTimeout(function() {
    if (splash) splash.style.display = 'none';
    
    // Tampilkan polaroid collage setelah loading selesai
    showPolaroidTransition(function() {
      var main = document.getElementById('loading-main');
      if (main) main.classList.add('visible');
      initSlider();
    });
  }, 700);
}

// ===== PHOTO SLIDER (HALAMAN 1) =====
var sliderCurrent = 0;
var sliderTotal = 6;
var sliderAutoInterval;

function sliderRender() {
  var track = document.getElementById('slider-track');
  var slides = track.querySelectorAll('.slide-item');
  var slideWidth = track.parentElement.offsetWidth;
  track.style.transform = 'translateX(' + (-sliderCurrent * slideWidth) + 'px)';
  slides.forEach(function(s, i) {
    s.classList.toggle('active-slide', i === sliderCurrent);
  });
  var dots = document.querySelectorAll('#slider-dots .slider-dot');
  dots.forEach(function(d, i) {
    d.classList.toggle('active', i === sliderCurrent);
  });
}

function sliderMove(dir) {
  sliderCurrent = (sliderCurrent + dir + sliderTotal) % sliderTotal;
  sliderRender();
  resetSliderAuto();
}

function resetSliderAuto() {
  clearInterval(sliderAutoInterval);
  sliderAutoInterval = setInterval(function() {
    sliderCurrent = (sliderCurrent + 1) % sliderTotal;
    sliderRender();
  }, 3000);
}

function initSlider() {
  var dotsWrap = document.getElementById('slider-dots');
  dotsWrap.innerHTML = '';
  for (var i = 0; i < sliderTotal; i++) {
    (function(idx) {
      var dot = document.createElement('div');
      dot.className = 'slider-dot' + (idx === 0 ? ' active' : '');
      dot.onclick = function() { sliderCurrent = idx; sliderRender(); resetSliderAuto(); };
      dotsWrap.appendChild(dot);
    })(i);
  }
  sliderRender();
  resetSliderAuto();

  var vp = document.querySelector('.slider-viewport');
  var startX = 0;
  vp.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, {passive:true});
  vp.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) sliderMove(diff > 0 ? 1 : -1);
  });
}

window.addEventListener('resize', sliderRender);

// ===================================================================
// TRANSISI 1 — POLAROID COLLAGE
// Muncul setelah loading selesai → sebelum slider foto
// ===================================================================
var polaroidShown = false;

var POLAROID_DATA = [
  { img: 'images/posda13.jpg', caption: '✦ memories', rot: -12,  x: -320, y: -140 },
  { img: 'images/posda14.jpg', caption: 'together',   rot:  0,  x:  0, y: -180 },
  { img: 'images/posda15.jpg', caption: 'POSDA 25',   rot: 12,  x: 320, y:  -140 },
  { img: 'images/posda16.jpg', caption: 'always',     rot:  -5, x:  -320, y:  120 },
  { img: 'images/posda17.jpg', caption: '♡',          rot: 0, x:  0, y: 100 },
  { img: 'images/posda18.jpg', caption: 'forever',    rot:  5,  x:   320, y:   140 }
];

function showPolaroidTransition(callback) {
  var overlay = document.getElementById('polaroid-transition');
  var collage  = document.getElementById('polaroid-collage');
  overlay.classList.add('active', 'fade-in');
  collage.innerHTML = '';

  var total = POLAROID_DATA.length;
  var finished = 0;

  POLAROID_DATA.forEach(function(data, i) {
    setTimeout(function() {
      var frame = document.createElement('div');
      frame.className = 'polaroid-frame';
      frame.style.setProperty('--rot-start', (data.rot * 1.8) + 'deg');
      frame.style.setProperty('--rot-end',   data.rot + 'deg');
      frame.style.left = 'calc(50% + ' + data.x + 'px)';
      frame.style.top  = 'calc(50% + ' + data.y + 'px)';
      frame.style.transform = 'translate(-50%,-50%)';
      frame.style.zIndex = i + 1;

      var imgWrap = document.createElement('div');
      imgWrap.className = 'polaroid-img-wrap';
      var img = document.createElement('img');
      img.src = data.img;
      img.onerror = function() {
        imgWrap.innerHTML = '<div class="polaroid-img-placeholder">🌸</div>';
      };
      imgWrap.appendChild(img);

      var cap = document.createElement('p');
      cap.className = 'polaroid-caption';
      cap.textContent = data.caption;

      frame.appendChild(imgWrap);
      frame.appendChild(cap);
      collage.appendChild(frame);

      requestAnimationFrame(function() {
        frame.classList.add('appear');
      });

      finished++;
    }, i * 600);
  });

  // Semua polaroid sudah muncul → tap to continue
  var skipBtn = overlay.querySelector('.polaroid-transition-skip');
  var finishTimer;

  var done = function() {
    clearTimeout(finishTimer);
    overlay.classList.add('fade-out');
    overlay.classList.remove('fade-in');
    setTimeout(function() {
      overlay.classList.remove('active', 'fade-out');
      if (callback) callback();
    }, 600);
  };

  // Auto-advance setelah semua muncul + 2s
  finishTimer = setTimeout(done, total * 600 + 2000);

  // Skip on tap
  skipBtn.onclick = done;
  overlay.onclick = done;
}

// ===================================================================
// LOADING → POLAROID → SLIDER
// ===================================================================
var loadingDone = false;

function proceedToEnvelope() {
  if (loadingDone) return;
  loadingDone = true;
  clearInterval(sliderAutoInterval);

  var loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.transition = 'opacity 0.5s ease';
  loadingScreen.style.opacity = '0';

  setTimeout(function() {
    loadingScreen.style.display = 'none';

    // Transisi 2: envelope rain sebelum envelope section
    showEnvelopeRainTransition(function() {
      var env = document.getElementById('envelope-section');
      if (env) {
        env.style.display = 'flex';
        env.style.opacity = '0';
        setTimeout(function() {
          env.style.transition = 'opacity 0.6s ease';
          env.style.opacity = '1';
        }, 30);
      }
    });
  }, 550);
}

// ===================================================================
// TRANSISI 2 — ENVELOPE RAIN
// ===================================================================
function makeRainEnvelopeSVG(scale, color1, color2) {
  scale = scale || 1;
  color1 = color1 || '#F2D0E2';
  color2 = color2 || '#E8C0D4';
  var w = Math.round(140 * scale), h = Math.round(92 * scale);
  return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 140 92" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="1" y="18" width="138" height="72" rx="6" fill="' + color1 + '" stroke="rgba(180,100,140,0.3)" stroke-width="1.5"/>' +
    '<polygon points="1,18 139,18 70,62" fill="' + color2 + '" opacity="0.9"/>' +
    '<polygon points="1,18 1,90 58,55" fill="rgba(220,160,190,0.5)"/>' +
    '<polygon points="139,18 139,90 82,55" fill="rgba(220,160,190,0.5)"/>' +
    '<polygon points="1,90 139,90 70,52" fill="rgba(232,192,212,0.7)"/>' +
    '<circle cx="70" cy="76" r="9" fill="rgba(196,96,127,0.85)"/>' +
    '<text x="70" y="80" text-anchor="middle" font-size="9" fill="rgba(255,235,245,0.9)">✦</text>' +
    '</svg>';
}

function showEnvelopeRainTransition(callback) {
  var overlay   = document.getElementById('envelope-rain-transition');
  var container = document.getElementById('env-rain-container');
  overlay.classList.add('active', 'fade-in');
  container.innerHTML = '';

  var count = 55;
  var palettes = [
    ['#FDEEF5','#F2D0E2'],['#F5D8E8','#EAC0D4'],['#FFE8F3','#F5C8DC'],
    ['#FFF0F8','#EDD0E4'],['#F8D8EE','#E8B8D4']
  ];
  var W = window.innerWidth, H = window.innerHeight;
  var cx = W / 2, cy = H / 2;

  var isMobile = W < 768;
  var scaleRange = isMobile ? 0.4 : 0.65;
  var scaleMax = isMobile ? 0.7 : 1.1;
  
  for (var i = 0; i < count; i++) {
    (function(idx) {
      var el = document.createElement('div');
      el.className = 'rain-envelope';
      var p = palettes[idx % palettes.length];
      var sc = scaleRange + Math.random() * scaleMax;
      el.innerHTML = makeRainEnvelopeSVG(sc, p[0], p[1]);

      var angle  = Math.random() * Math.PI * 2;
      var burst  = 100 + Math.random() * 160;
      var bx = Math.cos(angle) * burst * 0.35;
      var by = Math.sin(angle) * burst * 0.35;
      var ex = Math.cos(angle) * (W * 0.6 + Math.random() * W * 0.45) * (Math.random() < 0.5 ? 1 : -1);
      var ey = Math.sin(angle) * burst + H * (0.4 + Math.random() * 0.7);
      var rotStart = (Math.random() - 0.5) * 60;
      var rotEnd   = rotStart + (Math.random() - 0.5) * 540;
      var dur   = 1.5 + Math.random() * 1.6;
      var delay = Math.random() * 0.8;

      el.style.left = cx + 'px';
      el.style.top  = cy + 'px';
      el.style.setProperty('--bx', bx + 'px');
      el.style.setProperty('--by', by + 'px');
      el.style.setProperty('--ex', ex + 'px');
      el.style.setProperty('--ey', ey + 'px');
      el.style.setProperty('--env-rot-start', rotStart + 'deg');
      el.style.setProperty('--env-rot-end',   rotEnd + 'deg');
      el.style.animationDuration = dur + 's';
      el.style.animationDelay   = delay + 's';

      container.appendChild(el);
    })(i);
  }

  setTimeout(function() {
    overlay.classList.add('fade-out');
    overlay.classList.remove('fade-in');
    setTimeout(function() {
      overlay.classList.remove('active', 'fade-out');
      container.innerHTML = '';
      if (callback) callback();
    }, 600);
  }, 3400);
}

// ===================================================================
// ENVELOPE
// ===================================================================
var envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  var wrap = document.getElementById('envelope-wrap');
  wrap.classList.add('opened');
  wrap.onclick = null;

  var hint = document.getElementById('env-hint');
  if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; }

  var overlay = document.getElementById('env-blur-overlay');
  setTimeout(function() { overlay.classList.add('show'); }, 180);

  var letter = document.getElementById('env-letter');
  setTimeout(function() { letter.classList.add('show'); }, 320);

  var nextBtn = document.getElementById('env-next-btn');
  setTimeout(function() {
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
  }, 950);
}

// ===================================================================
// ENVELOPE → GIFT (Transisi 3: flower rain sebelum buket, tapi
// terlebih dulu tampilkan gift section langsung tanpa transisi)
// ===================================================================
function proceedToGift() {
  var env = document.getElementById('envelope-section');
  env.style.transition = 'opacity 0.6s ease';
  env.style.opacity = '0';
  setTimeout(function() {
    env.style.display = 'none';
    var gift = document.getElementById('gift-section');
    var giftBox  = document.getElementById('gift-box');
    var giftText = document.getElementById('gift-text-reveal');
    
    gift.style.display = 'flex';
    gift.style.opacity = '0';
    giftBox.style.opacity   = '0';
    giftBox.style.transform = 'translateY(36px) scale(0.88)';
    giftBox.style.transition = 'none';
    if (giftText) { giftText.classList.remove('show'); }

    // Koordinasi transisi dengan baik
    requestAnimationFrame(function() {
      gift.style.transition = 'opacity 0.5s ease';
      gift.style.opacity = '1';
      
      setTimeout(function() {
        giftBox.style.transition = 'opacity 0.6s cubic-bezier(0.34,1.4,0.64,1), transform 0.7s cubic-bezier(0.34,1.4,0.64,1)';
        giftBox.style.opacity   = '1';
        giftBox.style.transform = 'translateY(0) scale(1)';
        
        // Tampilkan label lebih cepat - saat box mulai terlihat
        setTimeout(function() {
          if (giftText) { giftText.classList.add('show'); }
        }, 300);
      }, 50);
    });
  }, 650);
}

// ===================================================================
// OPEN GIFT → FLOWER RAIN → BOUQUET
// ===================================================================
var giftOpened = false;

function openGift() {
  if (giftOpened) return;
  giftOpened = true;

  var box = document.getElementById('gift-box');
  var giftSection = document.getElementById('gift-section');
  box.classList.add('opened');
  spawnParticles();
  
  // Cegah interaksi lanjutan
  box.style.pointerEvents = 'none';
  giftSection.style.pointerEvents = 'none';

  setTimeout(function() {
    giftSection.style.transition = 'opacity 0.5s ease';
    giftSection.style.opacity = '0';
    setTimeout(function() {
      giftSection.style.display = 'none';

      // Transisi 3: flower rain sebelum buket
      showFlowerRainTransition(function() {
        showPage('page-bouquet');
      });
    }, 550);
  }, 900);
}

// ===================================================================
// TRANSISI 3 — FLOWER RAIN
// ===================================================================
function showFlowerRainTransition(callback) {
  var overlay   = document.getElementById('flower-rain-transition');
  var container = document.getElementById('flower-rain-container');
  overlay.classList.add('active', 'fade-in');
  container.innerHTML = '';

  var count = 70;
  var W = window.innerWidth, H = window.innerHeight;
  var cx = W / 2, cy = H / 2;

  for (var i = 0; i < count; i++) {
    (function(idx) {
      var el = document.createElement('div');
      el.className = 'rain-flower';

      var img = document.createElement('img');
      img.src = 'images/buket2.png';
      var isMobileFlower = W < 768;
      var baseSize = isMobileFlower ? (28 + Math.random() * 32) : (44 + Math.random() * 60);
      img.style.width  = baseSize + 'px';
      img.style.height = 'auto';
      el.appendChild(img);

      // Burst dari pusat — arah acak ke semua sudut + jatuh
      var angle  = Math.random() * Math.PI * 2;
      var burst  = 120 + Math.random() * 200;
      var bx = Math.cos(angle) * burst * 0.3;
      var by = Math.sin(angle) * burst * 0.3;
      var ex = Math.cos(angle) * (W * 0.65 + Math.random() * W * 0.4) * (Math.random() < 0.5 ? 1 : -1);
      var ey = Math.sin(angle) * burst + H * (0.4 + Math.random() * 0.7);
      var br  = (Math.random() - 0.5) * 180;
      var er  = (Math.random() - 0.5) * 900;
      var sc  = 0.75 + Math.random() * 0.65;
      var dur   = 1.5 + Math.random() * 1.6;
      var delay = Math.random() * 0.8;

      el.style.left = cx + 'px';
      el.style.top  = cy + 'px';
      el.style.setProperty('--bx', bx + 'px');
      el.style.setProperty('--by', by + 'px');
      el.style.setProperty('--ex', ex + 'px');
      el.style.setProperty('--ey', ey + 'px');
      el.style.setProperty('--br', br + 'deg');
      el.style.setProperty('--er', er + 'deg');
      el.style.setProperty('--fl-scale', sc);
      el.style.animationDuration = dur + 's';
      el.style.animationDelay   = delay + 's';

      container.appendChild(el);
    })(i);
  }

  setTimeout(function() {
    overlay.classList.add('fade-out');
    overlay.classList.remove('fade-in');
    setTimeout(function() {
      overlay.classList.remove('active', 'fade-out');
      container.innerHTML = '';
      if (callback) callback();
    }, 600);
  }, 3600);
}

// ===================================================================
// PAGE NAVIGATION
// ===================================================================
var currentPage = null;

function showPage(pageId) {
  if (currentPage) {
    var prev = document.getElementById(currentPage);
    if (prev) {
      prev.style.opacity = '0';
      setTimeout(function() {
        prev.classList.remove('active');
        prev.style.opacity = '';
      }, 400);
    }
  }
  setTimeout(function() {
    var next = document.getElementById(pageId);
    if (next) {
      next.classList.add('active');
      next.style.opacity = '0';
      window.scrollTo(0, 0);
      setTimeout(function() {
        next.style.transition = 'opacity 0.5s ease';
        next.style.opacity = '1';
      }, 20);
    }
    currentPage = pageId;

    // Inisialisasi khusus per halaman
    if (pageId === 'page-songs') initSongsPage();
  }, currentPage ? 420 : 0);
}

// ===================================================================
// TRANSISI 5 — VINYL INTRO (sebelum halaman lagu)
// ===================================================================
function triggerVinylTransition() {
  // Hide halaman bouquet terlebih dahulu agar tidak terlihat saat overlay fade-out
  var bouquet = document.getElementById('page-bouquet');
  if (bouquet) {
    bouquet.style.opacity = '0';
    bouquet.style.pointerEvents = 'none';
  }

  var overlay = document.getElementById('vinyl-transition');
  overlay.classList.add('active', 'fade-in');

  // Start floating hearts on vinyl canvas
  startVinylLoveCanvas();

  setTimeout(function() {
    overlay.classList.add('fade-out');
    overlay.classList.remove('fade-in');
    setTimeout(function() {
      overlay.classList.remove('active', 'fade-out');
      showPage('page-songs');
    }, 600);
  }, 3000);
}

function startVinylLoveCanvas() {
  var canvas = document.getElementById('vinyl-love-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var hearts = [];
  var colors = [
    'rgba(240,180,210,0.5)',
    'rgba(196,96,127,0.4)',
    'rgba(255,180,210,0.45)',
    'rgba(255,220,235,0.35)',
    'rgba(180,80,120,0.3)',
    'rgba(255,240,248,0.5)'
  ];

  for (var i = 0; i < 30; i++) {
    hearts.push({
      x:     Math.random() * canvas.width,
      y:     canvas.height + Math.random() * 100,
      size:  8 + Math.random() * 18,
      speed: 0.8 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * 0.7,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot:   (Math.random() - 0.5) * 0.4,
      rotV:  (Math.random() - 0.5) * 0.02,
      alpha: 0.4 + Math.random() * 0.5
    });
  }

  function drawH(ctx, x, y, s, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - s*0.3, x - s*0.5, y - s*0.8, x - s*0.5, y - s*0.5);
    ctx.bezierCurveTo(x - s*0.5, y - s*1.0, x, y - s*0.8, x, y - s*0.5);
    ctx.bezierCurveTo(x, y - s*0.8, x + s*0.5, y - s*1.0, x + s*0.5, y - s*0.5);
    ctx.bezierCurveTo(x + s*0.5, y - s*0.8, x, y - s*0.3, x, y);
    ctx.fill();
    ctx.restore();
  }

  var running = true;
  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(function(h) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      drawH(ctx, 0, 0, h.size, h.color, h.alpha);
      ctx.restore();
      h.y -= h.speed; h.x += h.drift; h.rot += h.rotV; h.alpha -= 0.001;
      if (h.y < -40 || h.alpha <= 0) {
        h.y = canvas.height + 20; h.x = Math.random() * canvas.width;
        h.alpha = 0.4 + Math.random() * 0.4;
        h.color = colors[Math.floor(Math.random() * colors.length)];
      }
    });
    requestAnimationFrame(loop);
  }
  loop();
  // Stop after transition ends
  setTimeout(function() { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }, 3800);
}

// ===================================================================
// SONGS — REVEAL ONE BY ONE
// ===================================================================
var songsCurrentIdx = 0;
var songsTotal = 5;

function initSongsPage() {
  songsCurrentIdx = 0;
  renderSong(0);
  updateSongsProgress();
}

function renderSong(idx) {
  var cards = document.querySelectorAll('.song-card-reveal');
  cards.forEach(function(c, i) {
    c.classList.toggle('active', i === idx);
  });
  updateSongsProgress();
}

function updateSongsProgress() {
  var el = document.getElementById('songs-progress');
  if (el) el.textContent = (songsCurrentIdx + 1) + ' / ' + songsTotal;
}

function songsNext() {
  if (songsCurrentIdx < songsTotal - 1) {
    songsCurrentIdx++;
    renderSong(songsCurrentIdx);
  } else {
    showPage('page-montage');
  }
}

function songsPrev() {
  if (songsCurrentIdx > 0) {
    songsCurrentIdx--;
    renderSong(songsCurrentIdx);
  }
}

// ===================================================================
// MESSAGES SLIDER
// ===================================================================
var msgCurrent = 0;
var msgTotal = 3;

function initMessages() {
  msgCurrent = 0;
  renderMsg(0);
}

function renderMsg(idx) {
  var slides = document.querySelectorAll('.message-slide');
  slides.forEach(function(s, i) { s.classList.toggle('active', i === idx); });
  var dots = document.querySelectorAll('.msg-dot');
  dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
}

function msgMove(dir) {
  msgCurrent = Math.max(0, Math.min(msgTotal - 1, msgCurrent + dir));
  renderMsg(msgCurrent);
}

function msgGoTo(idx) { msgCurrent = idx; renderMsg(idx); }

// ===================================================================
// PARTICLES
// ===================================================================
function spawnParticles() {
  var colors = ['#D98EA5','#C4607F','#E8B0C4','#F0C8D8','#9B7EC8','#B39DD4','#F0A882'];
  for (var i = 0; i < 22; i++) {
    (function(i) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'particle';
        var size = 6 + Math.random() * 10;
        p.style.cssText = [
          'width:' + size + 'px', 'height:' + size + 'px',
          'left:' + (30 + Math.random() * 40) + '%',
          'top:' + (40 + Math.random() * 20) + '%',
          'background:' + colors[Math.floor(Math.random() * colors.length)],
          'animation-delay:' + (Math.random() * 0.4) + 's',
          'animation-duration:' + (2 + Math.random() * 1.5) + 's'
        ].join(';');
        document.body.appendChild(p);
        setTimeout(function() { p.remove(); }, 3500);
      }, i * 50);
    })(i);
  }
}

// ===================================================================
// INIT
// ===================================================================
window.addEventListener('load', function() {
  spawnHeartCanvas();

  // Mulai loading bar dulu, polaroid akan ditampilkan setelah loading selesai
  startLoveLoading();
});

// ===== HEART CANVAS BACKGROUND =====
function spawnHeartCanvas() {
  var canvas = document.getElementById('love-bg-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  var hearts = [];
  var colors = [
    'rgba(240,196,212,0.55)','rgba(196,96,127,0.4)','rgba(255,180,210,0.45)',
    'rgba(255,220,235,0.35)','rgba(180,80,120,0.3)','rgba(255,240,248,0.5)'
  ];

  function Heart() { this.reset(); }
  Heart.prototype.reset = function() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + 30 + Math.random() * 80;
    this.size  = 10 + Math.random() * 22;
    this.speed = 0.5 + Math.random() * 1.2;
    this.drift = (Math.random() - 0.5) * 0.8;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.rot   = (Math.random() - 0.5) * 0.4;
    this.rotV  = (Math.random() - 0.5) * 0.015;
    this.alpha = 0.3 + Math.random() * 0.5;
  };

  for (var i = 0; i < 28; i++) {
    var h = new Heart();
    h.y = Math.random() * canvas.height;
    hearts.push(h);
  }

  function drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y-size*.3, x-size*.5, y-size*.8, x-size*.5, y-size*.5);
    ctx.bezierCurveTo(x-size*.5, y-size*1.0, x, y-size*.8, x, y-size*.5);
    ctx.bezierCurveTo(x, y-size*.8, x+size*.5, y-size*1.0, x+size*.5, y-size*.5);
    ctx.bezierCurveTo(x+size*.5, y-size*.8, x, y-size*.3, x, y);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(function(h) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      drawHeart(ctx, 0, 0, h.size, h.color, h.alpha);
      ctx.restore();
      h.y -= h.speed; h.x += h.drift; h.rot += h.rotV; h.alpha -= 0.0008;
      if (h.y < -40 || h.alpha <= 0) h.reset();
    });
    requestAnimationFrame(loop);
  }
  loop();
}

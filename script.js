// ===== LOVE LOADING PHASE =====
var loadingProgress = 0;
var loadingInterval;

function startLoveLoading() {
  var fill = document.getElementById('love-bar-fill');
  var pct  = document.getElementById('love-bar-pct');
  loadingInterval = setInterval(function() {
    // accelerate near end
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
  var main   = document.getElementById('loading-main');
  if (splash) splash.classList.add('exit');
  setTimeout(function() {
    if (splash) splash.style.display = 'none';
    if (main)   main.classList.add('visible');
    initSlider();
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
  vp.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, {passive: true});
  vp.addEventListener('touchend', function(e) {
    var diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) sliderMove(diff > 0 ? 1 : -1);
  });
}

window.addEventListener('resize', sliderRender);

// ===== LOADING SCREEN → ENVELOPE =====
var loadingDone = false;

function proceedToEnvelope() {
  if (loadingDone) return;
  loadingDone = true;
  clearInterval(sliderAutoInterval);

  var loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.opacity = '0';
  loadingScreen.style.visibility = 'hidden';

  setTimeout(function() {
    loadingScreen.style.display = 'none';
    var env = document.getElementById('envelope-section');
    if (env) { env.style.display = 'flex'; }
  }, 700);
}

// ===== ENVELOPE =====
var envelopeOpened = false;

function openEnvelope() {
  if (envelopeOpened) return;
  envelopeOpened = true;

  var wrap = document.getElementById('envelope-wrap');
  wrap.classList.add('opened');
  wrap.onclick = null;

  var hint = document.getElementById('env-hint');
  if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; }

  // Show blur overlay — fixed position, covers whole screen
  var overlay = document.getElementById('env-blur-overlay');
  setTimeout(function() {
    overlay.classList.add('show');
  }, 180);

  // Show the letter
  var letter = document.getElementById('env-letter');
  setTimeout(function() {
    letter.classList.add('show');
  }, 320);

  // Show next button — after letter is fully visible
  var nextBtn = document.getElementById('env-next-btn');
  setTimeout(function() {
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
  }, 950);
}

// ===== ENVELOPE → GIFT =====
function proceedToGift() {
  var env = document.getElementById('envelope-section');
  env.style.transition = 'opacity 0.6s ease';
  env.style.opacity = '0';
  setTimeout(function() {
    env.style.display = 'none';
    var gift = document.getElementById('gift-section');
    gift.style.display = 'flex';
    gift.classList.remove('hidden');
    gift.style.opacity = '0';
    setTimeout(function() {
      gift.style.transition = 'opacity 0.6s ease';
      gift.style.opacity = '1';
    }, 20);
  }, 650);
}

// ===== OPEN GIFT → BOUQUET PAGE =====
var giftOpened = false;

function openGift() {
  if (giftOpened) return;
  giftOpened = true;

  var box = document.getElementById('gift-box');
  var sparkles = document.getElementById('sparkles');
  box.classList.add('opened');
  sparkles.style.opacity = '1';

  spawnParticles();

  setTimeout(function() {
    document.getElementById('gift-section').style.transition = 'opacity 0.6s ease';
    document.getElementById('gift-section').style.opacity = '0';
    setTimeout(function() {
      document.getElementById('gift-section').style.display = 'none';
      showPage('page-bouquet');
    }, 650);
  }, 900);
}

// ===== PAGE NAVIGATION =====
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
  }, currentPage ? 420 : 0);
}

// ===== SONGS — REVEAL ONE BY ONE =====
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
    // All songs shown, go to montage
    showPage('page-montage');
  }
}

function songsPrev() {
  if (songsCurrentIdx > 0) {
    songsCurrentIdx--;
    renderSong(songsCurrentIdx);
  }
}

// ===== MESSAGES SLIDER =====
var msgCurrent = 0;
var msgTotal = 3;

function initMessages() {
  msgCurrent = 0;
  renderMsg(0);
}

function renderMsg(idx) {
  var slides = document.querySelectorAll('.message-slide');
  slides.forEach(function(s, i) {
    s.classList.toggle('active', i === idx);
  });
  var dots = document.querySelectorAll('.msg-dot');
  dots.forEach(function(d, i) {
    d.classList.toggle('active', i === idx);
  });
}

function msgMove(dir) {
  msgCurrent = Math.max(0, Math.min(msgTotal - 1, msgCurrent + dir));
  renderMsg(msgCurrent);
}

function msgGoTo(idx) {
  msgCurrent = idx;
  renderMsg(idx);
}

// ===== PARTICLES =====
function spawnParticles() {
  var colors = ['#D98EA5','#C4607F','#E8B0C4','#F0C8D8','#9B7EC8','#B39DD4','#F0A882'];
  for (var i = 0; i < 22; i++) {
    (function(i) {
      setTimeout(function() {
        var p = document.createElement('div');
        p.className = 'particle';
        var size = 6 + Math.random() * 10;
        p.style.cssText = [
          'width:' + size + 'px',
          'height:' + size + 'px',
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

// Kick off love loading on window load
window.addEventListener('load', function() {
  // Spawn floating hearts on canvas
  spawnHeartCanvas();
  startLoveLoading();
});

// ===== HEART CANVAS BACKGROUND =====
function spawnHeartCanvas() {
  var canvas = document.getElementById('love-bg-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var hearts = [];
  var colors = [
    'rgba(240,196,212,0.55)',
    'rgba(196,96,127,0.4)',
    'rgba(255,180,210,0.45)',
    'rgba(255,220,235,0.35)',
    'rgba(180,80,120,0.3)',
    'rgba(255,240,248,0.5)'
  ];

  function Heart() {
    this.reset();
  }
  Heart.prototype.reset = function() {
    this.x     = Math.random() * canvas.width;
    this.y     = canvas.height + 30 + Math.random() * 80;
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
    h.y = Math.random() * canvas.height; // scatter initial
    hearts.push(h);
  }

  function drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x, y - size * 0.3, x - size * 0.5, y - size * 0.8, x - size * 0.5, y - size * 0.5);
    ctx.bezierCurveTo(x - size * 0.5, y - size * 1.0, x, y - size * 0.8, x, y - size * 0.5);
    ctx.bezierCurveTo(x, y - size * 0.8, x + size * 0.5, y - size * 1.0, x + size * 0.5, y - size * 0.5);
    ctx.bezierCurveTo(x + size * 0.5, y - size * 0.8, x, y - size * 0.3, x, y);
    ctx.fill();
    ctx.restore();
  }

  var animId;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hearts.forEach(function(h) {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      drawHeart(ctx, 0, 0, h.size, h.color, h.alpha);
      ctx.restore();
      h.y    -= h.speed;
      h.x    += h.drift;
      h.rot  += h.rotV;
      h.alpha -= 0.0008;
      if (h.y < -40 || h.alpha <= 0) h.reset();
    });
    animId = requestAnimationFrame(loop);
  }
  loop();
}

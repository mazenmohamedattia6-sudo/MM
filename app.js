// ══════════ صورة القلب (بتترسم بالكود) ══════════
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function heartPath(c, cx, cy, s) {
  c.beginPath();
  c.moveTo(cx, cy + s * 0.45);
  c.bezierCurveTo(cx - s * 0.75, cy - s * 0.05, cx - s * 0.45, cy - s * 0.6, cx, cy - s * 0.2);
  c.bezierCurveTo(cx + s * 0.45, cy - s * 0.6, cx + s * 0.75, cy - s * 0.05, cx, cy + s * 0.45);
  c.closePath();
}

function drawHeartImage(S) {
  const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  const c = cv.getContext('2d'), rnd = mulberry32(2504);

  // خلفية
  const bg = c.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, '#1a1038'); bg.addColorStop(.55, '#2a1038'); bg.addColorStop(1, '#3a1030');
  c.fillStyle = bg; c.fillRect(0, 0, S, S);
  const glow = c.createRadialGradient(S / 2, S * .46, S * .05, S / 2, S * .46, S * .6);
  glow.addColorStop(0, 'rgba(240,170,196,.35)'); glow.addColorStop(1, 'rgba(240,170,196,0)');
  c.fillStyle = glow; c.fillRect(0, 0, S, S);

  // نجوم (بتخلي كل قطعة مميزة)
  for (let i = 0; i < 160; i++) {
    c.globalAlpha = .25 + rnd() * .6;
    c.fillStyle = rnd() > .5 ? '#fff6dc' : '#e8d08a';
    c.beginPath(); c.arc(rnd() * S, rnd() * S, .8 + rnd() * 2.2, 0, Math.PI * 2); c.fill();
  }
  // قلوب صغيرة
  for (let i = 0; i < 46; i++) {
    c.globalAlpha = .18 + rnd() * .3;
    c.fillStyle = ['#f0aac4', '#c9a84c', '#c96b8a', '#9aa8ff'][Math.floor(rnd() * 4)];
    heartPath(c, rnd() * S, rnd() * S, 12 + rnd() * 34); c.fill();
  }
  c.globalAlpha = 1;

  // القلب الكبير
  const cx = S / 2, cy = S * .48, s = S * .86;
  c.save();
  c.shadowColor = 'rgba(240,120,170,.8)'; c.shadowBlur = S * .06;
  const hg = c.createLinearGradient(cx - s * .5, cy - s * .4, cx + s * .5, cy + s * .5);
  hg.addColorStop(0, '#f6b8d0'); hg.addColorStop(.5, '#d0507c'); hg.addColorStop(1, '#8a2552');
  c.fillStyle = hg; heartPath(c, cx, cy, s); c.fill();
  c.restore();
  // لمعة
  c.save(); heartPath(c, cx, cy, s); c.clip();
  const hl = c.createRadialGradient(cx - s * .22, cy - s * .28, 0, cx - s * .22, cy - s * .28, s * .38);
  hl.addColorStop(0, 'rgba(255,255,255,.5)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = hl; c.fillRect(0, 0, S, S); c.restore();
  c.lineWidth = S * .008; c.strokeStyle = 'rgba(255,240,200,.75)'; heartPath(c, cx, cy, s); c.stroke();

  // الاسم
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl';
  c.shadowColor = 'rgba(80,10,40,.6)'; c.shadowBlur = S * .02;
  c.fillStyle = '#fff6dc'; c.font = `700 ${Math.round(S * .2)}px Amiri, "Noto Naskh Arabic", serif`;
  c.fillText('ملك', cx, cy - s * .04);
  c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,246,220,.9)'; c.font = `italic 400 ${Math.round(S * .06)}px "Playfair Display", Georgia, serif`;
  c.direction = 'ltr';
  c.fillText('Mazen  ♥  Malak', cx, cy + s * .17);

  // إطار
  c.lineWidth = S * .012; c.strokeStyle = 'rgba(232,208,138,.7)'; c.strokeRect(S * .012, S * .012, S * .976, S * .976);
  return cv;
}

// ══════════ منطق الأحجية (دوال صافية) ══════════
function isSolved(order) { return order.every((id, pos) => id === pos); }
function countCorrect(order) { return order.reduce((n, id, pos) => n + (id === pos ? 1 : 0), 0); }
function makeShuffle(total, rnd) {
  let order;
  do {
    order = Array.from({ length: total }, (_, i) => i);
    for (let i = total - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  } while (countCorrect(order) > 1);
  return order;
}
function pieceBg(id, n) {
  const col = id % n, row = Math.floor(id / n);
  return { size: (n * 100) + '% ' + (n * 100) + '%', pos: (col / (n - 1) * 100) + '% ' + (row / (n - 1) * 100) + '%' };
}

// ══════════ العناصر ══════════
const boardEl = document.getElementById('board');
const peekEl  = document.getElementById('peek');
const movesEl = document.getElementById('moves');
const timeEl  = document.getElementById('time');
const corrEl  = document.getElementById('correct');
const tipEl   = document.getElementById('tip');
const revealEl= document.getElementById('reveal');
const rvStat  = document.getElementById('rv-stat');
const lvlBtns = [...document.querySelectorAll ? document.querySelectorAll('.lvl') : []];
const levelsEl= document.getElementById('levels');

function load(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

// ══════════ الحالة ══════════
let imgURL = '';
let n = 4, total = 16;
let order = [];            // order[pos] = id القطعة اللي واقفة في المكان ده
let pieceEls = [];         // pieceEls[id] = عنصر القطعة
let selectedId = null;
let moves = 0, secs = 0, timer = null, started = false, won = false;
let best = load('malak_puzzle_best', {});

const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

// ══════════ صوت ══════════
let actx = null, soundOn = true;
function initAudio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } } if (actx && actx.state === 'suspended') actx.resume(); }
function blip(f, d, type, v, slide) {
  if (!soundOn || !actx) return;
  const t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || .1, t + .008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02);
}
const sndBtn = document.getElementById('snd');
sndBtn.addEventListener('click', () => { soundOn = !soundOn; sndBtn.textContent = soundOn ? '🔊' : '🔇'; sndBtn.classList.toggle('off', !soundOn); });

// ══════════ بناء اللوحة ══════════
function layout(el, pos) {
  el.style.left = ((pos % n) * 100 / n) + '%';
  el.style.top  = (Math.floor(pos / n) * 100 / n) + '%';
}

function newGame(size) {
  if (size) n = size;
  total = n * n;
  clearInterval(timer); timer = null;
  moves = 0; secs = 0; started = false; won = false; selectedId = null;
  movesEl.textContent = 0; timeEl.textContent = '0:00';
  revealEl.classList.remove('show');
  boardEl.classList.remove('solved');
  tipEl.textContent = 'دوسي على قطعة وبعدين على قطعة تانية يتبدلوا';

  order = makeShuffle(total, Math.random);
  boardEl.innerHTML = '';
  pieceEls = [];
  for (let id = 0; id < total; id++) {
    const p = document.createElement('div');
    p.className = 'piece';
    const bg = pieceBg(id, n);
    p.style.backgroundSize = bg.size; p.style.backgroundPosition = bg.pos;
    p.style.width = (100 / n) + '%'; p.style.height = (100 / n) + '%';
    p.addEventListener('click', () => tapPiece(id));
    pieceEls[id] = p; boardEl.appendChild(p);
  }
  order.forEach((id, pos) => layout(pieceEls[id], pos));
  refreshOk();
  lvlBtns.forEach(b => b.classList.toggle('active', Number(b.dataset.n) === n));
}

function refreshOk() {
  order.forEach((id, pos) => pieceEls[id].classList.toggle('ok', id === pos));
  corrEl.textContent = countCorrect(order) + '/' + total;
}

function tapPiece(id) {
  if (won) return;
  const pos = order.indexOf(id);
  if (order[pos] === pos) return;                       // القطعة دي في مكانها ومقفولة
  initAudio();

  if (selectedId === null) {
    selectedId = id; pieceEls[id].classList.add('sel'); blip(520, .08, 'sine', .08);
    return;
  }
  if (selectedId === id) {                              // دوسة تانية على نفس القطعة = إلغاء
    pieceEls[id].classList.remove('sel'); selectedId = null; return;
  }
  swap(selectedId, id);
}

function swap(a, b) {
  const pa = order.indexOf(a), pb = order.indexOf(b);
  const before = countCorrect(order);
  order[pa] = b; order[pb] = a;
  layout(pieceEls[a], pb); layout(pieceEls[b], pa);
  pieceEls[a].classList.remove('sel'); pieceEls[b].classList.remove('sel');
  selectedId = null;

  moves += 1; movesEl.textContent = moves;
  if (!started) { started = true; timer = setInterval(() => { secs += 1; timeEl.textContent = fmt(secs); }, 1000); }

  refreshOk();
  const after = countCorrect(order);
  [a, b].forEach(id => { if (order[id] === id || order.indexOf(id) === id) { pieceEls[id].classList.remove('just'); void pieceEls[id].offsetWidth; pieceEls[id].classList.add('just'); } });
  if (after > before) blip(700 + after * 12, .18, 'triangle', .12, 980); else blip(380, .1, 'sine', .08);
  if (isSolved(order)) win();
}

function win() {
  won = true; clearInterval(timer); timer = null;
  boardEl.classList.add('solved');
  tipEl.textContent = 'كمّلتِ القلب 💗';
  const key = String(n), prev = best[key];
  const better = !prev || secs < prev.time || (secs === prev.time && moves < prev.moves);
  if (better) { best[key] = { time: secs, moves }; save('malak_puzzle_best', best); }
  rvStat.textContent = `خلصتيها في ${moves} حركة و${fmt(secs)}` + (better && prev ? ' — أحسن من قبل! 🏆' : '') + (!prev ? ' — أول مرة! 🎉' : '');
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, .25, 'triangle', .13), i * 120));
  setTimeout(() => { revealEl.classList.add('show'); if (revealEl.scrollIntoView) revealEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 900);
  celebrate(30);
}

// ══════════ أزرار ══════════
function peek() {
  if (won) return;
  peekEl.classList.add('show');
  setTimeout(() => peekEl.classList.remove('show'), 2200);
}
document.getElementById('btn-hint').addEventListener('click', peek);
document.getElementById('btn-shuffle').addEventListener('click', () => newGame());
document.getElementById('btn-again').addEventListener('click', () => newGame());
if (document.querySelectorAll) document.querySelectorAll('.lvl').forEach(b => b.addEventListener('click', () => newGame(Number(b.dataset.n))));

// ══════════ تأثيرات + خلفية ══════════
function celebrate(k) {
  const s = ['💗', '🧩', '✨', '🌙', '💌'];
  for (let i = 0; i < k; i++) {
    setTimeout(() => {
      const h = document.createElement('div'); h.className = 'float-p';
      h.textContent = s[Math.floor(Math.random() * s.length)];
      h.style.cssText += `left:${10 + Math.random() * 80}vw;font-size:${.8 + Math.random() * 1.2}rem;animation-duration:${2.3 + Math.random() * 2.3}s;`;
      document.body.appendChild(h); setTimeout(() => h.remove(), 5400);
    }, i * 120);
  }
}
const bgC = document.getElementById('bg-canvas'), bgX = bgC.getContext('2d');
function resizeBg() { bgC.width = innerWidth; bgC.height = innerHeight; }
resizeBg(); window.addEventListener('resize', resizeBg);
const pts = Array.from({ length: 45 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * .7 + .15, vx: (Math.random() - .5) * .1, vy: (Math.random() - .5) * .1, a: Math.random(), da: (Math.random() - .5) * .005, c: Math.random() > .5 ? '201,168,76' : '201,107,138' }));
function drawBg() {
  const w = bgC.width, h = bgC.height; bgX.clearRect(0, 0, w, h);
  pts.forEach(p => {
    p.x += p.vx / w; p.y += p.vy / h; p.a += p.da;
    if (p.a < .05 || p.a > .82) p.da *= -1;
    if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0; if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
    const px = p.x * w, py = p.y * h, g = bgX.createRadialGradient(px, py, 0, px, py, p.r * 6);
    g.addColorStop(0, `rgba(${p.c},${p.a})`); g.addColorStop(1, `rgba(${p.c},0)`);
    bgX.beginPath(); bgX.arc(px, py, p.r * 6, 0, Math.PI * 2); bgX.fillStyle = g; bgX.fill();
  });
  requestAnimationFrame(drawBg);
}
drawBg();

// ══════════ تشغيل (بعد ما الخطوط تتحمل عشان اسم "ملك" يتكتب بالخط الصح) ══════════
let started_ = false;
function boot() {
  if (started_) return; started_ = true;
  const cv = drawHeartImage(720);
  imgURL = cv.toDataURL('image/jpeg', 0.92);
  const root = document.documentElement;
  if (root && root.style) root.style.setProperty('--img', 'url("' + imgURL + '")');
  newGame(4);
}
if (document.fonts && document.fonts.load) {
  Promise.race([
    Promise.all([document.fonts.load('700 120px Amiri', 'ملك'), document.fonts.load('italic 400 40px "Playfair Display"', 'Mazen')]),
    new Promise(r => setTimeout(r, 1800)),
  ]).then(boot, boot);
} else boot();

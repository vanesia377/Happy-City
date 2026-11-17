/* Chill City — game xây thành phố thư giãn. Không cần thư viện ngoài. */
'use strict';

// ───────────────────────── Dữ liệu ─────────────────────────
const WORLD = 24, START_LAND = 10, SAVE_KEY = 'chillcity.save.v1';
const MIN = 60, HOUR = 3600;

const DEFS = {
  // Nhà ở: earn = tiền thuê mỗi chu kỳ (time, giây)
  cottage:   { cat: 'house', name: 'Nhà gỗ', s: 1, lvl: 1, cost: 120, pop: 5, earn: 12, time: 45, steps: 2, top: 1.1,
               style: 'house', o: { wall: '#f6e2b3', roof: '#c8553d', h: .55, rh: .45, rt: 'gable' } },
  townhouse: { cat: 'house', name: 'Nhà phố', s: 1, lvl: 3, cost: 400, pop: 10, earn: 32, time: 2 * MIN, steps: 3, top: 1.6,
               style: 'house', o: { wall: '#cfe8ef', roof: '#3d5a80', h: 1.05, rh: .35, rt: 'pyr' } },
  family:    { cat: 'house', name: 'Nhà vườn', s: 2, lvl: 5, cost: 1200, pop: 25, earn: 95, time: 5 * MIN, steps: 4, top: 1.6,
               style: 'house', o: { wall: '#ffe5d9', roof: '#9d6b53', h: .8, rh: .7, rt: 'gable', inset: .25 } },
  villa:     { cat: 'house', name: 'Biệt thự', s: 2, lvl: 8, cost: 3500, pop: 40, earn: 270, time: 15 * MIN, steps: 5, top: 2,
               style: 'house', o: { wall: '#fff8e7', roof: '#2a9d8f', h: 1.2, rh: .6, rt: 'pyr', inset: .2 } },
  apartment: { cat: 'house', name: 'Chung cư', s: 2, lvl: 11, cost: 8000, pop: 90, earn: 620, time: 30 * MIN, steps: 6, top: 2.9,
               style: 'house', o: { wall: '#e0d4f7', roof: '#6d597a', h: 2.6, rh: .1, rt: 'flat', inset: .15 } },
  tower:     { cat: 'house', name: 'Cao ốc', s: 3, lvl: 15, cost: 25000, pop: 250, earn: 2100, time: HOUR, steps: 8, top: 4.6,
               style: 'house', o: { wall: '#bfe3f2', roof: '#457b9d', h: 4.2, rh: .12, rt: 'flat', inset: .3, win: '#fdfcdc' } },

  // Kinh doanh: cần "need" hàng hóa để mở bán, sau "time" giây thu "earn" xu
  banhmi:    { cat: 'shop', name: 'Xe bánh mì', s: 1, lvl: 1, cost: 200, need: 5, earn: 45, time: MIN, steps: 2, top: 1.3,
               style: 'shop', o: { wall: '#fff1c1', roof: '#e76f51', h: .6, sign: '🥖' } },
  cafe:      { cat: 'shop', name: 'Quán cà phê', s: 1, lvl: 2, cost: 500, need: 10, earn: 100, time: 3 * MIN, steps: 3, top: 1.5,
               style: 'shop', o: { wall: '#e6ccb2', roof: '#7f5539', h: .75, sign: '☕' } },
  grocery:   { cat: 'shop', name: 'Tạp hóa', s: 2, lvl: 4, cost: 1500, need: 25, earn: 290, time: 8 * MIN, steps: 4, top: 1.7,
               style: 'shop', o: { wall: '#d8f3dc', roof: '#40916c', h: .85, sign: '🛒' } },
  restaurant:{ cat: 'shop', name: 'Nhà hàng', s: 2, lvl: 7, cost: 4000, need: 50, earn: 680, time: 20 * MIN, steps: 5, top: 1.9,
               style: 'shop', o: { wall: '#ffd6d6', roof: '#c1121f', h: 1.05, sign: '🍜' } },
  cinema:    { cat: 'shop', name: 'Rạp phim', s: 2, lvl: 10, cost: 9000, need: 90, earn: 1450, time: 45 * MIN, steps: 6, top: 2.2,
               style: 'shop', o: { wall: '#3a3a5c', roof: '#f4d35e', h: 1.3, sign: '🎬', win: '#f4d35e' } },
  mall:      { cat: 'shop', name: 'Trung tâm mua sắm', s: 3, lvl: 14, cost: 30000, need: 200, earn: 4200, time: 2 * HOUR, steps: 8, top: 2.6,
               style: 'shop', o: { wall: '#f1faee', roof: '#e63946', h: 1.7, sign: '🛍️' } },

  // Hạ tầng
  road:      { cat: 'infra', name: 'Đường', s: 1, lvl: 1, cost: 10, steps: 0, top: .2, style: 'road' },
  farm:      { cat: 'infra', name: 'Ruộng', s: 2, lvl: 1, cost: 150, steps: 1, top: .6, style: 'farm' },
  warehouse: { cat: 'infra', name: 'Kho hàng', s: 2, lvl: 3, cost: 800, store: 150, steps: 4, top: 1.6,
               style: 'house', o: { wall: '#ced4da', roof: '#6c757d', h: .8, rh: .5, rt: 'gable', inset: .15, win: '#8d99ae', sign: '📦' } },

  // Trang trí: happy = điểm hạnh phúc, bonus = % thu nhập cho công trình trong bán kính range
  tree:      { cat: 'deco', name: 'Cây xanh', s: 1, lvl: 1, cost: 50, happy: 1, bonus: 2, range: 1, steps: 0, top: 1.2, style: 'tree' },
  flowers:   { cat: 'deco', name: 'Bồn hoa', s: 1, lvl: 1, cost: 80, happy: 1, bonus: 3, range: 1, steps: 0, top: .5, style: 'flowers' },
  lamp:      { cat: 'deco', name: 'Đèn đường', s: 1, lvl: 2, cost: 120, happy: 2, bonus: 2, range: 1, steps: 0, top: 1.4, style: 'lamp' },
  fountain:  { cat: 'deco', name: 'Đài phun nước', s: 1, lvl: 4, cost: 600, happy: 6, bonus: 5, range: 2, steps: 0, top: 1.1, style: 'fountain' },
  park:      { cat: 'deco', name: 'Công viên', s: 2, lvl: 6, cost: 2000, happy: 15, bonus: 6, range: 2, steps: 2, top: 1.3, style: 'park' },
  statue:    { cat: 'deco', name: 'Tượng đài', s: 1, lvl: 9, cost: 3000, happy: 12, bonus: 8, range: 2, steps: 2, top: 1.7, style: 'statue' },
  ferris:    { cat: 'deco', name: 'Vòng quay', s: 2, lvl: 12, cost: 12000, happy: 50, bonus: 10, range: 3, steps: 5, top: 3.2, style: 'ferris' },

  // Công cộng: nhiều điểm hạnh phúc
  school:    { cat: 'civic', name: 'Trường học', s: 2, lvl: 5, cost: 3000, happy: 30, steps: 5, top: 1.8,
               style: 'house', o: { wall: '#ffe8a3', roof: '#bc4749', h: 1, rh: .4, rt: 'pyr', inset: .12, sign: '🎓' } },
  fire:      { cat: 'civic', name: 'Trạm cứu hỏa', s: 2, lvl: 7, cost: 5000, happy: 40, steps: 5, top: 1.8,
               style: 'house', o: { wall: '#f28482', roof: '#84a59d', h: 1.1, rh: .1, rt: 'flat', inset: .15, sign: '🚒' } },
  hospital:  { cat: 'civic', name: 'Bệnh viện', s: 2, lvl: 9, cost: 9000, happy: 60, steps: 6, top: 2.4,
               style: 'house', o: { wall: '#ffffff', roof: '#90e0ef', h: 1.8, rh: .1, rt: 'flat', inset: .15, sign: '🏥' } },
  stadium:   { cat: 'civic', name: 'Sân vận động', s: 3, lvl: 13, cost: 28000, happy: 150, steps: 8, top: 1.4, style: 'stadium' },
};
Object.keys(DEFS).forEach(k => DEFS[k].id = k);

const CROPS = [
  { id: 'cai',    name: 'Rau cải',  icon: '🥬', lvl: 1, cost: 10,  time: 30,        yield: 8,   xp: 1 },
  { id: 'carot',  name: 'Cà rốt',   icon: '🥕', lvl: 2, cost: 25,  time: 2 * MIN,   yield: 20,  xp: 2 },
  { id: 'ngo',    name: 'Ngô',      icon: '🌽', lvl: 4, cost: 50,  time: 5 * MIN,   yield: 45,  xp: 4 },
  { id: 'dau',    name: 'Dâu tây',  icon: '🍓', lvl: 6, cost: 100, time: 15 * MIN,  yield: 100, xp: 8 },
  { id: 'dua',    name: 'Dưa hấu',  icon: '🍉', lvl: 9, cost: 200, time: HOUR,      yield: 240, xp: 16 },
];
const CROP = Object.fromEntries(CROPS.map(c => [c.id, c]));

const TABS = [['house', '🏠 Nhà ở'], ['shop', '🏪 Kinh doanh'], ['infra', '🛣️ Hạ tầng'], ['deco', '🌳 Trang trí'], ['civic', '🏛️ Công cộng']];

const B = id => s => s.stats.built[id] || 0;
const QUESTS = [
  { t: 'Những cư dân đầu tiên', d: 'Xây 2 Nhà gỗ', k: B('cottage'), n: 2, r: { coins: 150, xp: 10 } },
  { t: 'Mở đường', d: 'Xây 5 ô đường (nhà và cửa hàng phải kề đường)', k: B('road'), n: 5, r: { coins: 100, xp: 10 } },
  { t: 'Nông dân tập sự', d: 'Xây 1 ô ruộng', k: B('farm'), n: 1, r: { coins: 100, xp: 10 } },
  { t: 'Mùa vụ đầu', d: 'Thu hoạch nông sản 2 lần', k: s => s.stats.harvest, n: 2, r: { coins: 150, xp: 15 } },
  { t: 'Khai trương', d: 'Xây 1 Xe bánh mì', k: B('banhmi'), n: 1, r: { coins: 150, xp: 15 } },
  { t: 'Tiếp hàng', d: 'Cấp hàng cho cửa hàng 2 lần', k: s => s.stats.supply, n: 2, r: { coins: 200, xp: 20 } },
  { t: 'Thu thuế', d: 'Thu tiền nhà 5 lần', k: s => s.stats.rent, n: 5, r: { coins: 200, xp: 20 } },
  { t: 'Phố xanh', d: 'Đặt 4 vật trang trí', k: s => s.stats.deco, n: 4, r: { coins: 250, xp: 25, gems: 1 } },
  { t: 'Thị trấn nhỏ', d: 'Đạt dân số 30', k: () => population(), n: 30, r: { coins: 300, xp: 30 } },
  { t: 'Thị trưởng tập sự', d: 'Đạt cấp 3', k: s => s.level, n: 3, r: { coins: 400, gems: 1 } },
  { t: 'Vươn rộng', d: 'Mở rộng đất 1 lần', k: s => s.stats.expand, n: 1, r: { coins: 500, xp: 50 } },
  { t: 'Kho bãi', d: 'Xây 1 Kho hàng', k: B('warehouse'), n: 1, r: { coins: 400, xp: 40 } },
  { t: 'Cà phê sáng', d: 'Xây 1 Quán cà phê', k: B('cafe'), n: 1, r: { coins: 400, xp: 40 } },
  { t: 'Buôn may bán đắt', d: 'Thu tiền cửa hàng 10 lần', k: s => s.stats.sales, n: 10, r: { coins: 600, xp: 60, gems: 1 } },
  { t: 'Đông vui', d: 'Đạt dân số 100', k: () => population(), n: 100, r: { coins: 800, xp: 80 } },
  { t: 'Trăm năm trồng người', d: 'Xây 1 Trường học', k: B('school'), n: 1, r: { coins: 1000, xp: 100, gems: 2 } },
  { t: 'Lá phổi xanh', d: 'Xây 1 Công viên', k: B('park'), n: 1, r: { coins: 1000, xp: 100 } },
  { t: 'Thành phố trẻ', d: 'Đạt dân số 250', k: () => population(), n: 250, r: { coins: 2000, xp: 200, gems: 2 } },
  { t: 'Bội thu', d: 'Thu hoạch nông sản 40 lần', k: s => s.stats.harvest, n: 40, r: { coins: 2000, xp: 200 } },
  { t: 'Đất rộng', d: 'Mở rộng đất 3 lần', k: s => s.stats.expand, n: 3, r: { coins: 3000, xp: 300, gems: 2 } },
  { t: 'Thị trưởng kỳ cựu', d: 'Đạt cấp 10', k: s => s.level, n: 10, r: { coins: 5000, gems: 3 } },
  { t: 'Đô thị sầm uất', d: 'Đạt dân số 600', k: () => population(), n: 600, r: { coins: 8000, xp: 500, gems: 3 } },
  { t: 'Thiên đường mua sắm', d: 'Xây 1 Trung tâm mua sắm', k: B('mall'), n: 1, r: { coins: 10000, xp: 800, gems: 5 } },
  { t: 'Chill City huyền thoại', d: 'Đạt dân số 1500', k: () => population(), n: 1500, r: { coins: 30000, xp: 2000, gems: 10 } },
];

// ───────────────────────── Trạng thái ─────────────────────────
let S;
let grid = [];
const $ = id => document.getElementById(id);
const fmt = n => Math.floor(n).toLocaleString('vi-VN');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function fmtTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  if (sec >= HOUR) return Math.floor(sec / HOUR) + 'g ' + String(Math.floor(sec % HOUR / MIN)).padStart(2, '0') + 'p';
  if (sec >= MIN) return Math.floor(sec / MIN) + 'p ' + String(sec % MIN).padStart(2, '0') + 's';
  return sec + 's';
}

function newState() {
  const s = {
    v: 1, coins: 1000, gems: 10, energy: 26, energyAt: Date.now(), xp: 0, level: 1, goods: 20, land: START_LAND,
    buildings: [], nextId: 1, quest: 0, mute: false,
    stats: { built: {}, rent: 0, sales: 0, harvest: 0, supply: 0, deco: 0, expand: 0 },
    daily: { last: '', streak: 0 },
  };
  const o = (WORLD - START_LAND) / 2;
  const add = (type, x, y) => s.buildings.push({ id: s.nextId++, type, x: o + x, y: o + y, done: true, steps: 0, readyAt: Date.now() + 15000 });
  for (let x = 1; x < 9; x++) add('road', x, 5);
  add('cottage', 3, 4); add('tree', 2, 4); add('tree', 6, 6); add('flowers', 4, 4);
  return s;
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 1 && Array.isArray(s.buildings)) return s; }
  } catch (e) { /* bỏ qua, tạo game mới */ }
  return newState();
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* không lưu được */ } }

function rebuildGrid() {
  grid = Array.from({ length: WORLD }, () => new Array(WORLD).fill(null));
  for (const b of S.buildings) {
    if (b === moving) continue;
    const s = DEFS[b.type].s;
    for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) grid[b.x + i][b.y + j] = b;
  }
}
const landOff = () => (WORLD - S.land) / 2;
const unlocked = (x, y) => { const o = landOff(); return x >= o && y >= o && x < o + S.land && y < o + S.land; };
function canPlace(x, y, s) {
  for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
    const cx = x + i, cy = y + j;
    if (cx < 0 || cy < 0 || cx >= WORLD || cy >= WORLD || !unlocked(cx, cy) || grid[cx][cy]) return false;
  }
  return true;
}
function hasRoad(b) {
  const s = DEFS[b.type].s;
  for (let i = 0; i < s; i++) {
    for (const [x, y] of [[b.x + i, b.y - 1], [b.x + i, b.y + s], [b.x - 1, b.y + i], [b.x + s, b.y + i]]) {
      const g = x >= 0 && y >= 0 && x < WORLD && y < WORLD && grid[x][y];
      if (g && g.type === 'road') return true;
    }
  }
  return false;
}
function decoBonus(b) {
  const s = DEFS[b.type].s; let sum = 0;
  for (const d of S.buildings) {
    const dd = DEFS[d.type];
    if (!dd.bonus || !d.done || d === b) continue;
    const gx = Math.max(d.x - (b.x + s - 1), b.x - (d.x + dd.s - 1), 0);
    const gy = Math.max(d.y - (b.y + s - 1), b.y - (d.y + dd.s - 1), 0);
    if (Math.max(gx, gy) <= dd.range) sum += dd.bonus;
  }
  return Math.min(50, sum);
}
function population() { let p = 0; for (const b of S.buildings) if (b.done) p += DEFS[b.type].pop || 0; return p; }
function happyPoints() { let p = 0; for (const b of S.buildings) if (b.done) p += DEFS[b.type].happy || 0; return p; }
function happiness() {
  const pop = population();
  if (!pop) return 100;
  return Math.round(clamp(50 + 50 * happyPoints() / (pop * 0.3), 50, 130));
}
function storage() { let c = 100; for (const b of S.buildings) if (b.done) c += DEFS[b.type].store || 0; return c; }
const maxEnergy = () => Math.min(60, 25 + S.level);
const xpNeed = l => Math.round(30 * Math.pow(l, 1.8) + 20 * l);
const ENERGY_SEC = 20;
const mult = b => happiness() / 100 * (1 + decoBonus(b) / 100);

// ───────────────────────── Âm thanh ─────────────────────────
let actx;
function beep(f, d = .08, type = 'sine', vol = .06) {
  if (S.mute) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = f; g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + d);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + d);
  } catch (e) { /* không có âm thanh */ }
}
const sfx = {
  coin: () => { beep(880, .07); setTimeout(() => beep(1320, .1), 60); },
  pop: () => beep(520, .06, 'triangle'),
  build: () => beep(180, .07, 'square', .04),
  bad: () => beep(140, .15, 'sawtooth', .04),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .15), i * 110)),
};

// ───────────────────────── Kinh tế & hành động ─────────────────────────
const floats = [];
function floatAt(b, text, color = '#fff') {
  const s = DEFS[b.type].s, t = DEFS[b.type].top;
  floats.push({ x: (b.x - b.y) * TW, y: (b.x + b.y + s) * TH - t * ZH, text, color, t0: performance.now() });
}
function toast(msg) {
  const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg;
  $('toasts').appendChild(el); setTimeout(() => el.remove(), 2700);
  while ($('toasts').children.length > 3) $('toasts').firstChild.remove();
}
function addXp(n) {
  S.xp += n;
  let up = false;
  while (S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; up = true; }
  if (up) {
    const bonus = 100 * S.level;
    S.coins += bonus; S.gems += 1; S.energy = Math.max(S.energy, maxEnergy());
    sfx.win();
    const unlock = Object.values(DEFS).filter(d => d.lvl === S.level).map(d => d.name)
      .concat(CROPS.filter(c => c.lvl === S.level).map(c => c.name));
    openModal('Lên cấp!', `<div class="big">🎉</div><h2>Cấp ${S.level}</h2>
      <p>Thưởng: 🪙 ${fmt(bonus)} · 💎 1 · ⚡ đầy năng lượng</p>
      ${unlock.length ? `<p>Mở khóa: <b>${unlock.join(', ')}</b></p>` : ''}
      <button class="btn" data-close>Tuyệt!</button>`, true);
  }
}
function tickEnergy() {
  const now = Date.now(), max = maxEnergy();
  if (S.energy >= max) { S.energyAt = now; return; }
  const n = Math.floor((now - S.energyAt) / (ENERGY_SEC * 1000));
  if (n > 0) { S.energy = Math.min(max, S.energy + n); S.energyAt += n * ENERGY_SEC * 1000; }
}
function useEnergy() {
  if (S.energy > 0) { S.energy--; return true; }
  sfx.bad(); askEnergy(); return false;
}
function askEnergy() {
  openModal('Hết năng lượng', `<div class="big">⚡</div>
    <p>Năng lượng hồi 1 điểm mỗi ${ENERGY_SEC} giây và đầy lại khi lên cấp.</p>
    <button class="btn" data-do="refill" ${S.gems < 3 ? 'disabled' : ''}>Nạp đầy (💎 3)</button>
    <button class="btn alt" data-close>Chờ hồi</button>`, true);
}

function place(type, x, y) {
  const d = DEFS[type];
  if (!canPlace(x, y, d.s)) { sfx.bad(); return false; }
  if (S.coins < d.cost) { sfx.bad(); toast('Không đủ xu!'); return false; }
  S.coins -= d.cost;
  const b = { id: S.nextId++, type, x, y, done: d.steps === 0, steps: 0, readyAt: 0 };
  S.buildings.push(b);
  rebuildGrid();
  if (b.done) finish(b, true); else sfx.build();
  floatAt(b, '-' + fmt(d.cost) + '🪙', '#ffd6d6');
  return true;
}
function finish(b, quiet) {
  const d = DEFS[b.type];
  b.done = true;
  if (d.cat === 'house') b.readyAt = Date.now() + d.time * 1000;
  S.stats.built[b.type] = (S.stats.built[b.type] || 0) + 1;
  if (d.cat === 'deco') S.stats.deco++;
  if (!quiet) { floatAt(b, 'Hoàn thành!', '#d8f3dc'); }
  sfx.pop();
  addXp(Math.max(1, Math.round(d.cost / 25)));
}

/** Thực hiện hành động chính trên công trình. Trả về true nếu đã xử lý. */
function act(b) {
  const d = DEFS[b.type], now = Date.now();
  if (!b.done) {
    if (!useEnergy()) return true;
    b.steps++; sfx.build();
    if (b.steps >= d.steps) finish(b); else floatAt(b, '🔨 ' + b.steps + '/' + d.steps);
    return true;
  }
  if (d.cat === 'house') {
    if (now < b.readyAt) return false;
    if (!hasRoad(b)) { toast('Nhà cần nằm kề đường mới thu được tiền'); sfx.bad(); return true; }
    if (!useEnergy()) return true;
    const amt = Math.round(d.earn * mult(b));
    S.coins += amt; S.stats.rent++; b.readyAt = now + d.time * 1000;
    floatAt(b, '+' + fmt(amt) + '🪙', '#fff3b0'); sfx.coin(); addXp(Math.max(1, Math.round(d.earn / 20)));
    return true;
  }
  if (d.cat === 'shop') {
    if (!hasRoad(b)) { toast('Cửa hàng cần nằm kề đường'); sfx.bad(); return true; }
    if (!b.supplied) {
      if (S.goods < d.need) { toast(`Cần ${d.need} 📦 hàng hóa — hãy trồng trọt thêm!`); sfx.bad(); return true; }
      if (!useEnergy()) return true;
      S.goods -= d.need; b.supplied = true; b.readyAt = now + d.time * 1000; S.stats.supply++;
      floatAt(b, '-' + d.need + '📦'); sfx.pop();
      return true;
    }
    if (now < b.readyAt) return false;
    if (!useEnergy()) return true;
    const amt = Math.round(d.earn * mult(b));
    S.coins += amt; S.stats.sales++; b.supplied = false;
    floatAt(b, '+' + fmt(amt) + '🪙', '#fff3b0'); sfx.coin(); addXp(Math.max(1, Math.round(d.earn / 20)));
    return true;
  }
  if (b.type === 'farm') {
    if (!b.crop) { openCrops(b); return true; }
    if (now < b.readyAt) return false;
    const cap = storage();
    if (S.goods >= cap) { toast('Kho đã đầy! Hãy xây thêm Kho hàng hoặc cấp hàng cho cửa hàng'); sfx.bad(); return true; }
    if (!useEnergy()) return true;
    const c = CROP[b.crop], got = Math.min(c.yield, cap - S.goods);
    S.goods += got; S.stats.harvest++; b.crop = null;
    floatAt(b, '+' + got + '📦', '#d8f3dc'); sfx.pop(); addXp(c.xp);
    return true;
  }
  return false;
}
function plant(b, id) {
  const c = CROP[id];
  if (S.level < c.lvl) return;
  if (S.coins < c.cost) { toast('Không đủ xu!'); sfx.bad(); return; }
  if (!useEnergy()) return;
  S.coins -= c.cost; b.crop = id; b.readyAt = Date.now() + c.time * 1000;
  floatAt(b, c.icon + ' Đã gieo'); sfx.pop(); closeModal();
}
function sell(b) {
  const d = DEFS[b.type], refund = Math.floor(d.cost / 2);
  S.buildings.splice(S.buildings.indexOf(b), 1);
  S.coins += refund; rebuildGrid(); sfx.coin(); toast(`Đã phá dỡ ${d.name} (+${fmt(refund)} xu)`);
}
const expandInfo = () => { const k = (S.land - START_LAND) / 2 + 1; return { cost: 2000 * k * k, lvl: 1 + 2 * k, max: S.land >= WORLD }; };

function statusOf(b) {
  const d = DEFS[b.type], now = Date.now();
  if (!b.done) return { icon: '🔨', text: `Đang xây ${b.steps}/${d.steps} — chạm để xây (1⚡)` };
  if (d.cat === 'house' || d.cat === 'shop') {
    if (!hasRoad(b)) return { icon: '🚫', text: 'Chưa kề đường — hãy xây đường bên cạnh' };
  }
  if (d.cat === 'house') {
    return now >= b.readyAt ? { icon: '🪙', text: 'Sẵn sàng thu tiền' } : { text: 'Thu tiền sau ' + fmtTime((b.readyAt - now) / 1000) };
  }
  if (d.cat === 'shop') {
    if (!b.supplied) return { icon: '📦', text: `Cần ${d.need} hàng hóa để mở bán` };
    return now >= b.readyAt ? { icon: '🪙', text: 'Sẵn sàng thu tiền' } : { text: 'Đang bán, còn ' + fmtTime((b.readyAt - now) / 1000) };
  }
  if (b.type === 'farm') {
    if (!b.crop) return { icon: '🌱', text: 'Ruộng trống — chạm để gieo trồng' };
    const c = CROP[b.crop];
    return now >= b.readyAt ? { icon: c.icon, text: 'Sẵn sàng thu hoạch ' + c.name } : { text: `${c.name} chín sau ` + fmtTime((b.readyAt - now) / 1000) };
  }
  if (d.happy) return { text: `+${d.happy} hạnh phúc` + (d.bonus ? ` · +${d.bonus}% thu nhập quanh đây` : '') };
  if (d.store) return { text: `+${d.store} sức chứa kho` };
  return { text: b.type === 'road' ? 'Nhà và cửa hàng cần kề đường' : '' };
}

// ───────────────────────── Vẽ isometric ─────────────────────────
const cv = $('game');
let g = cv.getContext('2d');
const TW = 32, TH = 16, ZH = 28;
let OX = 0, OY = 0, W = 0, H = 0, DPR = 1;
const cam = { x: 0, y: 0, z: 1.2 };

const P = (x, y, z = 0) => [(x + OX - y - OY) * TW, (x + OX + y + OY) * TH - z * ZH];
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = v => clamp(Math.round(v * f), 0, 255);
  return `rgb(${c(n >> 16)},${c(n >> 8 & 255)},${c(n & 255)})`;
}
function poly(pts, fill, stroke) {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); }
}
const OUT = 'rgba(60,40,30,.35)';
function box(x0, y0, x1, y1, z0, z1, col) {
  poly([P(x0, y1, z1), P(x1, y1, z1), P(x1, y1, z0), P(x0, y1, z0)], shade(col, .86), OUT);
  poly([P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0), P(x1, y0, z0)], shade(col, .7), OUT);
  poly([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], shade(col, 1.05), OUT);
}
const quadL = (xa, xb, y, za, zb, col) => poly([P(xa, y, zb), P(xb, y, zb), P(xb, y, za), P(xa, y, za)], col);
const quadR = (x, ya, yb, za, zb, col) => poly([P(x, ya, zb), P(x, yb, zb), P(x, yb, za), P(x, ya, za)], col);
function gable(x0, y0, x1, y1, z0, z1, col) {
  const ym = (y0 + y1) / 2;
  poly([P(x0, y0, z0), P(x1, y0, z0), P(x1, ym, z1), P(x0, ym, z1)], shade(col, 1.1), OUT);
  poly([P(x1, y0, z0), P(x1, y1, z0), P(x1, ym, z1)], shade(col, .6), OUT);
  poly([P(x0, y1, z0), P(x1, y1, z0), P(x1, ym, z1), P(x0, ym, z1)], shade(col, .92), OUT);
}
function pyr(x0, y0, x1, y1, z0, z1, col) {
  const c = P((x0 + x1) / 2, (y0 + y1) / 2, z1);
  poly([P(x0, y0, z0), P(x1, y0, z0), c], shade(col, 1.15));
  poly([P(x0, y0, z0), P(x0, y1, z0), c], shade(col, 1.1));
  poly([P(x0, y1, z0), P(x1, y1, z0), c], shade(col, .95), OUT);
  poly([P(x1, y0, z0), P(x1, y1, z0), c], shade(col, .72), OUT);
}
function circ(x, y, z, r, col, stroke) {
  const p = P(x, y, z);
  g.beginPath(); g.arc(p[0], p[1], r, 0, 7); g.fillStyle = col; g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); }
}
function emoji(x, y, z, ch, size) {
  const p = P(x, y, z);
  g.font = size + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#000'; g.fillText(ch, p[0], p[1]);
}
function treeAt(x, y, sc = 1, col = '#52b788') {
  box(x - .05, y - .05, x + .05, y + .05, 0, .4 * sc, '#8d6e63');
  circ(x, y, .62 * sc, 12 * sc, shade(col, .85), OUT);
  circ(x - .05, y - .05, .8 * sc, 9 * sc, col);
  circ(x - .1, y - .1, .9 * sc, 4 * sc, shade(col, 1.2));
}

const STYLES = {
  house(s, o) {
    const a = o.inset ?? .14, b = s - a, h = o.h, win = o.win || '#fff3b0';
    if (s > 1) poly([P(.04, .04), P(s - .04, .04), P(s - .04, s - .04), P(.04, s - .04)], '#b7e4a0');
    box(a, a, b, b, 0, h, o.wall);
    const floors = Math.max(1, Math.round(h / .5)), fh = h / floors, n = Math.max(2, Math.round((b - a) * 2.4));
    for (let f = 0; f < floors; f++) for (let i = 0; i < n; i++) {
      const u0 = a + (b - a) * (i + .25) / n, u1 = a + (b - a) * (i + .75) / n;
      const z0 = f * fh + fh * .3, z1 = f * fh + fh * .78;
      if (f === 0 && i === Math.floor(n / 2)) quadL(u0, u1, b, 0, fh * .78, '#7f5539');
      else quadL(u0, u1, b, z0, z1, win);
      quadR(b, u0, u1, z0, z1, shade(win, .82));
    }
    const e = .07;
    if (o.rt === 'gable') gable(a - e, a - e, b + e, b + e, h, h + o.rh, o.roof);
    else if (o.rt === 'pyr') pyr(a - e, a - e, b + e, b + e, h, h + o.rh, o.roof);
    else { box(a - .03, a - .03, b + .03, b + .03, h, h + o.rh, o.roof); const m = (a + b) / 2; box(m - .2, m - .2, m + .1, m + .1, h + o.rh, h + o.rh + .18, '#adb5bd'); }
    if (o.sign) emoji(s / 2, s / 2, h + o.rh + .45, o.sign, 16 + s * 3);
  },
  shop(s, o) {
    const a = .1, b = s - a, h = o.h, win = o.win || '#caf0f8';
    box(a, a, b, b, 0, h, o.wall);
    const n = Math.max(1, Math.round((b - a) * 1.5));
    for (let i = 0; i < n; i++) {
      const u0 = a + (b - a) * (i + .15) / n, u1 = a + (b - a) * (i + .85) / n;
      quadL(u0, u1, b, i === 0 ? 0 : h * .25, h * .68, i === 0 ? '#6b4f3a' : win);
      quadR(b, u0, u1, h * .25, h * .68, shade(win, .85));
    }
    // mái hiên sọc
    const k = Math.round((b - a) * 6);
    for (let i = 0; i < k; i++) {
      const u0 = a + (b - a) * i / k, u1 = a + (b - a) * (i + 1) / k, c = i % 2 ? '#ffffff' : o.roof;
      poly([P(u0, b, h * .95), P(u1, b, h * .95), P(u1, b + .16, h * .72), P(u0, b + .16, h * .72)], c);
      poly([P(b, u0, h * .95), P(b, u1, h * .95), P(b + .16, u1, h * .72), P(b + .16, u0, h * .72)], shade(c, .82));
    }
    box(a - .03, a - .03, b + .03, b + .03, h, h + .1, o.roof);
    const pz = h + .5 + (s - 1) * .1;
    circ(s / 2, s / 2, pz, 11 + s * 2, '#fff', OUT);
    emoji(s / 2, s / 2, pz, o.sign, 13 + s * 3);
  },
  road() {
    poly([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], '#7d8597');
    const r = (dx, dy) => { const x = OX + dx, y = OY + dy; const b = x >= 0 && y >= 0 && x < WORLD && y < WORLD && grid[x] && grid[x][y]; return b && b.type === 'road'; };
    g.strokeStyle = '#f8f9fa'; g.lineWidth = 1.5; g.setLineDash([4, 4]);
    const c = P(.5, .5); let any = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (r(dx, dy)) {
      const e = P(.5 + dx / 2, .5 + dy / 2); g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(e[0], e[1]); g.stroke(); any = true;
    }
    g.setLineDash([]);
    if (!any) circ(.5, .5, 0, 2, '#f8f9fa');
  },
  farm(s, o, b, now) {
    box(.06, .06, s - .06, s - .06, 0, .1, '#9c6644');
    for (let i = 0; i < 4; i++) quadTop(.2, .2 + i * .42 * s / 2 + .0, s - .2, .32 + i * .42 * s / 2, .1, '#7f5539');
    if (!b || !b.crop) return;
    const c = CROP[b.crop], p = clamp(1 - (b.readyAt - now) / (c.time * 1000), 0, 1);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const x = .32 + i * (s - .64) / 3, y = .26 + j * .42 * s / 2;
      if (p >= 1) emoji(x, y, .3, c.icon, 12);
      else { circ(x, y, .12 + p * .2, 2 + p * 4, '#74c69d'); circ(x, y, .16 + p * .26, 1.5 + p * 3, '#40916c'); }
    }
  },
  tree() { treeAt(.5, .5); },
  flowers(s, o, b, now) {
    box(.15, .15, .85, .85, 0, .12, '#bc8a5f');
    quadTop(.2, .2, .8, .8, .12, '#6a994e');
    const cols = ['#ff6b6b', '#ffd166', '#f78fb3', '#ffffff', '#c77dff'];
    for (let i = 0; i < 9; i++) circ(.3 + (i % 3) * .2, .3 + Math.floor(i / 3) * .2, .22, 3, cols[i % 5], OUT);
  },
  lamp(s, o, b, now) {
    box(.45, .45, .55, .55, 0, 1.05, '#495057');
    circ(.5, .5, 1.15, 9, 'rgba(255,230,120,.35)');
    circ(.5, .5, 1.15, 4.5, '#ffe066', OUT);
  },
  fountain(s, o, b, now) {
    box(.12, .12, .88, .88, 0, .18, '#dee2e6');
    quadTop(.2, .2, .8, .8, .18, '#74c0fc');
    box(.43, .43, .57, .57, .18, .55, '#ced4da');
    const t = (now || 0) / 300;
    g.strokeStyle = '#a5d8ff'; g.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = i * 1.257 + t * .3, top = P(.5, .5, .62), end = P(.5 + Math.cos(a) * .25, .5 + Math.sin(a) * .25, .2);
      g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo((top[0] + end[0]) / 2, top[1] - 10 - Math.sin(t + i) * 2, end[0], end[1]); g.stroke();
    }
  },
  park() {
    poly([P(.05, .05), P(1.95, .05), P(1.95, 1.95), P(.05, 1.95)], '#95d5b2', OUT);
    poly([P(.9, .05), P(1.1, .05), P(1.1, 1.95), P(.9, 1.95)], '#e9d8a6');
    poly([P(.05, .9), P(1.95, .9), P(1.95, 1.1), P(.05, 1.1)], '#e9d8a6');
    treeAt(.45, .45, 1, '#40916c'); treeAt(1.55, .45, .9, '#74c69d');
    box(1.3, 1.5, 1.75, 1.62, 0, .16, '#9c6644');
    treeAt(.45, 1.55, 1.05, '#52b788');
    circ(1, 1, .05, 5, '#ffd166', OUT);
  },
  statue() {
    box(.25, .25, .75, .75, 0, .35, '#ced4da');
    box(.4, .4, .6, .6, .35, .95, '#e9c46a');
    circ(.5, .5, 1.12, 6, '#f4d35e', OUT);
    emoji(.5, .5, 1.5, '⭐', 11);
  },
  ferris(s, o, b, now) {
    poly([P(.1, .1), P(1.9, .1), P(1.9, 1.9), P(.1, 1.9)], '#d8e2dc', OUT);
    const c = P(1, 1, 1.7), R = 38, t = (now || 0) / 2500;
    g.strokeStyle = '#6c757d'; g.lineWidth = 3;
    for (const f of [P(.5, 1.5), P(1.5, .5)]) { g.beginPath(); g.moveTo(f[0], f[1]); g.lineTo(c[0], c[1]); g.stroke(); }
    g.strokeStyle = '#e63946'; g.lineWidth = 2.5; g.beginPath(); g.arc(c[0], c[1], R, 0, 7); g.stroke();
    g.lineWidth = 1; g.strokeStyle = '#adb5bd';
    const cols = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#f78c6b', '#c77dff', '#83c5be', '#ffb703'];
    for (let i = 0; i < 8; i++) {
      const a = t + i * Math.PI / 4, x = c[0] + Math.cos(a) * R, y = c[1] + Math.sin(a) * R;
      g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(x, y); g.stroke();
      g.fillStyle = cols[i]; g.fillRect(x - 4, y, 8, 7); g.strokeStyle = OUT; g.strokeRect(x - 4, y, 8, 7); g.strokeStyle = '#adb5bd';
    }
    g.beginPath(); g.arc(c[0], c[1], 4, 0, 7); g.fillStyle = '#e63946'; g.fill();
  },
  stadium() {
    box(.1, .1, 2.9, 2.9, 0, .7, '#dee2e6');
    quadTop(.25, .25, 2.75, 2.75, .7, '#e63946');
    quadTop(.45, .45, 2.55, 2.55, .7, '#adb5bd');
    quadTop(.7, .7, 2.3, 2.3, .7, '#52b788');
    const a = P(1.5, .7, .7), b2 = P(1.5, 2.3, .7);
    g.strokeStyle = '#fff'; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b2[0], b2[1]); g.stroke();
    for (const [x, y] of [[.2, .2], [2.8, .2], [.2, 2.8], [2.8, 2.8]]) { box(x - .05, y - .05, x + .05, y + .05, .7, 1.3, '#6c757d'); circ(x, y, 1.35, 4, '#ffe066', OUT); }
    emoji(1.5, 1.5, 1.2, '⚽', 16);
  },
  site(s, prog) {
    poly([P(.05, .05), P(s - .05, .05), P(s - .05, s - .05), P(.05, s - .05)], '#d4a373', OUT);
    const h = .25 + prog * .6;
    box(.2, .2, s - .2, s - .2, 0, h, '#e9edc9');
    g.strokeStyle = '#bc6c25'; g.lineWidth = 2;
    for (const [x, y] of [[.12, s - .12], [s - .12, s - .12], [s - .12, .12], [.12, .12]]) {
      const p0 = P(x, y, 0), p1 = P(x, y, h + .3); g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
    }
    const q = [P(.12, s - .12, h + .3), P(s - .12, s - .12, h + .3), P(s - .12, .12, h + .3)];
    g.beginPath(); g.moveTo(q[0][0], q[0][1]); g.lineTo(q[1][0], q[1][1]); g.lineTo(q[2][0], q[2][1]); g.stroke();
  },
};
function quadTop(x0, y0, x1, y1, z, col) { poly([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)], col); }

function drawBuilding(b, now) {
  const d = DEFS[b.type];
  OX = b.x; OY = b.y;
  if (!b.done) STYLES.site(d.s, b.steps / d.steps);
  else STYLES[d.style](d.s, d.o || {}, b, now);
}
function drawBubble(b, icon, now) {
  const d = DEFS[b.type];
  OX = b.x; OY = b.y;
  const p = P(d.s / 2, d.s / 2, (b.done ? d.top : 1) + .45);
  const y = p[1] + Math.sin(now / 300 + b.id) * 2.5;
  g.beginPath(); g.arc(p[0], y, 11, 0, 7); g.fillStyle = 'rgba(255,255,255,.95)'; g.fill();
  g.strokeStyle = '#e9c46a'; g.lineWidth = 2; g.stroke();
  g.font = '13px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#000';
  g.fillText(icon, p[0], y + 1);
}
const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

function render() {
  const now = Date.now();
  g = ctx0;
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#8fd3f4'); sky.addColorStop(1, '#d4f1c5');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  g.setTransform(DPR * cam.z, 0, 0, DPR * cam.z, DPR * cam.x, DPR * cam.y);

  // nền đảo
  OX = OY = 0;
  poly([P(0, WORLD, -.5), P(WORLD, WORLD, -.5), P(WORLD, WORLD), P(0, WORLD)], '#8d6e63');
  poly([P(WORLD, 0, -.5), P(WORLD, WORLD, -.5), P(WORLD, WORLD), P(WORLD, 0)], '#6d4c41');
  for (let x = 0; x < WORLD; x++) for (let y = 0; y < WORLD; y++) {
    const un = unlocked(x, y), odd = (x + y) & 1;
    poly([P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)], un ? (odd ? '#a8e08f' : '#9fd983') : (odd ? '#5fa56b' : '#589e64'));
  }
  // đường (phẳng) trước
  for (const b of S.buildings) if (b.type === 'road' && b !== moving) drawBuilding(b, now);
  // vật thể theo chiều sâu
  const items = [];
  for (const b of S.buildings) if (b.type !== 'road' && b !== moving) items.push({ k: b.x + b.y + DEFS[b.type].s - 1, b });
  for (let x = 0; x < WORLD; x++) for (let y = 0; y < WORLD; y++) if (!unlocked(x, y) && hash(x, y) % 3 === 0) items.push({ k: x + y, t: [x, y] });
  items.sort((a, b) => a.k - b.k);
  for (const it of items) {
    if (it.b) drawBuilding(it.b, now);
    else { OX = it.t[0]; OY = it.t[1]; treeAt(.5, .5, .8 + hash(OY, OX) % 5 * .08, '#2d6a4f'); }
  }
  // bóng ma khi đặt / di chuyển
  if (mode.name !== 'idle' && hover) drawGhost(now);
  // bong bóng trạng thái
  for (const b of S.buildings) { if (b === moving) continue; const st = statusOf(b); if (st.icon) drawBubble(b, st.icon, now); }
  // chữ bay
  const t = performance.now();
  g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = floats.length - 1; i >= 0; i--) {
    const f = floats[i], a = (t - f.t0) / 1300;
    if (a >= 1) { floats.splice(i, 1); continue; }
    g.globalAlpha = 1 - a * a; g.lineWidth = 3; g.strokeStyle = 'rgba(40,30,20,.8)';
    g.strokeText(f.text, f.x, f.y - a * 34); g.fillStyle = f.color; g.fillText(f.text, f.x, f.y - a * 34);
  }
  g.globalAlpha = 1;
}
function drawGhost(now) {
  const type = mode.name === 'place' ? mode.type : (moving && moving.type);
  if (mode.name === 'sell' || !type) {
    const b = grid[hover.x] && grid[hover.x][hover.y];
    if (b) { const s = DEFS[b.type].s; OX = b.x; OY = b.y; poly([P(0, 0), P(s, 0), P(s, s), P(0, s)], mode.name === 'sell' ? 'rgba(230,57,70,.45)' : 'rgba(255,209,102,.5)'); }
    return;
  }
  const d = DEFS[type], x = hover.x - Math.floor(d.s / 2), y = hover.y - Math.floor(d.s / 2), ok = canPlace(x, y, d.s);
  OX = x; OY = y;
  if (d.range) { const r = d.range; poly([P(-r, -r), P(d.s + r, -r), P(d.s + r, d.s + r), P(-r, d.s + r)], 'rgba(255,209,102,.25)', 'rgba(244,162,97,.9)'); }
  poly([P(0, 0), P(d.s, 0), P(d.s, d.s), P(0, d.s)], ok ? 'rgba(80,200,120,.55)' : 'rgba(230,57,70,.55)');
  g.globalAlpha = .7;
  STYLES[d.style](d.s, d.o || {}, mode.name === 'move' ? moving : null, now);
  g.globalAlpha = 1;
}

const thumbs = {};
function thumb(id) {
  if (thumbs[id]) return thumbs[id];
  const d = DEFS[id], c = document.createElement('canvas'); c.width = c.height = 176;
  const save = [g, OX, OY]; g = c.getContext('2d'); OX = OY = 0;
  const tall = d.top * ZH + d.s * TH * 2 + 10, sc = Math.min(2.4, 160 / (d.s * TW * 2), 165 / tall);
  g.setTransform(sc, 0, 0, sc, 88, 170 - d.s * TH * 2 * sc);
  STYLES[d.style](d.s, d.o || {}, id === 'farm' ? { crop: 'ngo', readyAt: 0 } : null, 0);
  [g, OX, OY] = save;
  return thumbs[id] = c.toDataURL();
}

// ───────────────────────── Giao diện ─────────────────────────
const mode = { name: 'idle', type: null };
let moving = null, moveFrom = null, hover = null, selected = null;
let shopTab = 'house';

function setMode(name, type) {
  if (moving) { moving.x = moveFrom.x; moving.y = moveFrom.y; moving = null; rebuildGrid(); }
  mode.name = name; mode.type = type || null; selected = null;
  document.querySelectorAll('#toolbar button').forEach(b => b.classList.toggle('on', b.dataset.act === name));
  const txt = { place: () => `Đang xây: ${DEFS[type].name} (🪙 ${fmt(DEFS[type].cost)}) — chạm vào ô đất để đặt`,
                move: () => 'Di chuyển: chạm công trình rồi chạm vị trí mới', sell: () => 'Phá dỡ: chạm công trình để bán lại (hoàn 50%)' }[name];
  $('banner').classList.toggle('hidden', !txt);
  if (txt) $('banner-text').textContent = txt();
}

function openModal(title, html, center, tabs) {
  $('modal-box').innerHTML = `<div class="m-head"><span>${title}</span><button data-close>✕</button></div>${tabs || ''}<div class="m-body ${center ? 'center' : ''}">${html}</div>`;
  $('modal').classList.remove('hidden');
}
function closeModal() { $('modal').classList.add('hidden'); cropFarm = null; }

function statLine(d) {
  if (d.cat === 'house') return `👥 +${d.pop} · 🪙 ${fmt(d.earn)} / ${fmtTime(d.time)}`;
  if (d.cat === 'shop') return `📦 ${d.need} → 🪙 ${fmt(d.earn)} / ${fmtTime(d.time)}`;
  if (d.id === 'road') return 'Nối nhà và cửa hàng';
  if (d.id === 'farm') return 'Trồng trọt lấy hàng hóa';
  if (d.store) return `📦 +${d.store} sức chứa`;
  return `😊 +${d.happy}` + (d.bonus ? ` · +${d.bonus}% thu nhập` : '');
}
function openShop() {
  const tabs = `<div class="tabs">${TABS.map(([k, n]) => `<button data-tab="${k}" class="${k === shopTab ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  const cards = Object.values(DEFS).filter(d => d.cat === shopTab).map(d => {
    const lock = S.level < d.lvl, poor = S.coins < d.cost;
    return `<div class="card ${lock ? 'lock' : poor ? 'poor' : ''}" data-buy="${d.id}">
      <img src="${thumb(d.id)}" width="88" height="88" alt=""><div class="nm">${d.name}</div>
      <div class="st">${statLine(d)}</div><div class="pr">${lock ? '🔒 Cấp ' + d.lvl : '🪙 ' + fmt(d.cost)}</div></div>`;
  }).join('');
  openModal('Xây dựng', `<div class="grid">${cards}</div>`, false, tabs);
}
let cropFarm = null;
function openCrops(b) {
  const cards = CROPS.map(c => {
    const lock = S.level < c.lvl;
    return `<div class="card ${lock ? 'lock' : S.coins < c.cost ? 'poor' : ''}" data-crop="${c.id}">
      <div class="ico">${c.icon}</div><div class="nm">${c.name}</div>
      <div class="st">📦 +${c.yield} · ⏱ ${fmtTime(c.time)}</div><div class="pr">${lock ? '🔒 Cấp ' + c.lvl : '🪙 ' + c.cost}</div></div>`;
  }).join('');
  openModal('Gieo trồng', `<div class="grid">${cards}</div>`);
  cropFarm = b;
}
const rewardText = r => [r.coins && `🪙 ${fmt(r.coins)}`, r.xp && `⭐ ${r.xp} XP`, r.gems && `💎 ${r.gems}`].filter(Boolean).join(' · ');
const questProg = q => Math.min(q.n, q.k(S));
function openQuests() {
  let html = '';
  if (S.quest >= QUESTS.length) html = '<p class="center">🏆 Bạn đã hoàn thành mọi nhiệm vụ. Hãy tiếp tục xây thành phố trong mơ!</p>';
  QUESTS.forEach((q, i) => {
    if (i < S.quest - 2 || i > S.quest + 2) return;
    const cur = i === S.quest, p = i < S.quest ? q.n : cur ? questProg(q) : 0;
    html += `<div class="quest ${cur ? 'cur' : i < S.quest ? 'fin' : ''}"><b>${i < S.quest ? '✅ ' : ''}${q.t}</b><div>${q.d}</div>
      ${cur ? `<div class="qp"><div style="width:${p / q.n * 100}%"></div></div>` : ''}
      <div class="rw">${cur ? `Tiến độ: ${fmt(p)}/${fmt(q.n)} · ` : ''}Thưởng: ${rewardText(q.r)}</div>
      ${cur && p >= q.n ? '<button class="btn" data-do="claim">Nhận thưởng</button>' : ''}</div>`;
  });
  openModal('Nhiệm vụ', html);
}
function claimQuest() {
  const q = QUESTS[S.quest];
  if (!q || questProg(q) < q.n) return;
  S.quest++; S.coins += q.r.coins || 0; S.gems += q.r.gems || 0;
  sfx.win(); toast('Hoàn thành: ' + q.t + ' — ' + rewardText(q.r));
  closeModal();
  if (q.r.xp) addXp(q.r.xp);
  if ($('modal').classList.contains('hidden')) openQuests();
}
function openExpand() {
  const e = expandInfo();
  if (e.max) return openModal('Mở rộng đất', '<div class="big">🗺️</div><p>Thành phố đã đạt diện tích tối đa!</p><button class="btn" data-close>Đóng</button>', true);
  const ok = S.level >= e.lvl && S.coins >= e.cost;
  openModal('Mở rộng đất', `<div class="big">🗺️</div>
    <p>Mở rộng từ <b>${S.land}×${S.land}</b> lên <b>${S.land + 2}×${S.land + 2}</b> ô.</p>
    <p>Chi phí: 🪙 <b>${fmt(e.cost)}</b> · Yêu cầu: <b>Cấp ${e.lvl}</b></p>
    <button class="btn" data-do="expand" ${ok ? '' : 'disabled'}>Mở rộng</button><button class="btn alt" data-close>Để sau</button>`, true);
}
function openMenu() {
  openModal('Cài đặt & Hướng dẫn', `<ul class="help">
    <li>🏠 <b>Nhà ở</b> tăng dân số và cho thu tiền thuê định kỳ.</li>
    <li>🌾 <b>Ruộng</b> trồng nông sản để lấy 📦 hàng hóa.</li>
    <li>🏪 <b>Cửa hàng</b> cần hàng hóa để mở bán, bán xong thì thu xu.</li>
    <li>🛣️ Nhà và cửa hàng phải <b>kề đường</b> mới hoạt động.</li>
    <li>🌳 <b>Trang trí</b> và công trình công cộng tăng 😊 hạnh phúc; hạnh phúc càng cao, thu nhập càng nhiều. Trang trí còn cộng % thu nhập cho công trình xung quanh.</li>
    <li>⚡ Mỗi thao tác (xây, thu tiền, thu hoạch…) tốn 1 năng lượng, hồi dần theo thời gian.</li>
    <li>🖱️ Kéo để di chuyển bản đồ, lăn chuột hoặc chụm hai ngón để thu phóng.</li></ul>
    <div class="center"><button class="btn alt" data-do="mute">${S.mute ? '🔇 Bật âm thanh' : '🔊 Tắt âm thanh'}</button>
    <button class="btn red" data-do="reset">Chơi lại từ đầu</button></div>`);
}
function checkDaily() {
  const day = d => new Date(d).toLocaleDateString('sv');
  const today = day(Date.now());
  if (S.daily.last === today) return;
  S.daily.streak = S.daily.last === day(Date.now() - 864e5) ? S.daily.streak + 1 : 1;
  S.daily.last = today;
  const n = Math.min(7, S.daily.streak), coins = 150 * n, gems = S.daily.streak % 7 === 0 ? 3 : 0;
  S.coins += coins; S.gems += gems; S.energy = Math.max(S.energy, maxEnergy());
  openModal('Quà đăng nhập', `<div class="big">🎁</div><p>Ngày thứ <b>${S.daily.streak}</b> liên tiếp</p>
    <p>🪙 ${fmt(coins)}${gems ? ' · 💎 ' + gems : ''} · ⚡ đầy năng lượng</p><button class="btn" data-close>Nhận</button>`, true);
}

function updateHud() {
  tickEnergy();
  const need = xpNeed(S.level), max = maxEnergy(), hp = happiness();
  $('h-level').textContent = S.level;
  $('h-xp').textContent = fmt(S.xp) + '/' + fmt(need);
  $('h-xpbar').style.width = S.xp / need * 100 + '%';
  $('h-coins').textContent = fmt(S.coins);
  $('h-gems').textContent = S.gems;
  $('h-energy').textContent = S.energy + '/' + max;
  $('h-energy-t').textContent = S.energy < max ? fmtTime(ENERGY_SEC - (Date.now() - S.energyAt) / 1000) : '';
  $('h-goods').textContent = fmt(S.goods) + '/' + fmt(storage());
  $('h-pop').textContent = fmt(population());
  $('h-happy').textContent = hp + '%';
  $('h-face').textContent = hp >= 110 ? '😍' : hp >= 90 ? '😊' : hp >= 70 ? '😐' : '😟';
  const q = QUESTS[S.quest], tr = $('tracker');
  if (q) {
    const p = questProg(q), done = p >= q.n;
    tr.innerHTML = `<b>📜 ${q.t}</b>${done ? '🎁 Chạm để nhận thưởng!' : `${q.d} (${fmt(p)}/${fmt(q.n)})`}`;
    tr.classList.toggle('done', done); $('q-badge').classList.toggle('hidden', !done);
  } else { tr.innerHTML = '<b>🏆 Đã xong mọi nhiệm vụ</b>'; tr.classList.remove('done'); $('q-badge').classList.add('hidden'); }
  const inf = $('info');
  if (selected && S.buildings.includes(selected)) {
    const d = DEFS[selected.type], st = statusOf(selected), bn = (d.cat === 'house' || d.cat === 'shop') ? decoBonus(selected) : 0;
    inf.innerHTML = `<b>${d.name}</b><div class="sub">${st.text}${bn ? ` · Thưởng trang trí +${bn}%` : ''}</div>`;
    inf.classList.remove('hidden');
  } else inf.classList.add('hidden');
}

// ───────────────────────── Nhập liệu ─────────────────────────
function tileAt(sx, sy) {
  const wx = (sx - cam.x) / cam.z, wy = (sy - cam.y) / cam.z;
  return { x: Math.floor((wx / TW + wy / TH) / 2), y: Math.floor((wy / TH - wx / TW) / 2) };
}
function tap(t) {
  const inside = t.x >= 0 && t.y >= 0 && t.x < WORLD && t.y < WORLD;
  const b = inside ? grid[t.x][t.y] : null;
  if (mode.name === 'place') {
    const d = DEFS[mode.type];
    if (inside && !unlocked(t.x, t.y)) { toast('Vùng đất này chưa mở — dùng 🗺️ Mở đất'); sfx.bad(); return; }
    place(mode.type, t.x - Math.floor(d.s / 2), t.y - Math.floor(d.s / 2));
    return;
  }
  if (mode.name === 'move') {
    if (!moving) { if (b) { moving = b; moveFrom = { x: b.x, y: b.y }; rebuildGrid(); sfx.pop(); } return; }
    const s = DEFS[moving.type].s, x = t.x - Math.floor(s / 2), y = t.y - Math.floor(s / 2);
    if (canPlace(x, y, s)) { moving.x = x; moving.y = y; moving = null; rebuildGrid(); sfx.pop(); } else sfx.bad();
    return;
  }
  if (mode.name === 'sell') {
    if (!b) return;
    const d = DEFS[b.type];
    if (b.type === 'road' || d.cost <= 100) return sell(b);
    sellTarget = b;
    openModal('Phá dỡ', `<p>Phá dỡ <b>${d.name}</b> và nhận lại 🪙 ${fmt(Math.floor(d.cost / 2))}?</p>
      <button class="btn red" data-do="sell">Phá dỡ</button><button class="btn alt" data-close>Hủy</button>`, true);
    return;
  }
  if (!b) { selected = null; if (inside && !unlocked(t.x, t.y)) toast('Vùng đất chưa mở — dùng 🗺️ Mở đất'); return; }
  selected = b;
  act(b);
}
let sellTarget = null;

const ptrs = new Map();
let drag = null, pinch = null;
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) drag = { sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y, moved: false };
  else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z }; if (drag) drag.moved = true; }
});
cv.addEventListener('pointermove', e => {
  if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 2 && pinch) {
    const [a, b] = [...ptrs.values()];
    zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d);
    return;
  }
  if (drag && ptrs.size === 1) {
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 7) drag.moved = true;
    if (drag.moved) { cam.x = drag.cx + dx; cam.y = drag.cy + dy; }
  }
  if (e.pointerType === 'mouse') hover = tileAt(e.clientX, e.clientY);
});
function ptrEnd(e) {
  const had = ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch = null;
  if (had && ptrs.size === 0 && drag) {
    if (!drag.moved && e.type === 'pointerup') { const t = tileAt(e.clientX, e.clientY); hover = e.pointerType === 'mouse' ? t : null; tap(t); updateHud(); }
    drag = null;
  } else if (ptrs.size === 1 && drag) { const p = [...ptrs.values()][0]; drag = { sx: p.x, sy: p.y, cx: cam.x, cy: cam.y, moved: true }; }
}
cv.addEventListener('pointerup', ptrEnd);
cv.addEventListener('pointercancel', ptrEnd);
cv.addEventListener('pointerleave', () => { hover = null; });
function zoomAt(sx, sy, z) {
  z = clamp(z, .45, 2.6);
  cam.x = sx - (sx - cam.x) * z / cam.z; cam.y = sy - (sy - cam.y) * z / cam.z; cam.z = z;
}
cv.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, cam.z * (e.deltaY < 0 ? 1.12 : 1 / 1.12)); }, { passive: false });
window.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); setMode('idle'); } });

$('toolbar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const a = b.dataset.act;
  if (a === 'shop') { setMode('idle'); openShop(); }
  else if (a === 'move' || a === 'sell') setMode(mode.name === a ? 'idle' : a);
  else if (a === 'quests') openQuests();
  else if (a === 'expand') openExpand();
  else if (a === 'menu') openMenu();
});
$('banner-done').addEventListener('click', () => setMode('idle'));
$('tracker').addEventListener('click', () => { const q = QUESTS[S.quest]; if (q && questProg(q) >= q.n) claimQuest(); else openQuests(); });
$('h-energy-pill').addEventListener('click', askEnergy);
$('modal').addEventListener('click', e => {
  const t = e.target;
  if (t === $('modal') || t.closest('[data-close]')) return closeModal();
  const tab = t.closest('[data-tab]'); if (tab) { shopTab = tab.dataset.tab; return openShop(); }
  const buy = t.closest('[data-buy]');
  if (buy) {
    const d = DEFS[buy.dataset.buy];
    if (S.level < d.lvl) return toast('Cần đạt cấp ' + d.lvl);
    if (S.coins < d.cost) { sfx.bad(); return toast('Không đủ xu!'); }
    closeModal(); return setMode('place', d.id);
  }
  const crop = t.closest('[data-crop]'); if (crop && cropFarm) { const f = cropFarm; return plant(f, crop.dataset.crop); }
  const act = t.closest('[data-do]'); if (!act || act.disabled) return;
  switch (act.dataset.do) {
    case 'claim': claimQuest(); break;
    case 'refill': if (S.gems >= 3) { S.gems -= 3; S.energy = maxEnergy(); sfx.win(); closeModal(); } break;
    case 'sell': if (sellTarget && S.buildings.includes(sellTarget)) sell(sellTarget); sellTarget = null; closeModal(); break;
    case 'expand': { const x = expandInfo(); if (!x.max && S.level >= x.lvl && S.coins >= x.cost) { S.coins -= x.cost; S.land += 2; S.stats.expand++; sfx.win(); toast('Đã mở rộng đất!'); closeModal(); } break; }
    case 'mute': S.mute = !S.mute; openMenu(); break;
    case 'reset': openModal('Chơi lại', '<p>Xóa toàn bộ thành phố và bắt đầu lại?</p><button class="btn red" data-do="reset2">Xóa và chơi lại</button><button class="btn alt" data-close>Hủy</button>', true); break;
    case 'reset2': S = newState(); moving = null; rebuildGrid(); closeModal(); setMode('idle'); centerCam(); break;
  }
  updateHud(); save();
});

// ───────────────────────── Khởi động ─────────────────────────
const ctx0 = cv.getContext('2d');
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
}
function centerCam() { cam.z = W < 600 ? .9 : 1.3; cam.x = W / 2; cam.y = H / 2 - WORLD * TH * cam.z + 10; }
window.addEventListener('resize', resize);

S = load();
rebuildGrid();
resize(); centerCam();
tickEnergy();
updateHud();
checkDaily();
setInterval(updateHud, 500);
setInterval(save, 5000);
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
(function loop() { render(); requestAnimationFrame(loop); })();

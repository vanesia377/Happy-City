/* Chill City — game xây thành phố 3D thư giãn. Dữ liệu, luật chơi và giao diện; hiển thị 3D nằm ở view3d.js. */
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

  // Chăn nuôi: cho ăn "feed" nông sản, sau "time" giây thu "n" sản phẩm "out"
  coop:      { cat: 'ranch', name: 'Chuồng gà', s: 2, lvl: 3, cost: 600, feed: 4, time: 3 * MIN, out: 'egg', n: 3, steps: 3, top: 1.2, style: 'coop' },
  cowbarn:   { cat: 'ranch', name: 'Trại bò sữa', s: 2, lvl: 6, cost: 2000, feed: 10, time: 10 * MIN, out: 'milk', n: 3, steps: 4, top: 1.7,
               style: 'barn', o: { wall: '#c1121f', roof: '#6c584c', animal: 'cow' } },
  sheepfarm: { cat: 'ranch', name: 'Trại cừu', s: 2, lvl: 8, cost: 3500, feed: 15, time: 20 * MIN, out: 'wool', n: 3, steps: 4, top: 1.7,
               style: 'barn', o: { wall: '#dda15e', roof: '#606c38', animal: 'sheep' } },

  // Nhà máy chế biến: biến sản phẩm thô thành hàng giá trị cao
  bakery:    { cat: 'factory', name: 'Lò bánh mì', s: 2, lvl: 4, cost: 1500, steps: 4, top: 2.3, recipes: ['bread', 'cookie'],
               style: 'factory', o: { wall: '#ffe8d6', roof: '#bc6c25', h: 1, sign: '🍞' } },
  dairy:     { cat: 'factory', name: 'Nhà máy sữa', s: 2, lvl: 7, cost: 4000, steps: 5, top: 2.5, recipes: ['cheese', 'butter'],
               style: 'factory', o: { wall: '#e0fbfc', roof: '#3d5a80', h: 1.2, sign: '🧀' } },
  textile:   { cat: 'factory', name: 'Xưởng dệt', s: 2, lvl: 9, cost: 6000, steps: 5, top: 2.5, recipes: ['cloth', 'sweater'],
               style: 'factory', o: { wall: '#f8edeb', roof: '#9d4edd', h: 1.2, sign: '🧶' } },
  cakeshop:  { cat: 'factory', name: 'Xưởng bánh ngọt', s: 2, lvl: 12, cost: 12000, steps: 6, top: 2.7, recipes: ['cake'],
               style: 'factory', o: { wall: '#ffc8dd', roof: '#cdb4db', h: 1.4, sign: '🎂' } },

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

// Sản phẩm chăn nuôi & chế biến (price = giá bán ở chợ)
const ITEMS = {
  egg:     { name: 'Trứng',    icon: '🥚', price: 12 },
  milk:    { name: 'Sữa',      icon: '🥛', price: 30 },
  wool:    { name: 'Len',      icon: '🧶', price: 55 },
  bread:   { name: 'Bánh mì',  icon: '🍞', price: 45 },
  cookie:  { name: 'Bánh quy', icon: '🍪', price: 75 },
  cheese:  { name: 'Phô mai',  icon: '🧀', price: 110 },
  butter:  { name: 'Bơ',       icon: '🧈', price: 90 },
  cloth:   { name: 'Khăn len', icon: '🧣', price: 170 },
  sweater: { name: 'Áo len',   icon: '🧥', price: 600 },
  cake:    { name: 'Bánh kem', icon: '🎂', price: 700 },
};
// Công thức: in = nguyên liệu, goods = nông sản 📦 cần thêm, n = số lượng làm ra
const RECIPES = {
  bread:   { in: { egg: 2 }, goods: 10, time: 3 * MIN, n: 2, xp: 4 },
  cookie:  { in: { egg: 3, milk: 1 }, goods: 10, time: 8 * MIN, n: 2, xp: 8 },
  cheese:  { in: { milk: 3 }, time: 10 * MIN, n: 2, xp: 10 },
  butter:  { in: { milk: 2 }, time: 6 * MIN, n: 1, xp: 6 },
  cloth:   { in: { wool: 3 }, time: 15 * MIN, n: 2, xp: 14 },
  sweater: { in: { cloth: 2, wool: 1 }, time: 30 * MIN, n: 1, xp: 25 },
  cake:    { in: { bread: 2, cheese: 1, butter: 1, egg: 2 }, time: 40 * MIN, n: 1, xp: 30 },
};
// Cấp mở khóa của từng sản phẩm (dùng cho đơn hàng)
const ITEM_LVL = {};
for (const d of Object.values(DEFS)) if (d.out) ITEM_LVL[d.out] = Math.min(ITEM_LVL[d.out] ?? 99, d.lvl);
for (const [id, r] of Object.entries(RECIPES)) {
  const f = Object.values(DEFS).find(d => (d.recipes || []).includes(id));
  ITEM_LVL[id] = Math.max(f.lvl, ...Object.keys(r.in).map(k => ITEM_LVL[k]));
}

const CROPS = [
  { id: 'cai',   name: 'Rau cải',  icon: '🥬', lvl: 1,  cost: 10,  time: 30,        yield: 8,    xp: 1,  shape: 'leaf',   color: '#95d5b2' },
  { id: 'carot', name: 'Cà rốt',   icon: '🥕', lvl: 2,  cost: 25,  time: 2 * MIN,   yield: 20,   xp: 2,  shape: 'root',   color: '#f77f00' },
  { id: 'ngo',   name: 'Ngô',      icon: '🌽', lvl: 4,  cost: 50,  time: 5 * MIN,   yield: 45,   xp: 4,  shape: 'tall',   color: '#ffd60a' },
  { id: 'dau',   name: 'Dâu tây',  icon: '🍓', lvl: 6,  cost: 100, time: 15 * MIN,  yield: 100,  xp: 8,  shape: 'berry',  color: '#e63946' },
  { id: 'dua',   name: 'Dưa hấu',  icon: '🍉', lvl: 9,  cost: 200, time: HOUR,      yield: 240,  xp: 16, shape: 'ground', color: '#38b000' },
  { id: 'lua',   name: 'Lúa',      icon: '🌾', lvl: 11, cost: 350, time: 4 * HOUR,  yield: 520,  xp: 30, shape: 'tall',   color: '#e9c46a', top: '#e9c46a' },
  { id: 'bingo', name: 'Bí ngô',   icon: '🎃', lvl: 13, cost: 600, time: 8 * HOUR,  yield: 1000, xp: 50, shape: 'ground', color: '#f77f00' },
];
const CROP = Object.fromEntries(CROPS.map(c => [c.id, c]));

const TABS = [['house', '🏠 Nhà ở'], ['shop', '🏪 Kinh doanh'], ['infra', '🛣️ Hạ tầng'], ['ranch', '🐄 Chăn nuôi'], ['factory', '🏭 Chế biến'], ['deco', '🌳 Trang trí'], ['civic', '🏛️ Công cộng']];

const B = id => s => s.stats.built[id] || 0;
const QUESTS = [
  { t: 'Những cư dân đầu tiên', d: 'Xây 2 Nhà gỗ', k: B('cottage'), n: 2, r: { coins: 150, xp: 10 } },
  { t: 'Mở đường', d: 'Xây 5 ô đường (nhà và cửa hàng phải kề đường)', k: B('road'), n: 5, r: { coins: 100, xp: 10 } },
  { t: 'Nông dân tập sự', d: 'Xây 1 ô ruộng', k: B('farm'), n: 1, r: { coins: 100, xp: 10 } },
  { t: 'Mùa vụ đầu', d: 'Thu hoạch nông sản 2 lần', k: s => s.stats.harvest, n: 2, r: { coins: 150, xp: 15 } },
  { t: 'Chăm bón', d: 'Tưới nước cho cây đang lớn 3 lần', k: s => s.stats.water, n: 3, r: { coins: 150, xp: 15 } },
  { t: 'Khai trương', d: 'Xây 1 Xe bánh mì', k: B('banhmi'), n: 1, r: { coins: 150, xp: 15 } },
  { t: 'Tiếp hàng', d: 'Cấp hàng cho cửa hàng 2 lần', k: s => s.stats.supply, n: 2, r: { coins: 200, xp: 20 } },
  { t: 'Thu thuế', d: 'Thu tiền nhà 5 lần', k: s => s.stats.rent, n: 5, r: { coins: 200, xp: 20 } },
  { t: 'Phố xanh', d: 'Đặt 4 vật trang trí', k: s => s.stats.deco, n: 4, r: { coins: 250, xp: 25, gems: 1 } },
  { t: 'Thị trấn nhỏ', d: 'Đạt dân số 30', k: () => population(), n: 30, r: { coins: 300, xp: 30 } },
  { t: 'Thị trưởng tập sự', d: 'Đạt cấp 3', k: s => s.level, n: 3, r: { coins: 400, gems: 1 } },
  { t: 'Vươn rộng', d: 'Mở rộng đất 1 lần', k: s => s.stats.expand, n: 1, r: { coins: 500, xp: 50 } },
  { t: 'Kho bãi', d: 'Xây 1 Kho hàng', k: B('warehouse'), n: 1, r: { coins: 400, xp: 40 } },
  { t: 'Tiếng gà gáy', d: 'Xây 1 Chuồng gà (tab 🐄 Chăn nuôi)', k: B('coop'), n: 1, r: { coins: 300, xp: 30 } },
  { t: 'Nhặt trứng', d: 'Thu sản phẩm từ chuồng trại 3 lần', k: s => s.stats.animal, n: 3, r: { coins: 300, xp: 30 } },
  { t: 'Cà phê sáng', d: 'Xây 1 Quán cà phê', k: B('cafe'), n: 1, r: { coins: 400, xp: 40 } },
  { t: 'Lên đời', d: 'Nâng cấp 1 nhà hoặc cửa hàng (chọn công trình rồi bấm Nâng cấp)', k: s => s.stats.upgrade, n: 1, r: { coins: 500, xp: 50 } },
  { t: 'Diệt sâu', d: 'Bắt sâu trên ruộng 3 lần', k: s => s.stats.bugs, n: 3, r: { coins: 500, xp: 50, gems: 1 } },
  { t: 'Bánh mì nóng hổi', d: 'Xây 1 Lò bánh mì (tab 🏭 Chế biến)', k: B('bakery'), n: 1, r: { coins: 600, xp: 60 } },
  { t: 'Mẻ bánh đầu', d: 'Chế biến sản phẩm 3 lần', k: s => s.stats.craft, n: 3, r: { coins: 600, xp: 60, gems: 1 } },
  { t: 'Xe tải lên đường', d: 'Hoàn thành 3 đơn hàng ở 🧺 Chợ', k: s => s.stats.orders, n: 3, r: { coins: 800, xp: 80 } },
  { t: 'Buôn may bán đắt', d: 'Thu tiền cửa hàng 10 lần', k: s => s.stats.sales, n: 10, r: { coins: 600, xp: 60, gems: 1 } },
  { t: 'Đông vui', d: 'Đạt dân số 100', k: () => population(), n: 100, r: { coins: 800, xp: 80 } },
  { t: 'Trăm năm trồng người', d: 'Xây 1 Trường học', k: B('school'), n: 1, r: { coins: 1000, xp: 100, gems: 2 } },
  { t: 'Lá phổi xanh', d: 'Xây 1 Công viên', k: B('park'), n: 1, r: { coins: 1000, xp: 100 } },
  { t: 'Thành phố trẻ', d: 'Đạt dân số 250', k: () => population(), n: 250, r: { coins: 2000, xp: 200, gems: 2 } },
  { t: 'Bội thu', d: 'Thu hoạch nông sản 40 lần', k: s => s.stats.harvest, n: 40, r: { coins: 2000, xp: 200 } },
  { t: 'Đất rộng', d: 'Mở rộng đất 3 lần', k: s => s.stats.expand, n: 3, r: { coins: 3000, xp: 300, gems: 2 } },
  { t: 'Phố sang', d: 'Nâng cấp công trình 6 lần', k: s => s.stats.upgrade, n: 6, r: { coins: 3000, xp: 300, gems: 2 } },
  { t: 'Đồng cỏ xanh', d: 'Xây 1 Trại bò sữa', k: B('cowbarn'), n: 1, r: { coins: 2000, xp: 200 } },
  { t: 'Ông chủ nhà máy', d: 'Chế biến sản phẩm 30 lần', k: s => s.stats.craft, n: 30, r: { coins: 4000, xp: 400, gems: 2 } },
  { t: 'Nhà buôn uy tín', d: 'Hoàn thành 20 đơn hàng', k: s => s.stats.orders, n: 20, r: { coins: 5000, xp: 500, gems: 3 } },
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
    buildings: [], nextId: 1, quest: 0, mute: false, dayNight: true, shadows: true,
    stats: { built: {}, rent: 0, sales: 0, harvest: 0, supply: 0, deco: 0, expand: 0, water: 0, bugs: 0, upgrade: 0, animal: 0, craft: 0, orders: 0 },
    items: {}, orders: [],
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
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 1 && Array.isArray(s.buildings)) {
        s.stats = Object.assign({ water: 0, bugs: 0, upgrade: 0, animal: 0, craft: 0, orders: 0 }, s.stats); // bản lưu cũ
        s.items = s.items || {}; s.orders = s.orders || [];
        return s;
      }
    }
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
const MAX_LV = 3;
const lvMult = b => 1 + .5 * ((b.lv || 1) - 1);
const popOf = b => Math.round((DEFS[b.type].pop || 0) * lvMult(b));
const earnOf = b => DEFS[b.type].earn * lvMult(b);
const upgradeCost = b => Math.round(DEFS[b.type].cost * 1.5 * (b.lv || 1));
function population() { let p = 0; for (const b of S.buildings) if (b.done) p += popOf(b); return p; }
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

// ───────────────────────── Trồng trọt ─────────────────────────
const WATER_BOOST = .3, BUG_LOSS = .3;
const witherMs = c => Math.max(5 * MIN, 2 * c.time) * 1000;
/** Trạng thái ruộng: empty | grow | ripe | dead, kèm giai đoạn lớn (0..2) và sâu bọ. */
function farmInfo(b, now) {
  if (!b.crop) return { state: 'empty', stage: 0, bug: false };
  const c = CROP[b.crop], start = b.plantedAt || b.readyAt - c.time * 1000;
  const bugged = !!b.bugAt && now >= b.bugAt;
  if (now < b.readyAt) {
    const p = clamp((now - start) / Math.max(1, b.readyAt - start), 0, .999);
    return { state: 'grow', stage: Math.floor(p * 3), bug: bugged, left: b.readyAt - now };
  }
  const dead = b.readyAt + witherMs(c);
  return now < dead ? { state: 'ripe', stage: 3, bug: bugged, left: dead - now } : { state: 'dead', stage: 3, bug: false };
}
function waterCrop(b, now) { b.readyAt = now + (b.readyAt - now) * (1 - WATER_BOOST); b.watered = true; }

let rainUntil = 0, nextRain = Date.now() + (100 + Math.random() * 120) * 1000;
const isRaining = () => Date.now() < rainUntil;
function tickWeather() {
  const now = Date.now();
  if (now < nextRain) return;
  rainUntil = now + 40000; nextRain = now + (5 + Math.random() * 5) * MIN * 1000;
  let n = 0;
  for (const b of S.buildings) if (b.type === 'farm' && b.crop && !b.watered && now < b.readyAt) { waterCrop(b, now); n++; }
  toast(n ? `🌧️ Trời mưa! ${n} ruộng được tưới nước miễn phí` : '🌧️ Trời đổ mưa rào…');
}

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
  water: () => { beep(700, .05, 'sine'); setTimeout(() => beep(500, .08, 'sine'), 50); },
  build: () => beep(180, .07, 'square', .04),
  bad: () => beep(140, .15, 'sawtooth', .04),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .15), i * 110)),
};

// ───────────────────────── Kinh tế & hành động ─────────────────────────
function floatAt(b, text, color = '#fff') {
  const p = View.screenOf(b), el = document.createElement('div');
  el.className = 'float'; el.textContent = text; el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; el.style.color = color;
  $('floats').appendChild(el); setTimeout(() => el.remove(), 1300);
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
  openModal('Năng lượng', `<div class="big">⚡</div>
    <p>Năng lượng hồi 1 điểm mỗi ${ENERGY_SEC} giây và đầy lại khi lên cấp.</p>
    <button class="btn" data-do="refill" ${S.gems < 3 || S.energy >= maxEnergy() ? 'disabled' : ''}>Nạp đầy (💎 3)</button>
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
  if (!quiet) floatAt(b, 'Hoàn thành!', '#d8f3dc');
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
    const amt = Math.round(earnOf(b) * mult(b));
    S.coins += amt; S.stats.rent++; b.readyAt = now + d.time * 1000;
    floatAt(b, '+' + fmt(amt) + '🪙', '#fff3b0'); sfx.coin(); addXp(Math.max(1, Math.round(d.earn / 20)));
    return true;
  }
  if (d.cat === 'shop') {
    if (!hasRoad(b)) { toast('Cửa hàng cần nằm kề đường'); sfx.bad(); return true; }
    if (!b.supplied) {
      if (S.goods < d.need) { toast(`Cần ${d.need} 📦 hàng hóa — hãy trồng trọt thêm hoặc mua ở chợ`); sfx.bad(); return true; }
      if (!useEnergy()) return true;
      S.goods -= d.need; b.supplied = true; b.readyAt = now + d.time * 1000; S.stats.supply++;
      floatAt(b, '-' + d.need + '📦'); sfx.pop();
      return true;
    }
    if (now < b.readyAt) return false;
    if (!useEnergy()) return true;
    const amt = Math.round(earnOf(b) * mult(b));
    S.coins += amt; S.stats.sales++; b.supplied = false;
    floatAt(b, '+' + fmt(amt) + '🪙', '#fff3b0'); sfx.coin(); addXp(Math.max(1, Math.round(d.earn / 20)));
    return true;
  }
  if (d.cat === 'ranch') return actRanch(b, d, now);
  if (d.cat === 'factory') return actFactory(b, d, now);
  if (b.type === 'farm') return actFarm(b, now);
  return false;
}

// ───────────────────────── Chăn nuôi & chế biến ─────────────────────────
const have = id => S.items[id] || 0;
const addItem = (id, n) => { S.items[id] = have(id) + n; };
function actRanch(b, d, now) {
  if (!b.fed) {
    if (S.goods < d.feed) { toast(`Cần ${d.feed} 📦 nông sản làm thức ăn — hãy thu hoạch thêm hoặc mua ở chợ`); sfx.bad(); return true; }
    if (!useEnergy()) return true;
    S.goods -= d.feed; b.fed = true; b.readyAt = now + d.time * 1000;
    floatAt(b, '🌾 Cho ăn −' + d.feed + '📦'); sfx.pop();
    return true;
  }
  if (now < b.readyAt) return false;
  if (!useEnergy()) return true;
  addItem(d.out, d.n); b.fed = false; S.stats.animal++;
  floatAt(b, `+${d.n} ${ITEMS[d.out].icon}`, '#fff3b0'); sfx.pop(); addXp(Math.max(2, Math.round(d.feed / 2)));
  return true;
}
function actFactory(b, d, now) {
  if (!b.job) { openFactory(b); return true; }
  if (now < b.readyAt) return false;
  if (!useEnergy()) return true;
  const r = RECIPES[b.job];
  addItem(b.job, r.n); S.stats.craft++;
  floatAt(b, `+${r.n} ${ITEMS[b.job].icon}`, '#fff3b0'); sfx.coin(); addXp(r.xp);
  b.job = null;
  return true;
}
const recipeOk = r => Object.entries(r.in).every(([k, n]) => have(k) >= n) && S.goods >= (r.goods || 0);
function startJob(b, id) {
  const r = RECIPES[id];
  if (!b || b.job || !recipeOk(r)) { sfx.bad(); return; }
  if (!useEnergy()) return;
  for (const [k, n] of Object.entries(r.in)) S.items[k] -= n;
  S.goods -= r.goods || 0; b.job = id; b.readyAt = Date.now() + r.time * 1000;
  floatAt(b, '⚙️ ' + ITEMS[id].name); sfx.build(); closeModal();
}
function newOrder() {
  const pool = Object.keys(ITEMS).filter(id => S.level >= ITEM_LVL[id]);
  if (!pool.length) return null;
  const k = 1 + Math.floor(Math.random() * Math.min(3, pool.length)), items = {};
  let value = 0;
  while (Object.keys(items).length < k) {
    const id = pool[Math.floor(Math.random() * pool.length)];
    if (items[id]) continue;
    items[id] = clamp(Math.round((2 + Math.random() * 4) * 30 / ITEMS[id].price), 1, 12);
    value += items[id] * ITEMS[id].price;
  }
  return { items, coins: Math.round(value * 1.5), xp: Math.round(value / 15) + 3 };
}
function refreshOrders() { while (S.orders.length < 3) { const o = newOrder(); if (!o) break; S.orders.push(o); } }
const orderOk = o => Object.entries(o.items).every(([k, n]) => have(k) >= n);
function actFarm(b, now) {
  const st = farmInfo(b, now);
  if (st.state === 'empty') { openCrops(b); return true; }
  const c = CROP[b.crop];
  if (st.state === 'dead') {
    witherFarm = b;
    openModal('Cây đã héo', `<div class="big">🥀</div><p><b>${c.name}</b> đã héo vì để quá lâu không thu hoạch.</p>
      <button class="btn" data-do="clear">Dọn ruộng (⚡ 1)</button>
      <button class="btn alt" data-do="revive" ${S.gems < 1 ? 'disabled' : ''}>Hồi sinh (💎 1)</button>`, true);
    return true;
  }
  if (st.state === 'grow') {
    if (st.bug) { // bắt sâu: miễn phí
      b.bugAt = 0; S.stats.bugs++; floatAt(b, '🐛 Đã bắt sâu!', '#d8f3dc'); sfx.pop(); addXp(2);
      return true;
    }
    if (!b.watered) {
      if (!useEnergy()) return true;
      waterCrop(b, now); S.stats.water++; floatAt(b, '💧 Lớn nhanh hơn ' + WATER_BOOST * 100 + '%', '#a5d8ff'); sfx.water(); addXp(1);
      return true;
    }
    return false;
  }
  // chín: thu hoạch
  const cap = storage();
  if (S.goods >= cap) { toast('Kho đã đầy! Xây thêm Kho hàng, cấp hàng cho cửa hàng hoặc bán bớt ở chợ'); sfx.bad(); return true; }
  if (!useEnergy()) return true;
  const full = Math.round(c.yield * (st.bug ? 1 - BUG_LOSS : 1)), got = Math.min(full, cap - S.goods);
  S.goods += got; S.stats.harvest++;
  floatAt(b, '+' + got + '📦' + (st.bug ? ' (sâu ăn ' + BUG_LOSS * 100 + '%)' : ''), st.bug ? '#ffd6a5' : '#d8f3dc');
  clearFarm(b); sfx.pop(); addXp(c.xp);
  return true;
}
function clearFarm(b) { b.crop = null; b.watered = false; b.bugAt = 0; b.plantedAt = 0; }
function plant(b, id) {
  const c = CROP[id], now = Date.now();
  if (S.level < c.lvl) return;
  if (S.coins < c.cost) { toast('Không đủ xu!'); sfx.bad(); return; }
  if (!useEnergy()) return;
  S.coins -= c.cost; b.crop = id; b.plantedAt = now; b.readyAt = now + c.time * 1000; b.watered = false;
  b.bugAt = Math.random() < .45 ? now + c.time * 1000 * (.2 + Math.random() * .45) : 0;
  if (isRaining()) waterCrop(b, now);
  floatAt(b, c.icon + ' Đã gieo'); sfx.pop(); closeModal();
}
function upgrade(b) {
  const d = DEFS[b.type], cost = upgradeCost(b);
  if (!b.done || (b.lv || 1) >= MAX_LV || !(d.cat === 'house' || d.cat === 'shop')) return;
  if (S.coins < cost) { toast('Không đủ xu để nâng cấp!'); sfx.bad(); return; }
  S.coins -= cost; b.lv = (b.lv || 1) + 1; S.stats.upgrade++;
  floatAt(b, '⬆️ Cấp ' + b.lv, '#ffe066'); sfx.win(); addXp(Math.max(2, Math.round(cost / 30)));
}
function sell(b) {
  const d = DEFS[b.type], refund = Math.floor(d.cost / 2);
  S.buildings.splice(S.buildings.indexOf(b), 1);
  if (selected === b) selected = null;
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
  if (d.cat === 'ranch') {
    const it = ITEMS[d.out];
    if (!b.fed) return { icon: '🌾', text: `Vật nuôi đói — chạm để cho ăn (${d.feed} 📦, 1⚡)` };
    return now >= b.readyAt ? { icon: it.icon, text: `Chạm để thu ${d.n} ${it.name}` } : { text: `Đang cho ${it.name.toLowerCase()}, còn ${fmtTime((b.readyAt - now) / 1000)}` };
  }
  if (d.cat === 'factory') {
    if (!b.job) return { icon: '⚙️', text: 'Nhà máy đang nghỉ — chạm để chọn sản phẩm' };
    const it = ITEMS[b.job];
    return now >= b.readyAt ? { icon: it.icon, text: `${it.name} đã xong — chạm để lấy` } : { text: `Đang làm ${it.name}, còn ${fmtTime((b.readyAt - now) / 1000)}` };
  }
  if (b.type === 'farm') {
    const st = farmInfo(b, now);
    if (st.state === 'empty') return { icon: '🌱', text: 'Ruộng trống — chạm để gieo trồng' };
    const c = CROP[b.crop];
    if (st.state === 'dead') return { icon: '🥀', text: `${c.name} đã héo — chạm để dọn hoặc hồi sinh` };
    if (st.state === 'ripe') return { icon: c.icon, text: `Thu hoạch ${c.name} ngay — héo sau ${fmtTime(st.left / 1000)}` + (st.bug ? ' · bị sâu ăn' : '') };
    const left = `${c.name} chín sau ${fmtTime(st.left / 1000)}`;
    if (st.bug) return { icon: '🐛', text: left + ' — có sâu, chạm để bắt!' };
    if (!b.watered) return { icon: '💧', text: left + ' — chạm để tưới (1⚡)' };
    return { text: left + ' · đã tưới' };
  }
  if (d.happy) return { text: `+${d.happy} hạnh phúc` + (d.bonus ? ` · +${d.bonus}% thu nhập quanh đây` : '') };
  if (d.store) return { text: `+${d.store} sức chứa kho` };
  return { text: b.type === 'road' ? 'Nhà và cửa hàng cần kề đường' : '' };
}

// ───────────────────────── Giao diện ─────────────────────────
const mode = { name: 'idle', type: null };
let moving = null, moveFrom = null, hover = null, selected = null;
let shopTab = 'house', cropFarm = null, witherFarm = null, sellTarget = null, factoryTarget = null, marketTab = 'goods';

function setMode(name, type) {
  if (moving) { moving.x = moveFrom.x; moving.y = moveFrom.y; moving = null; rebuildGrid(); }
  mode.name = name; mode.type = type || null; selected = null;
  document.querySelectorAll('#toolbar button').forEach(b => b.classList.toggle('on', b.dataset.act === name));
  const txt = { place: () => `Đang xây: ${DEFS[type].name} (🪙 ${fmt(DEFS[type].cost)}) — chạm vào ô đất để đặt`,
                move: () => 'Di chuyển: chạm công trình rồi chạm vị trí mới', sell: () => 'Phá dỡ: chạm công trình để bán lại (hoàn 50%)' }[name];
  $('banner').classList.toggle('hidden', !txt);
  if (txt) $('banner-text').textContent = txt();
}
function pickUp(b) { setMode('move'); moving = b; moveFrom = { x: b.x, y: b.y }; rebuildGrid(); sfx.pop(); }

function openModal(title, html, center, tabs) {
  $('modal-box').innerHTML = `<div class="m-head"><span>${title}</span><button data-close>✕</button></div>${tabs || ''}<div class="m-body ${center ? 'center' : ''}">${html}</div>`;
  $('modal').classList.remove('hidden');
}
function closeModal() { $('modal').classList.add('hidden'); cropFarm = null; witherFarm = null; factoryTarget = null; }

function statLine(d) {
  if (d.cat === 'house') return `👥 +${d.pop} · 🪙 ${fmt(d.earn)} / ${fmtTime(d.time)}`;
  if (d.cat === 'shop') return `📦 ${d.need} → 🪙 ${fmt(d.earn)} / ${fmtTime(d.time)}`;
  if (d.cat === 'ranch') return `${d.feed}📦 → ${d.n} ${ITEMS[d.out].icon} / ${fmtTime(d.time)}`;
  if (d.cat === 'factory') return 'Làm ra: ' + d.recipes.map(r => ITEMS[r].icon + ' ' + ITEMS[r].name).join(', ');
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
      <img src="${View.thumb(d.id)}" width="88" height="88" alt=""><div class="nm">${d.name}</div>
      <div class="st">${statLine(d)}</div><div class="pr">${lock ? '🔒 Cấp ' + d.lvl : '🪙 ' + fmt(d.cost)}</div></div>`;
  }).join('');
  openModal('Xây dựng', `<div class="grid">${cards}</div>`, false, tabs);
}
function openCrops(b) {
  const cards = CROPS.map(c => {
    const lock = S.level < c.lvl;
    return `<div class="card ${lock ? 'lock' : S.coins < c.cost ? 'poor' : ''}" data-crop="${c.id}">
      <div class="ico">${c.icon}</div><div class="nm">${c.name}</div>
      <div class="st">📦 +${c.yield} · ⏱ ${fmtTime(c.time)}<br>🥀 héo sau ${fmtTime(witherMs(c) / 1000)}</div><div class="pr">${lock ? '🔒 Cấp ' + c.lvl : '🪙 ' + c.cost}</div></div>`;
  }).join('');
  openModal('Gieo trồng', `<p class="hint">💧 Tưới nước giúp cây lớn nhanh hơn ${WATER_BOOST * 100}%. 🐛 Bắt sâu kịp thời, nếu không sẽ mất ${BUG_LOSS * 100}% sản lượng. 🥀 Cây chín để quá lâu sẽ héo!</p><div class="grid">${cards}</div>`);
  cropFarm = b;
}
const MARKET = { sell: 1.5, buy: 8 };
const needSpan = (ok, txt) => `<span class="${ok ? 'ok' : 'miss'}">${txt}</span>`;
function openFactory(b) {
  const d = DEFS[b.type];
  const cards = d.recipes.map(id => {
    const r = RECIPES[id], it = ITEMS[id], ok = recipeOk(r);
    const need = Object.entries(r.in).map(([k, n]) => needSpan(have(k) >= n, `${ITEMS[k].icon} ${have(k)}/${n}`))
      .concat(r.goods ? [needSpan(S.goods >= r.goods, `📦 ${fmt(S.goods)}/${r.goods}`)] : []).join(' ');
    return `<div class="card ${ok ? '' : 'poor'}" data-recipe="${id}"><div class="ico">${it.icon}</div>
      <div class="nm">${r.n} ${it.name}</div><div class="st">${need}<br>⏱ ${fmtTime(r.time)} · bán 🪙 ${fmt(it.price)}</div>
      <div class="pr">${ok ? 'Sản xuất (1⚡)' : 'Thiếu nguyên liệu'}</div></div>`;
  }).join('');
  openModal(d.name, `<p class="hint">Chọn sản phẩm để làm. Nguyên liệu lấy từ 🐄 chuồng trại, 📦 nông sản và các nhà máy khác. Thành phẩm bán ở 🧺 Chợ hoặc giao theo đơn hàng.</p><div class="grid">${cards}</div>`);
  factoryTarget = b;
}
function openMarket(tab) {
  marketTab = tab || marketTab;
  const tabs = `<div class="tabs">${[['goods', '🧺 Nông sản'], ['items', '🏷️ Kho sản phẩm'], ['orders', '🚚 Đơn hàng']]
    .map(([k, n]) => `<button data-mtab="${k}" class="${k === marketTab ? 'on' : ''}">${n}</button>`).join('')}</div>`;
  let html;
  if (marketTab === 'goods') {
    const cap = storage();
    const row = (kind, n) => {
      const price = Math.round(n * MARKET[kind]);
      const ok = kind === 'sell' ? S.goods >= n : S.coins >= price && S.goods + n <= cap;
      return `<button class="btn ${kind === 'sell' ? '' : 'alt2'}" data-do="mkt" data-kind="${kind}" data-n="${n}" ${ok ? '' : 'disabled'}>${kind === 'sell' ? 'Bán' : 'Mua'} ${n} 📦 ${kind === 'sell' ? '→ +' : '← −'}🪙 ${fmt(price)}</button>`;
    };
    html = `<div class="center"><div class="big">🧺</div><p>Kho: <b>${fmt(S.goods)}/${fmt(cap)}</b> 📦 · Xu: <b>${fmt(S.coins)}</b> 🪙</p>
      <p>${row('sell', 10)}${row('sell', 50)}${row('sell', 200)}</p><p>${row('buy', 10)}${row('buy', 50)}${row('buy', 200)}</p>
      <p class="hint">Bán nông sản thừa khi kho đầy, hoặc mua gấp khi cửa hàng và vật nuôi thiếu.</p></div>`;
  } else if (marketTab === 'items') {
    const ids = Object.keys(ITEMS).filter(id => have(id) > 0);
    html = ids.length ? `<div class="grid">${ids.map(id => `<div class="card"><div class="ico">${ITEMS[id].icon}</div>
      <div class="nm">${ITEMS[id].name}</div><div class="st">Có: <b>${have(id)}</b> · 🪙 ${fmt(ITEMS[id].price)}/cái</div>
      <div><button class="btn sm" data-do="sellitem" data-id="${id}" data-n="1">Bán 1</button><button class="btn sm" data-do="sellitem" data-id="${id}" data-n="all">Bán hết</button></div></div>`).join('')}</div>`
      : '<p class="center">Kho sản phẩm đang trống. Hãy xây 🐄 chuồng trại và 🏭 nhà máy chế biến!</p>';
  } else {
    refreshOrders();
    const first = Math.min(...Object.values(ITEM_LVL));
    html = !S.orders.length ? `<p class="center">🚚 Đơn hàng mở khóa ở cấp ${first}, khi có thể xây chuồng trại.</p>`
      : '<p class="hint">Giao đủ hàng để nhận nhiều xu hơn bán lẻ ở chợ. Không thích đơn nào thì đổi đơn khác.</p>' + S.orders.map((o, i) => `<div class="quest ${orderOk(o) ? 'cur' : ''}"><b>🚚 Đơn hàng ${i + 1}</b>
        <div>${Object.entries(o.items).map(([k, n]) => needSpan(have(k) >= n, `${ITEMS[k].icon} ${ITEMS[k].name} ${have(k)}/${n}`)).join(' · ')}</div>
        <div class="rw">Thưởng: 🪙 ${fmt(o.coins)} · ⭐ ${o.xp} XP</div>
        <button class="btn" data-do="order" data-i="${i}" ${orderOk(o) ? '' : 'disabled'}>Giao hàng</button><button class="btn alt" data-do="skiporder" data-i="${i}">Đổi đơn khác</button></div>`).join('');
  }
  openModal('Chợ', html, false, tabs);
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
  const tg = (key, on, label) => `<button class="btn alt" data-do="toggle" data-key="${key}">${on ? '✅' : '⬜'} ${label}</button>`;
  openModal('Cài đặt & Hướng dẫn', `<ul class="help">
    <li>🏠 <b>Nhà ở</b> tăng dân số và cho thu tiền thuê định kỳ. 🏪 <b>Cửa hàng</b> cần 📦 hàng hóa để mở bán.</li>
    <li>🌾 <b>Ruộng</b>: gieo hạt → 💧 tưới nước (lớn nhanh hơn ${WATER_BOOST * 100}%) → 🐛 bắt sâu → thu hoạch. Cây chín để quá lâu sẽ 🥀 <b>héo</b>; mưa sẽ tưới giúp bạn.</li>
    <li>⬆️ Chọn nhà hoặc cửa hàng để <b>nâng cấp</b> (tối đa cấp ${MAX_LV}, mỗi cấp +50% thu nhập và dân số).</li>
    <li>🐄 <b>Chăn nuôi</b>: cho vật nuôi ăn bằng 📦 nông sản, chờ rồi thu trứng, sữa, len.</li>
    <li>🏭 <b>Nhà máy chế biến</b>: biến trứng, sữa, len thành bánh mì, phô mai, áo len, bánh kem… có giá trị cao hơn.</li>
    <li>🧺 <b>Chợ</b>: mua bán nông sản, bán sản phẩm, và giao 🚚 <b>đơn hàng</b> để nhận nhiều xu và XP.</li>
    <li>🛣️ Nhà và cửa hàng phải <b>kề đường</b>. 🌳 Trang trí và công trình công cộng tăng 😊 hạnh phúc và thu nhập.</li>
    <li>⚡ Mỗi thao tác tốn 1 năng lượng, hồi dần theo thời gian.</li>
    <li>🎥 <b>Góc nhìn 3D</b>: kéo để di chuyển · chuột phải (hoặc Shift) + kéo để xoay/nghiêng · lăn chuột để thu phóng · trên điện thoại chụm/xoay hai ngón · phím Q/E xoay, mũi tên di chuyển.</li></ul>
    <div class="center">${tg('sound', !S.mute, 'Âm thanh')}${tg('dayNight', S.dayNight !== false, 'Ngày và đêm')}${tg('shadows', S.shadows !== false, 'Đổ bóng')}
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

let infoBtns = '';
function updateHud() {
  tickEnergy(); tickWeather();
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
  $('m-badge').classList.toggle('hidden', !S.orders.some(orderOk));
  const inf = $('info');
  if (mode.name === 'idle' && selected && S.buildings.includes(selected)) {
    const b = selected, d = DEFS[b.type], st = statusOf(b), lv = b.lv || 1, up = d.cat === 'house' || d.cat === 'shop';
    const bn = up ? decoBonus(b) : 0;
    $('info-text').innerHTML = `<b>${d.name}${up ? ' ' + '⭐'.repeat(lv) : ''}</b><div class="sub">${st.text}${bn ? ` · Trang trí +${bn}%` : ''}</div>`;
    let btns = '';
    if (up && b.done && lv < MAX_LV) btns += `<button data-info="up" class="${S.coins < upgradeCost(b) ? 'poor' : ''}">⬆️ Nâng cấp · 🪙 ${fmt(upgradeCost(b))}</button>`;
    btns += '<button data-info="move">✋ Di chuyển</button><button data-info="sell">🧹 Phá dỡ</button>';
    if (btns !== infoBtns) { infoBtns = btns; $('info-btns').innerHTML = btns; }
    inf.classList.remove('hidden');
  } else inf.classList.add('hidden');
}

// ───────────────────────── Nhập liệu ─────────────────────────
function confirmSell(b) {
  const d = DEFS[b.type];
  if (b.type === 'road' || d.cost <= 100) return sell(b);
  sellTarget = b;
  openModal('Phá dỡ', `<p>Phá dỡ <b>${d.name}</b> và nhận lại 🪙 ${fmt(Math.floor(d.cost / 2))}?${(b.lv || 1) > 1 ? ' Tiền nâng cấp sẽ không được hoàn lại.' : ''}</p>
    <button class="btn red" data-do="sell">Phá dỡ</button><button class="btn alt" data-close>Hủy</button>`, true);
}
function tap(sx, sy) {
  const placing = mode.name === 'place' || (mode.name === 'move' && moving);
  const p = View.pick(sx, sy, placing), t = p.tile;
  const inside = t.x >= 0 && t.y >= 0 && t.x < WORLD && t.y < WORLD;
  const b = p.b || (inside ? grid[t.x][t.y] : null);
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
  if (mode.name === 'sell') { if (b) confirmSell(b); return; }
  if (!b) { selected = null; if (inside && !unlocked(t.x, t.y)) toast('Vùng đất chưa mở — dùng 🗺️ Mở đất'); return; }
  selected = b;
  act(b);
}

const cv = $('game');
const ptrs = new Map();
let drag = null, pinch = null;
const pinchOf = () => { const [a, b] = [...ptrs.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, a: Math.atan2(b.y - a.y, b.x - a.x) }; };
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 1) drag = { sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, moved: false, rot: e.button === 2 || e.shiftKey };
  else if (ptrs.size === 2) { pinch = pinchOf(); if (drag) drag.moved = true; }
});
cv.addEventListener('pointermove', e => {
  if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 2 && pinch) {
    const n = pinchOf();
    View.zoomBy(n.d / pinch.d);
    let da = n.a - pinch.a; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
    View.rotate(-da, 0);
    pinch = n; return;
  }
  if (drag && ptrs.size === 1) {
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 7) drag.moved = true;
    if (drag.moved) {
      if (drag.rot) View.rotate(-(e.clientX - drag.lx) * .008, (e.clientY - drag.ly) * .006);
      else View.pan(drag.lx, drag.ly, e.clientX, e.clientY);
    }
    drag.lx = e.clientX; drag.ly = e.clientY;
  }
  if (e.pointerType === 'mouse') hover = View.pick(e.clientX, e.clientY, true).tile;
});
function ptrEnd(e) {
  const had = ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinch = null;
  if (had && ptrs.size === 0 && drag) {
    if (!drag.moved && !drag.rot && e.type === 'pointerup') {
      if (e.pointerType !== 'mouse') hover = null;
      tap(e.clientX, e.clientY); updateHud();
    }
    drag = null;
  } else if (ptrs.size === 1 && drag) { const p = [...ptrs.values()][0]; drag = { sx: p.x, sy: p.y, lx: p.x, ly: p.y, moved: true, rot: false }; }
}
cv.addEventListener('pointerup', ptrEnd);
cv.addEventListener('pointercancel', ptrEnd);
cv.addEventListener('pointerleave', () => { hover = null; });
cv.addEventListener('wheel', e => { e.preventDefault(); View.zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'escape') { closeModal(); setMode('idle'); }
  else if (k === 'q') View.rotate(-.2, 0); else if (k === 'e') View.rotate(.2, 0);
  else if (k === 'arrowleft' || k === 'a') View.panBy(-1, 0); else if (k === 'arrowright' || k === 'd') View.panBy(1, 0);
  else if (k === 'arrowup' || k === 'w') View.panBy(0, 1); else if (k === 'arrowdown' || k === 's') View.panBy(0, -1);
});

$('camctl').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  ({ l: () => View.rotate(-Math.PI / 8, 0), r: () => View.rotate(Math.PI / 8, 0), up: () => View.rotate(0, .15), down: () => View.rotate(0, -.15),
     in: () => View.zoomBy(1.25), out: () => View.zoomBy(.8), reset: () => View.resetCam() })[b.dataset.cam]();
});
$('toolbar').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const a = b.dataset.act;
  if (a === 'shop') { setMode('idle'); openShop(); }
  else if (a === 'move' || a === 'sell') setMode(mode.name === a ? 'idle' : a);
  else if (a === 'quests') openQuests();
  else if (a === 'market') openMarket();
  else if (a === 'expand') openExpand();
  else if (a === 'menu') openMenu();
});
$('info-btns').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !selected) return;
  const t = selected;
  if (b.dataset.info === 'up') upgrade(t);
  else if (b.dataset.info === 'move') pickUp(t);
  else if (b.dataset.info === 'sell') confirmSell(t);
  updateHud(); save();
});
$('banner-done').addEventListener('click', () => setMode('idle'));
$('tracker').addEventListener('click', () => { const q = QUESTS[S.quest]; if (q && questProg(q) >= q.n) claimQuest(); else openQuests(); });
$('h-energy-pill').addEventListener('click', askEnergy);
$('h-goods-pill').addEventListener('click', () => openMarket('goods'));
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
  const mt = t.closest('[data-mtab]'); if (mt) return openMarket(mt.dataset.mtab);
  const rec = t.closest('[data-recipe]'); if (rec && factoryTarget) { startJob(factoryTarget, rec.dataset.recipe); updateHud(); save(); return; }
  const crop = t.closest('[data-crop]'); if (crop && cropFarm) { plant(cropFarm, crop.dataset.crop); updateHud(); return; }
  const el = t.closest('[data-do]'); if (!el || el.disabled) return;
  switch (el.dataset.do) {
    case 'claim': claimQuest(); break;
    case 'refill': if (S.gems >= 3) { S.gems -= 3; S.energy = maxEnergy(); sfx.win(); closeModal(); } break;
    case 'sell': if (sellTarget && S.buildings.includes(sellTarget)) sell(sellTarget); sellTarget = null; closeModal(); break;
    case 'clear': { const f = witherFarm; if (f && useEnergy()) { clearFarm(f); sfx.pop(); closeModal(); } break; }
    case 'revive': { const f = witherFarm; if (f && f.crop && S.gems >= 1) { S.gems--; f.readyAt = Date.now() - 1; f.bugAt = 0; floatAt(f, '✨ Hồi sinh!', '#d8f3dc'); sfx.win(); closeModal(); } break; }
    case 'mkt': {
      const n = +el.dataset.n, kind = el.dataset.kind, price = Math.round(n * MARKET[kind]);
      if (kind === 'sell' && S.goods >= n) { S.goods -= n; S.coins += price; sfx.coin(); }
      else if (kind === 'buy' && S.coins >= price && S.goods + n <= storage()) { S.goods += n; S.coins -= price; sfx.pop(); }
      openMarket('goods'); break;
    }
    case 'sellitem': {
      const id = el.dataset.id, n = el.dataset.n === 'all' ? have(id) : Math.min(+el.dataset.n, have(id));
      if (n > 0) { S.items[id] -= n; S.coins += n * ITEMS[id].price; sfx.coin(); }
      openMarket('items'); break;
    }
    case 'order': {
      const i = +el.dataset.i, o = S.orders[i];
      if (o && orderOk(o)) {
        for (const [k, n] of Object.entries(o.items)) S.items[k] -= n;
        S.coins += o.coins; S.stats.orders++; S.orders.splice(i, 1);
        sfx.win(); toast(`🚚 Đã giao hàng: +${fmt(o.coins)} xu`);
        openMarket('orders'); addXp(o.xp);
      }
      break;
    }
    case 'skiporder': S.orders.splice(+el.dataset.i, 1); openMarket('orders'); break;
    case 'expand': { const x = expandInfo(); if (!x.max && S.level >= x.lvl && S.coins >= x.cost) { S.coins -= x.cost; S.land += 2; S.stats.expand++; sfx.win(); toast('Đã mở rộng đất!'); closeModal(); } break; }
    case 'toggle': { const k = el.dataset.key; if (k === 'sound') S.mute = !S.mute; else S[k] = S[k] === false; openMenu(); break; }
    case 'reset': openModal('Chơi lại', '<p>Xóa toàn bộ thành phố và bắt đầu lại?</p><button class="btn red" data-do="reset2">Xóa và chơi lại</button><button class="btn alt" data-close>Hủy</button>', true); break;
    case 'reset2': moving = null; S = newState(); rebuildGrid(); closeModal(); setMode('idle'); View.resetCam(); break;
  }
  updateHud(); save();
});

// ───────────────────────── Khởi động ─────────────────────────
S = load();
rebuildGrid();
if (!View.init(cv)) {
  openModal('Không hỗ trợ 3D', '<p>Trình duyệt của bạn chưa bật WebGL nên không thể hiển thị thành phố 3D. Hãy thử trình duyệt khác hoặc bật tăng tốc phần cứng.</p>', true);
} else {
  tickEnergy();
  updateHud();
  checkDaily();
  setInterval(updateHud, 500);
  setInterval(save, 5000);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  (function loop() { View.frame(); requestAnimationFrame(loop); })();
}

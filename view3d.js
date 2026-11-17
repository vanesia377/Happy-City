/* Chill City — lớp hiển thị 3D (Three.js). Đọc trạng thái game từ game.js. */
'use strict';

const View = (() => {
  const HS = 0.8; // hệ số chiều cao
  let renderer, scene, camera, sun, hemi, W = 1, H = 1;
  let G = null, ghost = false; // nhóm đang dựng
  const bGroup = new THREE.Group(), bubbleGroup = new THREE.Group(), carGroup = new THREE.Group();
  const vis = new Map(); // id -> { b, key, group, bubble, icon }
  const cam = { tx: 12, tz: 12, yaw: Math.PI / 4, pitch: .78, dist: 20 };

  // ───── hình khối dùng chung ─────
  const GEO = {
    box: new THREE.BoxGeometry(1, 1, 1),
    pyr: (() => { const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4); g.rotateY(Math.PI / 4); g.translate(0, .5, 0); return g; })(),
    prism: (() => {
      const sh = new THREE.Shape(); sh.moveTo(-.5, 0); sh.lineTo(.5, 0); sh.lineTo(0, 1); sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -.5); g.rotateY(Math.PI / 2); return g;
    })(),
    ball: new THREE.IcosahedronGeometry(1, 1),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 10),
    cone: new THREE.ConeGeometry(1, 1, 8),
    plane: (() => { const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g; })(),
    ring: new THREE.TorusGeometry(1, .04, 6, 28),
  };
  const mats = new Map();
  function mat(col, basic) {
    const k = col + (ghost ? 'g' : '') + (basic ? 'b' : '');
    let m = mats.get(k);
    if (!m) {
      m = basic ? new THREE.MeshBasicMaterial({ color: col }) : new THREE.MeshLambertMaterial({ color: col, flatShading: true });
      if (ghost) { m.transparent = true; m.opacity = .6; }
      mats.set(k, m);
    }
    return m;
  }
  function canvasTex(w, h, draw, key) {
    let t = mats.get(key);
    if (t) return t;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    mats.set(key, t); return t;
  }
  function wallMat(wall, win, cols, floors, door, shop) {
    const key = ['w', wall, win, cols, floors, door, shop].join();
    let m = mats.get(key);
    if (m) return m;
    const cw = 32, fh = 40;
    const tex = canvasTex(cols * cw, floors * fh, (c, w, h) => {
      c.fillStyle = wall; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(0,0,0,.06)'; for (let f = 1; f < floors; f++) c.fillRect(0, f * fh - 1, w, 2);
      for (let f = 0; f < floors; f++) for (let i = 0; i < cols; i++) {
        const y = h - (f + 1) * fh, isDoor = door && f === 0 && i === Math.floor(cols / 2);
        if (isDoor) { c.fillStyle = '#7f5539'; c.fillRect(i * cw + 9, y + 9, 14, fh - 9); c.fillStyle = '#e9c46a'; c.fillRect(i * cw + 19, y + 24, 2, 3); continue; }
        c.fillStyle = 'rgba(60,40,30,.45)';
        if (shop) { c.fillRect(i * cw + 3, y + 11, cw - 6, 19); c.fillStyle = win; c.fillRect(i * cw + 4, y + 12, cw - 8, 17); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(i * cw + 6, y + 13, 5, 15); }
        else { c.fillRect(i * cw + 8, y + 8, 16, 20); c.fillStyle = win; c.fillRect(i * cw + 9, y + 9, 14, 18); c.fillStyle = 'rgba(60,40,30,.35)'; c.fillRect(i * cw + 15, y + 9, 1, 18); c.fillRect(i * cw + 9, y + 17, 14, 1); }
      }
    }, key + 't');
    m = new THREE.MeshLambertMaterial({ map: tex });
    mats.set(key, m); return m;
  }
  function stripeMat(col, rep) {
    const key = 's' + col + rep;
    let m = mats.get(key);
    if (m) return m;
    const tex = canvasTex(8 * rep * 2, 8, (c, w, h) => { for (let i = 0; i < w / 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : col; c.fillRect(i * 8, 0, 8, h); } }, key + 't');
    m = new THREE.MeshLambertMaterial({ map: tex }); mats.set(key, m); return m;
  }
  function roadMat(mask) {
    const key = 'r' + mask;
    let m = mats.get(key);
    if (m) return m;
    const tex = canvasTex(64, 64, c => {
      c.fillStyle = '#7d8597'; c.fillRect(0, 0, 64, 64);
      c.fillStyle = '#6c7486'; for (let i = 0; i < 30; i++) c.fillRect((i * 37) % 64, (i * 53) % 64, 2, 2);
      c.strokeStyle = '#f8f9fa'; c.lineWidth = 3; c.setLineDash([7, 6]);
      const ends = [[64, 32], [0, 32], [32, 64], [32, 0]]; // +x, -x, +z, -z
      let any = false;
      ends.forEach((e, i) => { if (mask >> i & 1) { c.beginPath(); c.moveTo(32, 32); c.lineTo(e[0], e[1]); c.stroke(); any = true; } });
      if (!any) { c.fillStyle = '#f8f9fa'; c.fillRect(29, 29, 6, 6); }
    }, key + 't');
    m = new THREE.MeshLambertMaterial({ map: tex }); mats.set(key, m); return m;
  }
  function emojiMat(ch, bubble) {
    const key = 'e' + ch + (bubble ? 'b' : '');
    let m = mats.get(key);
    if (m) return m;
    const tex = canvasTex(96, 96, c => {
      if (bubble) { c.beginPath(); c.arc(48, 48, 42, 0, 7); c.fillStyle = 'rgba(255,255,255,.96)'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#e9c46a'; c.stroke(); }
      c.font = (bubble ? 50 : 72) + 'px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, 48, 52);
    }, key + 't');
    m = new THREE.SpriteMaterial({ map: tex, transparent: true }); mats.set(key, m); return m;
  }

  function add(geo, m, sx, sy, sz, x, y, z) {
    const me = new THREE.Mesh(geo, m);
    me.scale.set(sx, sy, sz); me.position.set(x, y, z);
    me.castShadow = me.receiveShadow = !ghost;
    G.add(me); return me;
  }
  const box = (x0, y0, x1, y1, z0, z1, col) => add(GEO.box, typeof col === 'string' ? mat(col) : col, x1 - x0, (z1 - z0) * HS, y1 - y0, (x0 + x1) / 2, (z0 + z1) / 2 * HS, (y0 + y1) / 2);
  const gable = (x0, y0, x1, y1, z0, z1, col) => add(GEO.prism, mat(col), x1 - x0, (z1 - z0) * HS, y1 - y0, (x0 + x1) / 2, z0 * HS, (y0 + y1) / 2);
  const pyr = (x0, y0, x1, y1, z0, z1, col) => add(GEO.pyr, mat(col), x1 - x0, (z1 - z0) * HS, y1 - y0, (x0 + x1) / 2, z0 * HS, (y0 + y1) / 2);
  const ball = (x, y, z, r, col, sq = 1) => add(GEO.ball, mat(col), r, r * sq, r, x, z * HS, y);
  const cyl = (x, y, z0, z1, r, col) => add(GEO.cyl, mat(col), r, (z1 - z0) * HS, r, x, (z0 + z1) / 2 * HS, y);
  const cone = (x, y, z0, z1, r, col) => add(GEO.cone, mat(col), r, (z1 - z0) * HS, r, x, (z0 + z1) / 2 * HS, y);
  function flat(x0, y0, x1, y1, z, col) {
    const me = add(GEO.plane, typeof col === 'string' ? mat(col) : col, x1 - x0, 1, y1 - y0, (x0 + x1) / 2, z * HS + .004, (y0 + y1) / 2);
    me.castShadow = false; return me;
  }
  function sign(x, y, z, ch, size, bubble) {
    const sp = new THREE.Sprite(emojiMat(ch, bubble));
    sp.scale.set(size, size, 1); sp.position.set(x, z * HS, y); G.add(sp); return sp;
  }
  function walls(x0, y0, x1, y1, z0, z1, wall, win, cols, floors, shop) {
    if (ghost) return box(x0, y0, x1, y1, z0, z1, wall);
    const side = wallMat(wall, win, cols, floors, false, shop), top = mat(wall);
    return box(x0, y0, x1, y1, z0, z1, [side, side, top, top, wallMat(wall, win, cols, floors, true, shop), side]);
  }
  function tree(x, y, sc = 1, col = '#52b788') {
    cyl(x, y, 0, .45 * sc, .05 * sc, '#8d6e63');
    ball(x, y, .7 * sc, .27 * sc, col);
    ball(x + .05 * sc, y - .04 * sc, 1.0 * sc, .19 * sc, col);
  }
  const UP = new THREE.Vector3(0, 1, 0);
  function beam(a, b, r, col) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), d = vb.clone().sub(va);
    const me = add(GEO.cyl, mat(col), r, d.length(), r, (va.x + vb.x) / 2, (va.y + vb.y) / 2, (va.z + vb.z) / 2);
    me.quaternion.setFromUnitVectors(UP, d.normalize()); return me;
  }

  // ───── kiểu công trình ─────
  function plantMesh(x, y, c, st) {
    const z = .13;
    if (st.state === 'dead') { ball(x, y, z + .05, .09, '#8a7560', .5); cyl(x, y, z, z + .16, .012, '#6b5b4a'); return; }
    const g = st.state === 'ripe' ? 3 : st.stage, green = '#52b788', dark = '#2d6a4f';
    if (g < 3) {
      const r = .05 + g * .03;
      if (c.shape === 'tall') { cyl(x, y, z, z + .15 + g * .16, .018, green); ball(x, y, z + .17 + g * .16, r * .8, green); }
      else ball(x, y, z + r * .8, r, green, .8);
      return;
    }
    switch (c.shape) {
      case 'leaf': ball(x, y, z + .1, .14, c.color, .75); ball(x, y, z + .15, .08, '#d8f3dc', .8); break;
      case 'root': add(GEO.cone, mat(c.color), .06, .16, .06, x, z * HS + .04, y).rotation.x = Math.PI; cone(x, y, z + .1, z + .34, .09, green); break;
      case 'tall': cyl(x, y, z, z + .62, .022, green); cyl(x, y, z + .3, z + .52, .05, c.color); cone(x, y, z + .55, z + .75, .07, c.top || dark); break;
      case 'berry': ball(x, y, z + .1, .12, dark, .75); ball(x + .08, y + .05, z + .1, .05, c.color); ball(x - .07, y + .07, z + .08, .045, c.color); ball(x, y - .09, z + .12, .045, c.color); break;
      default: ball(x, y, z + .13, .16, c.color, .85); ball(x + .14, y - .1, z + .04, .07, green, .4);
    }
  }

  // ───── vật nuôi & hàng rào ─────
  function fence(x0, y0, x1, y1, col = '#e9d8a6') {
    const h0 = .12, h1 = .22, t = .025;
    box(x0, y0 - t, x1, y0 + t, h0, h0 + .04, col); box(x0, y1 - t, x1, y1 + t, h0, h0 + .04, col);
    box(x0 - t, y0, x0 + t, y1, h0, h0 + .04, col); box(x1 - t, y0, x1 + t, y1, h0, h0 + .04, col);
    const n = 4;
    for (let i = 0; i <= n; i++) {
      const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
      for (const [px, py] of [[x, y0], [x, y1], [x0, y], [x1, y]]) box(px - .03, py - .03, px + .03, py + .03, 0, h1 + .05, col);
    }
  }
  function animal(kind, x, y) {
    const grp = new THREE.Group(), root = G; G = grp;
    if (kind === 'chicken') {
      ball(0, 0, .13, .09, '#ffffff', .85); ball(.08, 0, .24, .055, '#ffffff');
      box(.07, -.012, .1, .012, .29, .33, '#e63946'); box(.13, -.015, .16, .015, .22, .25, '#ffb703');
      box(-.02, -.04, 0, -.02, 0, .07, '#ffb703'); box(-.02, .02, 0, .04, 0, .07, '#ffb703');
    } else if (kind === 'cow') {
      for (const [lx, ly] of [[-.14, -.07], [-.14, .07], [.12, -.07], [.12, .07]]) box(lx - .03, ly - .03, lx + .03, ly + .03, 0, .2, '#3d405b');
      box(-.21, -.11, .19, .11, .2, .44, '#ffffff'); box(-.08, -.115, .07, .115, .27, .4, '#2b2d42');
      box(.17, -.08, .33, .08, .32, .5, '#ffffff'); box(.3, -.065, .37, .065, .32, .41, '#ffb3c6');
      box(.2, -.11, .24, -.08, .48, .55, '#f1faee'); box(.2, .08, .24, .11, .48, .55, '#f1faee');
    } else {
      for (const [lx, ly] of [[-.1, -.06], [-.1, .06], [.09, -.06], [.09, .06]]) box(lx - .025, ly - .025, lx + .025, ly + .025, 0, .17, '#2b2d42');
      ball(0, 0, .3, .17, '#f8f9fa', .8); ball(-.09, .05, .36, .1, '#ffffff'); ball(.07, -.05, .37, .1, '#ffffff');
      box(.15, -.055, .27, .055, .3, .43, '#2b2d42');
    }
    G = root; grp.position.set(x, 0, y); grp.rotation.y = Math.random() * 6.28; G.add(grp);
    return grp;
  }
  function wander(list, x0, y0, x1, y1, speed) {
    const st = list.map(a => ({ a, tx: a.position.x, tz: a.position.z, wait: Math.random() * 2000 }));
    let last = 0;
    return t => {
      const dt = last ? Math.min(.1, (t - last) / 1000) : 0; last = t;
      for (const s of st) {
        const p = s.a.position, dx = s.tx - p.x, dz = s.tz - p.z, d = Math.hypot(dx, dz);
        if (d < .02) {
          p.y = 0; s.wait -= dt * 1000;
          if (s.wait <= 0) { s.tx = x0 + Math.random() * (x1 - x0); s.tz = y0 + Math.random() * (y1 - y0); s.wait = 800 + Math.random() * 3000; }
          continue;
        }
        const k = Math.min(d, speed * dt);
        p.x += dx / d * k; p.z += dz / d * k; p.y = Math.abs(Math.sin(t / 90)) * .025;
        s.a.rotation.y = Math.atan2(-dz, dx);
      }
    };
  }
  function trough(x0, y0, x1, y1, full) {
    box(x0, y0, x1, y1, 0, .13, '#9c6644');
    flat(x0 + .03, y0 + .03, x1 - .03, y1 - .03, .135, full ? '#e9c46a' : '#6f4528');
  }

  const STYLES = {
    house(s, o) {
      const a = o.inset ?? .14, b = s - a, h = o.h, win = o.win || '#fff3b0';
      if (s > 1) flat(.04, .04, s - .04, s - .04, .005, '#b7e4a0');
      const floors = Math.max(1, Math.round(h / .5)), n = Math.max(2, Math.round((b - a) * 2.4));
      walls(a, a, b, b, 0, h, o.wall, win, n, floors, false);
      const e = .07;
      if (o.rt === 'gable') { gable(a - e, a - e, b + e, b + e, h, h + o.rh, o.roof); box(a + .15, a + .12, a + .3, a + .27, h, h + o.rh * .95, '#9c6644'); }
      else if (o.rt === 'pyr') pyr(a - e, a - e, b + e, b + e, h, h + o.rh, o.roof);
      else { box(a - .03, a - .03, b + .03, b + .03, h, h + o.rh, o.roof); const m = (a + b) / 2; box(m - .25, m - .25, m + .05, m + .05, h + o.rh, h + o.rh + .2, '#adb5bd'); cyl(b - .2, a + .2, h + o.rh, h + o.rh + .5, .015, '#6c757d'); }
      if (o.sign) sign(s / 2, s / 2, h + o.rh + .5, o.sign, .5 + s * .12);
    },
    shop(s, o) {
      const a = .12, b = s - a, h = o.h, n = Math.max(1, Math.round((b - a) * 1.6));
      walls(a, a, b, b, 0, h, o.wall, o.win || '#caf0f8', n + (n % 2 ? 0 : 1), 1, true);
      box(a - .1, a - .1, b + .1, b + .1, h * .7, h * .78, ghost ? o.roof : stripeMat(o.roof, s * 3));
      box(a - .03, a - .03, b + .03, b + .03, h, h + .1, o.roof);
      sign(s / 2, s / 2, h + .5 + s * .08, o.sign, .5 + s * .14, true);
    },
    road(s, o, b) {
      let mask = 0;
      if (b && b.x != null) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy], i) => { if (isRoad(b.x + dx, b.y + dy)) mask |= 1 << i; });
      flat(0, 0, 1, 1, 0, ghost ? '#7d8597' : roadMat(mask));
    },
    farm(s, o, b) {
      box(.06, .06, s - .06, s - .06, 0, .1, b && b.watered && b.crop ? '#6f4528' : '#9c6644');
      for (let i = 0; i < 4; i++) box(.16, .22 + i * .44, s - .16, .46 + i * .44, .1, .13, b && b.watered && b.crop ? '#5b3a22' : '#7f5539');
      for (const [x, y] of [[.06, .06], [s - .06, .06], [.06, s - .06], [s - .06, s - .06]]) cyl(x, y, 0, .3, .03, '#bc8a5f');
      if (!b || !b.crop) return;
      const c = CROP[b.crop], st = farmInfo(b, Date.now());
      for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) plantMesh(.4 + i * .6, .34 + j * .44, c, st);
    },
    tree() { tree(.5, .5, 1.15); },
    flowers() {
      box(.15, .15, .85, .85, 0, .14, '#bc8a5f'); flat(.2, .2, .8, .8, .14, '#6a994e');
      const cols = ['#ff6b6b', '#ffd166', '#f78fb3', '#ffffff', '#c77dff'];
      for (let i = 0; i < 9; i++) ball(.3 + (i % 3) * .2, .3 + Math.floor(i / 3) * .2, .2, .06, cols[i % 5]);
    },
    lamp() {
      cyl(.5, .5, 0, .08, .09, '#495057'); cyl(.5, .5, 0, 1.1, .025, '#495057');
      add(GEO.ball, mat('#ffe066', true), .09, .09, .09, .5, 1.17 * HS, .5).castShadow = false;
    },
    fountain() {
      cyl(.5, .5, 0, .2, .42, '#dee2e6'); cyl(.5, .5, .2, .21, .36, '#74c0fc'); cyl(.5, .5, .2, .6, .06, '#ced4da'); ball(.5, .5, .64, .08, '#ced4da');
      if (ghost) return;
      const drops = [];
      for (let i = 0; i < 8; i++) { const d = ball(.5, .5, .6, .03, '#a5d8ff'); d.castShadow = false; drops.push(d); }
      G.userData.anim = t => drops.forEach((d, i) => {
        const p = (t / 900 + i / 8) % 1, a = i * 2.4;
        d.position.set(.5 + Math.cos(a) * p * .28, (.66 + Math.sin(p * Math.PI) * .25 - p * .42) * HS, .5 + Math.sin(a) * p * .28);
      });
    },
    park() {
      flat(.05, .05, 1.95, 1.95, .005, '#95d5b2'); flat(.9, .05, 1.1, 1.95, .012, '#e9d8a6'); flat(.05, .9, 1.95, 1.1, .014, '#e9d8a6');
      tree(.45, .45, 1.1, '#40916c'); tree(1.55, .45, .95, '#74c69d'); tree(.45, 1.55, 1.15, '#52b788');
      box(1.3, 1.5, 1.75, 1.62, .1, .16, '#9c6644'); box(1.32, 1.52, 1.36, 1.6, 0, .1, '#6c757d'); box(1.69, 1.52, 1.73, 1.6, 0, .1, '#6c757d');
      cyl(1, 1, 0, .1, .14, '#dee2e6'); ball(1, 1, .18, .08, '#ffd166');
    },
    statue() {
      box(.25, .25, .75, .75, 0, .35, '#ced4da'); cyl(.5, .5, .35, .95, .11, '#e9c46a'); ball(.5, .5, 1.1, .13, '#f4d35e');
      sign(.5, .5, 1.55, '⭐', .3);
    },
    ferris() {
      flat(.1, .1, 1.9, 1.9, .005, '#d8e2dc');
      const cy = 1.45, R = .95;
      for (const z of [.72, 1.28]) { beam([.35, 0, z], [1, cy, z], .035, '#6c757d'); beam([1.65, 0, z], [1, cy, z], .035, '#6c757d'); }
      beam([1, cy, .68], [1, cy, 1.32], .05, '#e63946');
      if (ghost) return;
      const wheel = new THREE.Group(); wheel.position.set(1, cy, 1); G.add(wheel);
      const root = G; G = wheel;
      add(GEO.ring, mat('#e63946'), R, R, 1, 0, 0, 0);
      const cols = ['#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#f78c6b', '#c77dff', '#83c5be', '#ffb703'], cabins = [];
      for (let i = 0; i < 4; i++) add(GEO.box, mat('#adb5bd'), R * 2, .025, .025, 0, 0, 0).rotation.z = i * Math.PI / 4;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; cabins.push(add(GEO.box, mat(cols[i]), .2, .18, .2, Math.cos(a) * R, Math.sin(a) * R, 0)); }
      G = root;
      G.userData.anim = t => { wheel.rotation.z = t / 2500; cabins.forEach(c => { c.rotation.z = -wheel.rotation.z; }); };
    },
    stadium() {
      box(.1, .1, 2.9, 2.9, 0, .45, '#dee2e6');
      box(.1, .1, 2.9, .5, .45, .9, '#e63946'); box(.1, 2.5, 2.9, 2.9, .45, .9, '#e63946');
      box(.1, .5, .5, 2.5, .45, .9, '#f1faee'); box(2.5, .5, 2.9, 2.5, .45, .9, '#f1faee');
      flat(.5, .5, 2.5, 2.5, .455, '#52b788'); flat(1.48, .5, 1.52, 2.5, .46, '#ffffff');
      for (const [x, y] of [[.2, .2], [2.8, .2], [.2, 2.8], [2.8, 2.8]]) { cyl(x, y, .9, 1.6, .03, '#6c757d'); add(GEO.box, mat('#ffe066', true), .2, .12, .2, x, 1.65 * HS, y); }
      sign(1.5, 1.5, 1.1, '⚽', .5);
    },
    coop(s, o, b) {
      flat(.05, .05, s - .05, s - .05, .005, '#b5e48c'); fence(.08, .08, s - .08, s - .08);
      box(.2, .2, 1.0, .85, 0, .55, '#f4e1c1'); gable(.14, .14, 1.06, .91, .55, .95, '#c8553d');
      box(1.0, .4, 1.03, .62, 0, .32, '#7f5539');
      beam([1.02, .02, .5], [1.3, .22 * HS, .5], .03, '#bc8a5f');
      trough(1.3, .25, 1.8, .42, b && b.fed);
      const list = [animal('chicken', 1.4, 1.2), animal('chicken', .7, 1.5), animal('chicken', 1.6, 1.65), animal('chicken', 1.1, 1.0)];
      if (!ghost) G.userData.anim = wander(list, .3, 1.0, 1.8, 1.8, .35);
    },
    barn(s, o, b) {
      flat(.05, .05, s - .05, s - .05, .005, '#b5e48c'); fence(.08, .08, s - .08, s - .08);
      box(.15, .15, .95, 1.1, 0, .85, o.wall); gable(.1, .1, 1.0, 1.15, .85, 1.35, o.roof);
      box(.95, .38, .98, .87, 0, .62, '#fefae0'); box(.96, .43, .985, .82, .05, .57, '#7f5539');
      cyl(.35, 1.45, 0, 1.5, .2, '#adb5bd'); add(GEO.cone, mat('#6c757d'), .22, .3 * HS, .22, .35, 1.65 * HS, 1.45);
      trough(1.2, .2, 1.85, .35, b && b.fed);
      const list = [animal(o.animal, 1.4, .8), animal(o.animal, 1.5, 1.5), animal(o.animal, .9, 1.65)];
      if (!ghost) G.userData.anim = wander(list, 1.2, .55, 1.75, 1.75, .18);
    },
    factory(s, o, b) {
      const a = .12, e = s - a, h = o.h;
      flat(.04, .04, s - .04, s - .04, .005, '#ced4da');
      walls(a, a, e, e, 0, h, o.wall, '#caf0f8', 4, 2, false);
      for (let i = 0; i < 3; i++) gable(a + i * (e - a) / 3, a, a + (i + 1) * (e - a) / 3, e, h, h + .35, o.roof);
      const cx = e - .32, cz = a + .32;
      cyl(cx, cz, h, h + 1.15, .12, '#8d99ae'); cyl(cx, cz, h + .95, h + 1.08, .13, '#e63946');
      box(e + .02, .5, e + .2, .9, 0, .08, '#6c757d');
      for (let i = 0; i < 3; i++) box(e + .04, .52 + i * .13, e + .16, .62 + i * .13, .08, .2, '#bc8a5f');
      sign(.6, e, h + .75, o.sign, .6, true);
      if (ghost) return;
      const puffs = [];
      for (let i = 0; i < 5; i++) { const p = ball(cx, cz, h + 1.2, .1, '#f1f3f5'); p.castShadow = false; puffs.push(p); }
      G.userData.anim = t => {
        const on = !!(b && b.job && Date.now() < b.readyAt);
        puffs.forEach((p, i) => {
          p.visible = on; if (!on) return;
          const k = (t / 2200 + i / 5) % 1;
          p.position.set(cx + k * .35, (h + 1.2 + k * 1.3) * HS, cz - k * .15);
          p.scale.setScalar(.07 + k * .18);
        });
      };
    },
    site(s, prog) {
      flat(.05, .05, s - .05, s - .05, .005, '#d4a373');
      const h = .25 + prog * .6, e = .12;
      box(.22, .22, s - .22, s - .22, 0, h, '#e9edc9');
      for (const [x, y] of [[e, e], [s - e, e], [e, s - e], [s - e, s - e]]) cyl(x, y, 0, h + .3, .025, '#bc6c25');
      const y = (h + .3) * HS;
      beam([e, y, e], [s - e, y, e], .02, '#bc6c25'); beam([e, y, s - e], [s - e, y, s - e], .02, '#bc6c25');
      beam([e, y, e], [e, y, s - e], .02, '#bc6c25'); beam([s - e, y, e], [s - e, y, s - e], .02, '#bc6c25');
      cone(s - .2, s - .2, 0, .25, .08, '#f77f00');
    },
  };
  function isRoad(x, y) { const b = x >= 0 && y >= 0 && x < WORLD && y < WORLD && grid[x] && grid[x][y]; return !!b && b.type === 'road'; }

  function buildGroup(b, asGhost) {
    const d = DEFS[b.type], grp = new THREE.Group(), pg = G, pgh = ghost;
    G = grp; ghost = !!asGhost;
    if (b.done === false) STYLES.site(d.s, b.steps / d.steps);
    else {
      STYLES[d.style](d.s, d.o || {}, b);
      const lv = b.lv || 1;
      if (lv > 1) { // cờ nâng cấp
        cyl(.1, d.s - .1, 0, d.top + .2, .02, '#6c757d');
        box(.1, d.s - .11, .38, d.s - .09, d.top - .02, d.top + .2, lv > 2 ? '#ffd60a' : '#e5e5e5');
      }
    }
    G = pg; ghost = pgh;
    grp.userData.b = b;
    return grp;
  }
  function visKey(b) {
    let k = b.type + (b.done ? 'd' : 'c') + b.steps + 'l' + (b.lv || 1);
    if (b.type === 'road') k += [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => isRoad(b.x + dx, b.y + dy) ? 1 : 0).join('');
    else if (DEFS[b.type].cat === 'ranch') k += b.fed ? 'f' : '';
    else if (b.type === 'farm' && b.crop) { const st = farmInfo(b, Date.now()); k += b.crop + st.state + st.stage + (b.watered ? 'w' : ''); }
    return k;
  }
  function syncBuildings() {
    const seen = new Set();
    for (const b of S.buildings) {
      seen.add(b.id);
      const key = visKey(b); let v = vis.get(b.id);
      if (!v || v.key !== key || v.b !== b) {
        if (v) { bGroup.remove(v.group); if (v.b !== b && v.bubble) { bubbleGroup.remove(v.bubble); v.bubble = null; } }
        v = { b, key, group: buildGroup(b), bubble: v ? v.bubble : null, icon: null };
        vis.set(b.id, v); bGroup.add(v.group);
      }
      const s = DEFS[b.type].s, k = 1 + .07 * ((b.lv || 1) - 1);
      v.group.scale.setScalar(k);
      v.group.position.set(b.x + s / 2 * (1 - k), 0, b.y + s / 2 * (1 - k));
      v.group.visible = b !== moving;
    }
    for (const [id, v] of vis) if (!seen.has(id)) { bGroup.remove(v.group); if (v.bubble) bubbleGroup.remove(v.bubble); vis.delete(id); }
  }
  let lastBubble = 0;
  function updateBubbles(t) {
    const refresh = t - lastBubble > 250; if (refresh) lastBubble = t;
    const size = clamp(cam.dist * .034, .5, 1.3);
    for (const v of vis.values()) {
      if (refresh) {
        const icon = v.b === moving ? null : (statusOf(v.b).icon || null);
        if (icon !== v.icon) {
          v.icon = icon;
          if (icon && !v.bubble) { v.bubble = new THREE.Sprite(emojiMat(icon, true)); v.bubble.userData.b = v.b; bubbleGroup.add(v.bubble); }
          if (v.bubble) { v.bubble.visible = !!icon; if (icon) v.bubble.material = emojiMat(icon, true); }
        }
      }
      if (v.bubble && v.bubble.visible) {
        const d = DEFS[v.b.type];
        v.bubble.scale.set(size, size, 1);
        v.bubble.position.set(v.b.x + d.s / 2, ((v.b.done ? d.top : 1) + .2) * HS + size * .6 + Math.sin(t / 300 + v.b.id) * .05, v.b.y + d.s / 2);
      }
    }
  }

  // ───── địa hình ─────
  let groundCanvas, groundTex, forestMeshes = [], lastLand = -1;
  function buildTerrain() {
    groundCanvas = document.createElement('canvas'); groundCanvas.width = groundCanvas.height = WORLD * 16;
    groundTex = new THREE.CanvasTexture(groundCanvas); groundTex.colorSpace = THREE.SRGBColorSpace; groundTex.magFilter = THREE.NearestFilter;
    const ground = new THREE.Mesh(GEO.plane, new THREE.MeshLambertMaterial({ map: groundTex }));
    ground.scale.set(WORLD, 1, WORLD); ground.position.set(WORLD / 2, 0, WORLD / 2); ground.receiveShadow = true; scene.add(ground);
    const base = new THREE.Mesh(GEO.box, new THREE.MeshLambertMaterial({ color: '#8d6e63' }));
    base.scale.set(WORLD, 1.2, WORLD); base.position.set(WORLD / 2, -.605, WORLD / 2); scene.add(base);
    const sea = new THREE.Mesh(GEO.plane, new THREE.MeshLambertMaterial({ color: '#4cc9f0' }));
    sea.scale.set(400, 1, 400); sea.position.set(WORLD / 2, -.9, WORLD / 2); scene.add(sea);
  }
  function refreshTerrain() {
    if (lastLand === S.land) return;
    lastLand = S.land;
    const c = groundCanvas.getContext('2d'), m = new THREE.Matrix4(), pos = [];
    for (let x = 0; x < WORLD; x++) for (let y = 0; y < WORLD; y++) {
      const un = unlocked(x, y), odd = (x + y) & 1;
      c.fillStyle = un ? (odd ? '#a8e08f' : '#9fd983') : (odd ? '#5fa56b' : '#589e64'); c.fillRect(x * 16, y * 16, 16, 16);
      if (un) { c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x * 16, y * 16, 16, 1); c.fillRect(x * 16, y * 16, 1, 16); }
      else if (hash(x, y) % 3 === 0) pos.push([x, y, .8 + hash(y, x) % 5 * .1]);
    }
    groundTex.needsUpdate = true;
    forestMeshes.forEach(f => scene.remove(f));
    const trunk = new THREE.InstancedMesh(GEO.cyl, mat('#8d6e63'), pos.length), crown = new THREE.InstancedMesh(GEO.cone, mat('#2d6a4f'), pos.length), crown2 = new THREE.InstancedMesh(GEO.cone, mat('#3a7d5c'), pos.length);
    pos.forEach(([x, y, sc], i) => {
      const ox = .3 + hash(x + 7, y) % 5 * .1, oy = .3 + hash(x, y + 7) % 5 * .1;
      m.makeScale(.05, .3 * sc, .05).setPosition(x + ox, .15 * sc, y + oy); trunk.setMatrixAt(i, m);
      m.makeScale(.3 * sc, .6 * sc, .3 * sc).setPosition(x + ox, .55 * sc, y + oy); crown.setMatrixAt(i, m);
      m.makeScale(.22 * sc, .5 * sc, .22 * sc).setPosition(x + ox, .9 * sc, y + oy); crown2.setMatrixAt(i, m);
    });
    forestMeshes = [trunk, crown, crown2];
    forestMeshes.forEach(f => { f.castShadow = true; f.receiveShadow = true; scene.add(f); });
  }
  const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

  // ───── con trỏ: bóng mờ khi đặt, ô chọn ─────
  let ghostGroup = null, ghostType = null, footMesh, rangeMesh;
  function buildCursor() {
    const mk = () => { const m = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ transparent: true, opacity: .5, depthWrite: false })); m.visible = false; scene.add(m); return m; };
    rangeMesh = mk(); footMesh = mk();
  }
  function setPlane(m, x, y, s, col, op, h = .02) { m.visible = true; m.scale.set(s, 1, s); m.position.set(x + s / 2, h, y + s / 2); m.material.color.set(col); m.material.opacity = op; }
  function updateCursor() {
    const type = mode.name === 'place' ? mode.type : (mode.name === 'move' && moving ? moving.type : null);
    footMesh.visible = rangeMesh.visible = false;
    if (type && hover) {
      if (ghostType !== type) { if (ghostGroup) scene.remove(ghostGroup); ghostGroup = buildGroup({ type, done: true, steps: 0 }, true); ghostType = type; scene.add(ghostGroup); }
      const d = DEFS[type], x = hover.x - Math.floor(d.s / 2), y = hover.y - Math.floor(d.s / 2);
      ghostGroup.visible = true; ghostGroup.position.set(x, .03, y);
      setPlane(footMesh, x, y, d.s, canPlace(x, y, d.s) ? '#40c057' : '#e63946', .6, .03);
      if (d.range) setPlane(rangeMesh, x - d.range, y - d.range, d.s + d.range * 2, '#ffd166', .3);
      return;
    }
    if (ghostGroup) ghostGroup.visible = false;
    let b = null, col = '#ffd166';
    if (hover && (mode.name === 'sell' || mode.name === 'move')) { b = grid[hover.x] && grid[hover.x][hover.y]; if (mode.name === 'sell') col = '#e63946'; }
    else if (mode.name === 'idle' && selected && S.buildings.includes(selected)) b = selected;
    if (b) {
      const d = DEFS[b.type];
      setPlane(footMesh, b.x - .06, b.y - .06, d.s + .12, col, .55, b.type === 'road' ? .03 : .015);
      if (d.range && mode.name === 'idle') setPlane(rangeMesh, b.x - d.range, b.y - d.range, d.s + d.range * 2, '#ffd166', .22, .012);
    }
  }

  // ───── xe cộ ─────
  const cars = []; let carCheck = 0, roadList = [];
  function makeCar() {
    const grp = new THREE.Group(), pg = G; G = grp;
    const col = ['#e63946', '#ffd166', '#118ab2', '#ffffff', '#06d6a0', '#f78c6b', '#9d4edd'][Math.floor(Math.random() * 7)];
    add(GEO.box, mat(col), .2, .09, .4, 0, .09, 0); add(GEO.box, mat('#cfe8f5'), .17, .08, .2, 0, .17, -.02);
    for (const [x, z] of [[-.1, .12], [.1, .12], [-.1, -.12], [.1, -.12]]) add(GEO.box, mat('#2b2d42'), .04, .07, .09, x, .035, z);
    G = pg; carGroup.add(grp);
    return { mesh: grp, x: -1, y: -1, nx: -1, ny: -1, px: -1, py: -1, t: 0, sp: .9 + Math.random() * .6 };
  }
  function respawn(c) {
    const r = roadList[Math.floor(Math.random() * roadList.length)];
    c.x = c.nx = c.px = r.x; c.y = c.ny = c.py = r.y; c.t = 1;
  }
  function updateCars(t, dt) {
    if (t - carCheck > 1000) {
      carCheck = t; roadList = S.buildings.filter(b => b.type === 'road' && b !== moving);
      const want = Math.min(12, Math.floor(roadList.length / 5));
      while (cars.length < want) { const c = makeCar(); respawn(c); cars.push(c); }
      while (cars.length > want) carGroup.remove(cars.pop().mesh);
    }
    for (const c of cars) {
      if (!isRoad(c.x, c.y) || !isRoad(c.nx, c.ny)) { if (!roadList.length) continue; respawn(c); }
      c.t += dt * c.sp;
      if (c.t >= 1) {
        const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [c.nx + dx, c.ny + dy]).filter(([x, y]) => isRoad(x, y) && !(x === c.x && y === c.y));
        const nxt = opts.length ? opts[Math.floor(Math.random() * opts.length)] : [c.x, c.y];
        c.px = c.x; c.py = c.y; c.x = c.nx; c.y = c.ny; c.nx = nxt[0]; c.ny = nxt[1]; c.t = 0;
      }
      const dx = c.nx - c.x, dz = c.ny - c.y;
      c.mesh.visible = !!(dx || dz);
      if (!c.mesh.visible) continue;
      c.mesh.position.set(c.x + .5 + dx * c.t - dz * .2, .005, c.y + .5 + dz * c.t + dx * .2);
      c.mesh.rotation.y = Math.atan2(dx, dz);
    }
  }

  // ───── trời, mưa ─────
  const DAY = new THREE.Color('#8fd3f4'), NIGHT = new THREE.Color('#1b2a4a'), DUSK = new THREE.Color('#ff9e6d'), GRAY = new THREE.Color('#9aa9b5'), WHITE = new THREE.Color('#ffffff'), tmpC = new THREE.Color();
  const CYCLE = 8 * 60 * 1000;
  let rain, rainPos;
  function buildRain() {
    const n = 900; rainPos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { rainPos[i * 3] = Math.random() * 34 - 5; rainPos[i * 3 + 1] = Math.random() * 14; rainPos[i * 3 + 2] = Math.random() * 34 - 5; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    rain = new THREE.Points(g, new THREE.PointsMaterial({ color: '#dff3ff', size: .09, transparent: true, opacity: .8 }));
    rain.visible = false; rain.frustumCulled = false; scene.add(rain);
  }
  function updateSky(t, dt) {
    let d = 1;
    if (S.dayNight !== false) d = clamp(Math.sin(t % CYCLE / CYCLE * Math.PI * 2) * 2 + 1.35, 0, 1);
    const wet = isRaining();
    tmpC.copy(NIGHT).lerp(DAY, d).lerp(DUSK, 4 * d * (1 - d) * .55);
    if (wet) tmpC.lerp(GRAY, .6);
    scene.background.copy(tmpC);
    sun.intensity = (.5 + 2.3 * d) * (wet ? .65 : 1);
    sun.color.set('#fff4e0').lerp(DUSK, 4 * d * (1 - d) * .6);
    hemi.intensity = 1.05 + 1.0 * d;
    hemi.color.copy(tmpC).lerp(WHITE, .5);
    sun.castShadow = S.shadows !== false;
    rain.visible = wet;
    if (wet) {
      for (let i = 1; i < rainPos.length; i += 3) { rainPos[i] -= dt * 16; if (rainPos[i] < 0) rainPos[i] += 14; }
      rain.geometry.attributes.position.needsUpdate = true;
    }
  }

  // ───── máy quay ─────
  function applyCam() {
    cam.tx = clamp(cam.tx, -2, WORLD + 2); cam.tz = clamp(cam.tz, -2, WORLD + 2);
    cam.pitch = clamp(cam.pitch, .3, 1.45); cam.dist = clamp(cam.dist, 5, 48);
    const c = Math.cos(cam.pitch);
    camera.position.set(cam.tx + cam.dist * c * Math.sin(cam.yaw), cam.dist * Math.sin(cam.pitch), cam.tz + cam.dist * c * Math.cos(cam.yaw));
    camera.lookAt(cam.tx, 0, cam.tz);
    camera.updateMatrixWorld();
  }
  function resetCam() { cam.tx = cam.tz = WORLD / 2; cam.yaw = Math.PI / 4; cam.pitch = .78; cam.dist = W < 600 ? 26 : 19; applyCam(); }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitV = new THREE.Vector3();
  function groundAt(sx, sy) {
    ndc.set(sx / W * 2 - 1, -(sy / H * 2 - 1)); ray.setFromCamera(ndc, camera);
    return ray.ray.intersectPlane(groundPlane, hitV) ? { x: hitV.x, z: hitV.z } : null;
  }
  function pick(sx, sy, groundOnly) {
    const gp = groundAt(sx, sy), tile = gp ? { x: Math.floor(gp.x), y: Math.floor(gp.z) } : { x: -1, y: -1 };
    let b = null;
    if (!groundOnly) for (const h of ray.intersectObjects([bGroup, bubbleGroup], true)) {
      let o = h.object; if (!o.visible) continue;
      while (o && !o.userData.b) o = o.parent;
      if (o && o.visible && o.userData.b.type !== 'road') { b = o.userData.b; break; }
    }
    return { tile, b };
  }
  function pan(x0, y0, x1, y1) {
    const a = groundAt(x0, y0); if (!a) return; const ax = a.x, az = a.z;
    const b = groundAt(x1, y1); if (!b) return;
    cam.tx += ax - b.x; cam.tz += az - b.z; applyCam();
  }
  function panBy(right, fwd) {
    const s = Math.sin(cam.yaw), c = Math.cos(cam.yaw), k = cam.dist * .05;
    cam.tx += (c * right - s * fwd) * k; cam.tz += (-s * right - c * fwd) * k; applyCam();
  }
  const rotate = (dy, dp) => { cam.yaw += dy; cam.pitch += dp; applyCam(); };
  const zoomBy = f => { cam.dist /= f; applyCam(); };
  function screenOf(b) {
    const d = DEFS[b.type], v = new THREE.Vector3(b.x + d.s / 2, d.top * HS, b.y + d.s / 2).project(camera);
    return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H };
  }

  // ───── ảnh nhỏ trong cửa hàng ─────
  let tR, tScene, tCam; const thumbs = {};
  function thumb(id) {
    if (thumbs[id]) return thumbs[id];
    try {
      if (!tR) {
        tR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); tR.setSize(176, 176, false);
        tScene = new THREE.Scene(); tScene.add(new THREE.HemisphereLight('#ffffff', '#b7c9a8', 2.2));
        const l = new THREE.DirectionalLight('#ffffff', 2); l.position.set(3, 8, 6); tScene.add(l);
        tCam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100);
      }
      const d = DEFS[id], grp = buildGroup(id === 'farm' ? { type: id, done: true, crop: 'ngo', plantedAt: Date.now() - 2000, readyAt: Date.now() - 1000 } : { type: id, done: true });
      const h = d.top * HS, half = Math.max(d.s * .8, (h + d.s * .7) * .56), cy = h * .42;
      tScene.add(grp);
      tCam.left = -half; tCam.right = half; tCam.top = half; tCam.bottom = -half; tCam.updateProjectionMatrix();
      tCam.position.set(d.s / 2 + 10, cy + 9, d.s / 2 + 10); tCam.lookAt(d.s / 2, cy, d.s / 2);
      tR.render(tScene, tCam); tScene.remove(grp);
      return thumbs[id] = tR.domElement.toDataURL();
    } catch (e) { return ''; }
  }

  // ───── vòng lặp ─────
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  function init(canvas) {
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch (e) { return false; }
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene(); scene.background = new THREE.Color('#8fd3f4');
    camera = new THREE.PerspectiveCamera(32, 1, .5, 300);
    hemi = new THREE.HemisphereLight('#ffffff', '#8fb996', 2); scene.add(hemi);
    sun = new THREE.DirectionalLight('#fff4e0', 2.6);
    sun.position.set(WORLD / 2 + 9, 22, WORLD / 2 + 3); sun.target.position.set(WORLD / 2, 0, WORLD / 2);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 1, far: 60 });
    sun.shadow.bias = -.0004; sun.shadow.normalBias = .03;
    scene.add(sun, sun.target, bGroup, bubbleGroup, carGroup);
    buildTerrain(); buildCursor(); buildRain();
    window.addEventListener('resize', resize); resize(); resetCam();
    return true;
  }
  let lastT = 0;
  function frame() {
    const t = Date.now(), dt = Math.min(.1, (t - (lastT || t)) / 1000); lastT = t;
    refreshTerrain(); syncBuildings(); updateBubbles(t); updateCursor(); updateCars(t, dt); updateSky(t, dt);
    for (const v of vis.values()) if (v.group.userData.anim && v.group.visible) v.group.userData.anim(t);
    renderer.render(scene, camera);
  }
  return { init, frame, pick, pan, panBy, rotate, zoomBy, resetCam, screenOf, thumb, cam };
})();

/**
 * Saudi: a slab cut in the outline of Saudi Arabia, north to the back, with
 * five pins at the true coordinates of Makkah, Riyadh, Al-Muzahmiyah,
 * Ad-Dawadmi and Wadi ad-Dawasir, on a grid of dim dots. The pointer is
 * projected onto the slab; each pin takes its height from its distance to it,
 * on its own spring, and the nearest pin takes the bright stroke. The slider
 * is the radius, in world units (12 to a degree).
 *
 * The pattern: a continuous field (Terrain). Springs, a falloff by distance, a
 * hit test on the ground plane, and a rest where the pins already differ.
 */
const {
  Cam, circ, clamp, facing, fillet, fit, poly, prism, proj, unproj, spring, stepS,
  flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const K = 12, PB = 5, HMAX = 62;
const at = (lon, lat) => [(lon - 34.5) * K, (32.5 - lat) * K];
// the border, simplified, clockwise from the Gulf of Aqaba: [longitude, latitude]
const BORDER = [
  [34.95, 29.35], [36.07, 29.18], [37.5, 30.0], [38.0, 30.5], [39.2, 32.15], [41.0, 31.4], [42.1, 31.1],
  [44.7, 29.2], [46.55, 29.1], [47.7, 28.5], [48.4, 28.5], [49.6, 27.1], [50.1, 26.4], [50.8, 24.75],
  [51.6, 24.25], [52.6, 22.95], [55.2, 22.7], [55.7, 22.0], [55.0, 20.0], [52.0, 19.0], [49.0, 18.6],
  [47.0, 17.0], [46.4, 17.2], [44.0, 17.4], [43.3, 17.0], [42.8, 16.4], [42.55, 16.9], [41.2, 19.0],
  [40.25, 20.15], [39.15, 21.5], [39.0, 22.8], [38.05, 24.1], [37.25, 25.05], [36.45, 26.25],
  [35.7, 27.35], [34.6, 28.1],
].map(([lon, lat]) => at(lon, lat));
// names in the page's language (the English pages live in en/ with lang="en")
const EN = document.documentElement.lang === "en";
const PINS = [
  ["مكة المكرمة", "Makkah", 39.83, 21.42, 26],
  ["الدوادمي", "Al-Dawadmi", 44.39, 24.5, 14],
  ["المزاحمية", "Al-Muzahmiyya", 46.26, 24.47, 18],
  ["الرياض", "Riyadh", 46.72, 24.69, 36],
  ["وادي الدواسر", "Wadi Al-Dawasir", 45.2, 20.47, 12],
].map(([ar, en, lon, lat, h0], i) => { const [x, y] = at(lon, lat); return { name: EN ? en : ar, capital: i === 3, x, y, h0 }; });
const falloff = (u) => (u <= 0 ? 1 : u >= 1 ? 0.1 : 1 - u * 0.9);

/** Whether a world point lies inside the border. */
function inside([px, py]) {
  let c = false;
  for (let i = 0, j = BORDER.length - 1; i < BORDER.length; j = i++) {
    const [xi, yi] = BORDER[i], [xj, yj] = BORDER[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  // looked at from higher than the 2:1 view, so the outline reads as the map it is
  const C = Cam(0, 0.78, 1.36);
  const ext = BORDER.map(([x, y]) => [x, y, -PB]).concat([[PINS[3].x, PINS[3].y, HMAX + 4]]);
  fit(C, ext, 200, 160);
  const P = proj(C), front = facing(C);
  let R = value;

  // the slab: its underside outline first, then its top, so the edge shows its thickness
  const g = mk("g", {}, svg), edge = fillet(BORDER, BORDER.map(() => 2), 3);
  mk("path", { d: poly(edge.map(([x, y]) => P(x, y, -PB))), class: "sil" }, g);
  mk("path", { d: poly(edge.map(([x, y]) => P(x, y, 0))) }, g);
  for (let x = 12; x < 260; x += 18) for (let y = 12; y < 200; y += 18) if (inside([x, y])) place(flatDot(g, C, 0.55, "dot off"), P(x, y, 0));

  // pins back to front, by screen depth; each is a foot, a post and a cap
  const pins = PINS.slice().sort((a, b) => P(a.x, a.y, 0)[1] - P(b.x, b.y, 0)[1]).map((p) => {
    const ring = (r) => circ(r, 16).map((q) => ({ ...q, u: q.u + p.x, v: q.v + p.y }));
    return { ...p, foot: solid(g), post: solid(g), cap: solid(g),
      fr: ring(4.2), fi: ring(3.4), pr: ring(2), pi: ring(1.3), cr: ring(3.4), ci: ring(2.6),
      sp: spring(p.h0, { eps: 0.04 }), drawn: NaN };
  });
  const capital = pins.find((p) => p.capital);

  function drawPin(p) {
    const h = Math.max(3, p.sp.x);
    if (h === p.drawn) return;
    p.drawn = h;
    put(p.foot, prism(P, front, p.fr, p.fi, 0, 1.2));
    put(p.post, prism(P, front, p.pr, p.pi, 1.2, h));
    put(p.cap, prism(P, front, p.cr, p.ci, h, h + 3.2));
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const p of pins) { if (stepS(p.sp, dt)) m = true; drawPin(p); }
    return m;
  });
  bag.add(B.unregister);

  let over = null;
  function retarget() {
    let near = null, nd = 1e9;
    for (const p of pins) {
      if (!over) { p.sp.t = p.h0; continue; }
      const d = Math.hypot(p.x - over[0], p.y - over[1]);
      p.sp.t = HMAX * falloff(d / R);
      if (d < nd) { nd = d; near = p; }
    }
    if (over && nd > R) near = null;
    const lit = over ? near : capital;
    for (const p of pins) p.cap.sil.classList.toggle("hi", p === lit);
    read.textContent = over && near ? near.name : "rest";
    B.wake();
  }
  retarget();

  // the hit is read on the ground plane, which never moves
  bag.add(pointer(stage, {
    move: (p) => { const w = unproj(C, p[0], p[1], 0); over = [clamp(w[0], -10, 270), clamp(w[1], -10, 210)]; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "saudi",
  means: "A map of Saudi Arabia with five pins where the work took place: those near the pointer rise, and the nearest lights up.",
  rules: [1, 3, 5, 9],
  range: [36, 60, 96],
  tour: [[110, 175], [255, 150], [235, 205], null],
  mount,
});

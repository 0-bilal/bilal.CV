/**
 * Regions: a map table with five pins, set where Makkah, Riyadh, Al-Muzahmiyah,
 * Ad-Dawadmi and Wadi ad-Dawasir lie, east to the right and north to the back,
 * on a grid of dim dots. The pointer is projected onto the table; each pin
 * takes its height from its distance to it, on its own spring, and the pin
 * nearest the pointer takes the bright stroke. The slider is the radius.
 *
 * The pattern: a continuous field (Terrain). Springs, a falloff by distance, a
 * hit test on the ground plane, and a rest where the pins already differ.
 */
const {
  Cam, circ, clamp, facing, fit, prism, proj, rings, unproj, spring, stepS,
  flatDot, mk, place, pointer, put, register, disposer, solid,
} = HL;

const X1 = 200, Y1 = 140, PB = 5, HMAX = 84;
// [name, x (east), y (south), rest height]: longitude and latitude, 24 units a degree
const PINS = [
  ["مكة المكرمة", 20, 98, 34],
  ["الدوادمي", 130, 25, 22],
  ["المزاحمية", 168, 30, 27],
  ["الرياض", 188, 14, 50],
  ["وادي الدواسر", 150, 120, 18],
];
const falloff = (u) => (u <= 0 ? 1 : u >= 1 ? 0.08 : 1 - u * 0.92);

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.45);
  fit(C, [[-8, -8, -PB], [X1 + 8, Y1 + 8, -PB], [X1 + 8, -8, -PB], [-8, Y1 + 8, -PB], [188, 14, HMAX + 5]], 200, 172);
  const P = proj(C), front = facing(C);
  let R = value;

  const g = mk("g", {}, svg);
  const [tr, ti] = rings(-8, -8, X1 + 8, Y1 + 8, 10, 2.2);
  put(solid(g), prism(P, front, tr, ti, -PB, 0));

  // the grid the pins stand on: dim dots every 20 units
  for (let x = 0; x <= X1; x += 20) for (let y = 0; y <= Y1; y += 20) place(flatDot(g, C, 0.6, "dot off"), P(x, y, 0));

  // pins back to front, by x + y; each is a post with a round cap
  const pins = PINS.map(([name, x, y, h0], k) => ({ k, name, x, y, h0 }))
    .sort((a, b) => a.x + a.y - (b.x + b.y))
    .map((p) => {
      const at = (ring) => ring.map((q) => ({ ...q, u: q.u + p.x, v: q.v + p.y }));
      return { ...p, foot: solid(g), post: solid(g), cap: solid(g),
        fr: at(circ(9, 16)), fi: at(circ(7.8, 16)), pr: at(circ(3.6, 12)), pi: at(circ(2.6, 12)),
        cr: at(circ(7, 16)), ci: at(circ(5.8, 16)), sp: spring(p.h0, { eps: 0.04 }), drawn: NaN };
    });
  const capital = pins.find((p) => p.x === 188);

  function drawPin(p) {
    const h = Math.max(4, p.sp.x);
    if (h === p.drawn) return;
    p.drawn = h;
    put(p.foot, prism(P, front, p.fr, p.fi, 0, 1.6));
    put(p.post, prism(P, front, p.pr, p.pi, 1.6, h));
    put(p.cap, prism(P, front, p.cr, p.ci, h, h + 5));
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
    // the hit is read on the ground plane, which never moves
    if (over && nd > R) near = null;
    const lit = over ? near : capital;
    for (const p of pins) p.cap.sil.classList.toggle("hi", p === lit);
    read.textContent = over && near ? near.name : "rest";
    B.wake();
  }
  retarget();

  bag.add(pointer(stage, {
    move: (p) => { const w = unproj(C, p[0], p[1], 0); over = [clamp(w[0], -8, X1 + 8), clamp(w[1], -8, Y1 + 8)]; retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { R = v; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "regions",
  means: "Five pins where the work took place: those near the pointer rise, and the nearest one lights up.",
  rules: [1, 3, 5, 9],
  range: [40, 70, 110],
  tour: [[120, 210], [255, 120], [300, 175], null],
  mount,
});

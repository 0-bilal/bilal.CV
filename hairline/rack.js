/**
 * Rack: an open cabinet of eight drawers, one per QB project, each with the
 * project's name on its front and three status lights beside it. At rest the
 * bottom drawer stands a little out, so no name is hidden. The pointer's height picks a drawer; it slides out
 * and the drawers near it follow less, staggered outwards from it. The slider
 * is the reach, in drawers.
 *
 * The pattern: discrete items (Riffle). Tweens, a stagger by distance, and a
 * hit test on the drawers' resting fronts, so a sliding drawer cannot flip the
 * choice. The names break rule 10 on purpose: the person asked for each
 * project's name on its drawer.
 */
const {
  Cam, clamp, facing, fit, open, prism, proj, rings, tset, tval, tween, tdone,
  disposer, mk, place, pointer, put, register, solid,
} = HL;

// OUT is kept short so a drawer's front never moves more than half a pitch on screen:
// the name a visitor clicks then stays over the drawer the rest-pose hit test picks
const N = 8, L = 64, D = 96, T = 11, PITCH = 14, Z0 = 6, OUT = 15, STEP = 45, FONT = 6.2;
// top to bottom
const NAMES = ["QB-Sentinel", "QB-Prax", "QB-Ledg", "QB-FLOW", "QB-Dine", "QB-Eligibility Pro", "QB-BluePulse", "QB-Nexa"];
// at rest only the bottom drawer stands out: nothing below it has a name to hide
const REST = [10, 0, 0, 0, 0, 0, 0, 0], LIT = 0;
const ZT = Z0 + N * PITCH;
const bz = (i) => Z0 + i * PITCH;
const nameOf = (i) => NAMES[N - 1 - i];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;

  const C = Cam(45, 0.5, 1.5);
  fit(C, [[-4, -9, -4], [L + 4, D + 9, -4], [L + OUT, D, bz(0)], [-4, -9, ZT + 4], [L + 4, -9, ZT + 4], [L + OUT, 0, ZT]], 200, 162);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const block = (x0, y0, x1, y1, z0, z1, r = 2, b = 1) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(solid(g), prism(P, front, ring, inner, z0, z1));
  };

  // the far wall and the floor, then the drawers bottom to top, then the near post and the roof
  block(-4, -9, L + 4, D + 9, -4, 0, 4, 1.6);
  block(0, -9, L, -3, 0, ZT, 2, 1);
  // the name lies on the drawer's front: its x runs across the front, its y down it
  const tx = [P(0, -1, 0)[0] - P(0, 0, 0)[0], P(0, -1, 0)[1] - P(0, 0, 0)[1]];
  const ty = [P(0, 0, -1)[0] - P(0, 0, 0)[0], P(0, 0, -1)[1] - P(0, 0, 0)[1]];
  const m = FONT / 10;
  const blades = [];
  for (let i = 0; i < N; i++) {
    const el = solid(g), handle = mk("path", { class: "nf lo" }, g);
    const label = mk("text", { "text-anchor": "middle", "dominant-baseline": "central", "font-size": "10" }, g);
    label.textContent = nameOf(i);
    const led = [0, 1, 2].map(() => mk("circle", { r: 1.2, class: "dot off" }, g));
    blades.push({ el, handle, label, led, o: tween(REST[i]), drawn: NaN });
  }
  block(0, D + 3, 6, D + 9, 0, ZT, 2, 1);
  block(-4, -9, L + 4, D + 9, ZT, ZT + 4, 4, 1.6);

  function drawBlade(i, now) {
    const b = blades[i], o = tval(b.o, now);
    if (o === b.drawn) return;
    b.drawn = o;
    const [ring, inner] = rings(o, 0, L + o, D, 2, 1);
    const z = bz(i), x = L + o, zm = z + T / 2;
    put(b.el, prism(P, front, ring, inner, z, z + T));
    b.handle.setAttribute("d", open([P(x, D - 6, zm - 2.6), P(x, D - 16, zm - 2.6)]));
    const c = P(x, D * 0.52, zm - 0.8);
    b.label.setAttribute("transform", `matrix(${tx[0] * m} ${tx[1] * m} ${ty[0] * m} ${ty[1] * m} ${c[0]} ${c[1]})`);
    b.led.forEach((el, k) => place(el, P(x, 7 + k * 5, zm)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    blades.forEach((b, i) => { drawBlade(i, now); if (!tdone(b.o, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // Hit test on the RESTING fronts: the drawer whose front centre is nearest the pointer's height.
  const fronts = blades.map((_, i) => P(L + REST[i], D / 2, bz(i) + T / 2));
  const xs = [P(0, D, 0)[0] - 10, P(L + OUT, 0, 0)[0] + 10];
  function hit([x, y]) {
    if (x < xs[0] || x > xs[1]) return -1;
    let best = -1, bd = 1e9;
    fronts.forEach((p, i) => { const d = Math.abs(p[1] - y); if (d < bd) { bd = d; best = i; } });
    return bd < 16 ? best : -1;
  }

  let act = null;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : LIT;
    act = a;
    blades.forEach((b, i) => {
      const out = a < 0 ? REST[i] : OUT * clamp(1 - Math.abs(i - a) / (reach + 0.5), 0, 1);
      tset(b.o, out, now, Math.abs(i - from) * STEP);
      const on = i === (a < 0 ? LIT : a);
      b.el.sil.classList.toggle("hi", on);
      b.label.classList.toggle("hi", on);
      b.led.forEach((el, k) => el.setAttribute("class", on ? (k === 0 ? "dot" : "dot m") : "dot off"));
    });
    read.textContent = a < 0 ? "rest" : nameOf(a);
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; const a = act; act = null; setActive(a); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "rack",
  means: "A cabinet of eight QB projects, each named on its drawer: the drawer at the pointer's height slides out, and its neighbours follow less.",
  rules: [1, 2, 4, 5],
  range: [0.6, 1.6, 3],
  tour: [[230, 215], [230, 150], [230, 90], null],
  mount,
});

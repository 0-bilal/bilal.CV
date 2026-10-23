/**
 * Rack: an open server rack of eight blades, one per QB system, with three
 * status lights on each blade's front. At rest two blades stand half out where
 * the last update stopped. The pointer's height picks a blade; it slides out
 * and the blades near it follow less, staggered outwards from it. The slider
 * is the reach, in blades.
 *
 * The pattern: discrete items (Riffle). Tweens, a stagger by distance, and a
 * hit test on the blades' resting fronts, so a sliding blade cannot flip the
 * choice.
 */
const {
  Cam, clamp, facing, fit, open, prism, proj, rings, tset, tval, tween, tdone,
  disposer, mk, place, pointer, put, register, solid,
} = HL;

const N = 8, L = 62, D = 84, T = 7, PITCH = 11, Z0 = 6, OUT = 30, STEP = 45;
const NAMES = ["QB-Sentinel", "QB-Prax", "QB-FLOW", "QB-Dine", "QB-Nexa", "QB-Ledg", "QB-Eligibility", "QB-BluePulse"];
const REST = [0, 0, 9, 0, 0, 17, 0, 0], LIT = 5;
const ZT = Z0 + N * PITCH;
const bz = (i) => Z0 + i * PITCH;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;

  const C = Cam(45, 0.5, 1.62);
  fit(C, [[-4, -9, -4], [L + 4, D + 9, -4], [L + OUT, D, bz(0)], [-4, -9, ZT + 4], [L + 4, -9, ZT + 4], [L + OUT, 0, ZT]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const block = (x0, y0, x1, y1, z0, z1, r = 2, b = 1) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    put(solid(g), prism(P, front, ring, inner, z0, z1));
  };

  // the far wall and the floor, then the blades bottom to top, then the near post and the roof
  block(-4, -9, L + 4, D + 9, -4, 0, 4, 1.6);
  block(0, -9, L, -3, 0, ZT, 2, 1);
  const blades = [];
  for (let i = 0; i < N; i++) {
    const el = solid(g), handle = mk("path", { class: "nf lo" }, g);
    const led = [0, 1, 2].map(() => mk("circle", { r: 1.2, class: "dot off" }, g));
    blades.push({ el, handle, led, o: tween(REST[i]), drawn: NaN });
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
    b.handle.setAttribute("d", open([P(x, D / 2 + 14, zm), P(x, D / 2 - 14, zm)]));
    b.led.forEach((el, k) => place(el, P(x, 8 + k * 5, zm)));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    blades.forEach((b, i) => { drawBlade(i, now); if (!tdone(b.o, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // Hit test on the RESTING fronts: the blade whose front centre is nearest the pointer's height.
  const fronts = blades.map((_, i) => P(L + REST[i], D / 2, bz(i) + T / 2));
  const xs = [P(0, D, 0)[0] - 10, P(L + OUT, 0, 0)[0] + 10];
  function hit([x, y]) {
    if (x < xs[0] || x > xs[1]) return -1;
    let best = -1, bd = 1e9;
    fronts.forEach((p, i) => { const d = Math.abs(p[1] - y); if (d < bd) { bd = d; best = i; } });
    return bd < 24 ? best : -1;
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
      b.led.forEach((el, k) => el.setAttribute("class", on ? (k === 0 ? "dot" : "dot m") : "dot off"));
    });
    read.textContent = a < 0 ? "rest" : NAMES[N - 1 - a];
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
  means: "A rack of eight QB systems: the blade at the pointer's height slides out, and its neighbours follow less.",
  rules: [1, 2, 4, 5],
  range: [0.6, 1.6, 3],
  tour: [[230, 210], [230, 150], [230, 95], null],
  mount,
});

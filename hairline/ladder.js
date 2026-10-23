/**
 * Ladder: a flight of six long treads, each set behind and above the one in
 * front, one per role on the way from worker to operations manager, each with
 * its title written along its top. A pawn stands on the highest. The tread
 * under the pointer rises a little and the pawn hops onto it; its neighbours
 * rise less, staggered outwards. The figure keeps to a band 160 units tall in
 * the middle of the viewBox, so the page can show it as a wide strip. The
 * slider is the stagger, in ms.
 *
 * The titles break rule 10 on purpose: the person asked for each role's name
 * to be written on its step.
 */
const {
  Cam, clamp, circ, facing, fit, prism, proj, rings, tset, tval, tween, tdone,
  disposer, mk, pointer, put, register, solid,
} = HL;

// each tread is just wide enough for the longest title and a pawn beside it
const N = 6, W = 96, DS = 18, RISE = 7, LIFT = 5, PB = 4, FONT = 10.5;
const ROLES = ["عامل", "تحضير منتجات", "كاشير", "مدير فرع", "مدير فرعين", "مدير تشغيل"];
const Y = (i) => (N - 1 - i) * DS, H0 = (i) => 6 + i * RISE;
const TOP = N - 1, NEAR = [1, 0.45, 0.1];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  // turned -20 degrees: the treads run across the strip and the flight climbs to the left
  const C = Cam(-20, 0.5, 1.55);
  const YE = N * DS;
  fit(C, [[-5, -5, -PB], [W + 5, YE + 5, -PB], [W + 5, -5, -PB], [-5, YE + 5, -PB], [0, 0, H0(TOP) + LIFT + 12], [W, 0, H0(TOP) + LIFT]], 200, 160);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-5, -5, W + 5, YE + 5, 6, 1.8);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));

  // the highest tread is the farthest back: paint from it down to the nearest
  const steps = [];
  for (let i = TOP; i >= 0; i--) {
    const [ring, inner] = rings(0, Y(i), W, Y(i) + DS, 2.5, 1.1);
    const el = solid(g), label = mk("text", { "text-anchor": "middle", "dominant-baseline": "central", "font-size": "10" }, g);
    label.textContent = ROLES[i];
    steps[i] = { ring, inner, el, label, z: tween(0), drawn: NaN };
  }

  // the pawn: a disc for a foot and a post for a body
  const pawn = mk("g", {}, g), foot = solid(pawn), body = solid(pawn);
  const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
  const fr = circ(4.4, 16), fi = circ(3.5, 16), br = circ(2.3, 12), bi = circ(1.5, 12);
  const pos = tween(TOP);
  let pawnOn = -1;

  // the title lies on the tread's top: its x along the tread, its y along the depth
  const ex = [P(1, 0, 0)[0] - P(0, 0, 0)[0], P(1, 0, 0)[1] - P(0, 0, 0)[1]];
  const ey = [P(0, 1, 0)[0] - P(0, 0, 0)[0], P(0, 1, 0)[1] - P(0, 0, 0)[1]];
  const m = FONT / 10;
  function drawStep(i, now) {
    const s = steps[i], h = H0(i) + tval(s.z, now);
    if (h === s.drawn) return;
    s.drawn = h;
    put(s.el, prism(P, front, s.ring, s.inner, 0, h));
    const o = P(W * 0.42, Y(i) + DS / 2, h);
    s.label.setAttribute("transform", `matrix(${ex[0] * m} ${ex[1] * m} ${ey[0] * m} ${ey[1] * m} ${o[0]} ${o[1]})`);
  }
  function drawPawn(now) {
    const t = tval(pos, now), k = clamp(Math.round(t), 0, TOP);
    if (k !== pawnOn) { pawnOn = k; steps[k].label.after(pawn); }
    const lo = Math.floor(t), hi = Math.ceil(t), f = t - lo;
    const z = Math.max(H0(lo) + tval(steps[lo].z, now), H0(hi) + tval(steps[hi].z, now)) + 6 * Math.sin(Math.PI * f);
    const x = W - 8, y = Y(0) + DS / 2 - t * DS;
    put(foot, prism(P, front, at(fr, x, y), at(fi, x, y), z, z + 2.2));
    put(body, prism(P, front, at(br, x, y), at(bi, x, y), z + 2.2, z + 11));
  }

  const B = register(stage, (_dt, now) => {
    let moving = !tdone(pos, now);
    steps.forEach((s, i) => { drawStep(i, now); if (!tdone(s.z, now)) moving = true; });
    drawPawn(now);
    return moving;
  });
  bag.add(B.unregister);

  // Hit test on the RESTING treads: each tread's centre line, at rest, is a straight line on
  // screen; take the tread whose line passes nearest the pointer, read at the pointer's x.
  const box = [P(0, YE, 0)[0], P(W, 0, 0)[0]].sort((a, b) => a - b);
  const centres = steps.map((_, i) => P(W / 2, Y(i) + DS / 2, H0(i)));
  function hit([sx, sy]) {
    if (sx < box[0] - 20 || sx > box[1] + 20) return -1;
    let best = -1, bd = 1e9;
    centres.forEach((c, i) => {
      const d = Math.abs(sy - (c[1] + ((sx - c[0]) * ex[1]) / ex[0]));
      if (d < bd) { bd = d; best = i; }
    });
    return bd < 16 ? best : -1;
  }

  let act = null;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : TOP;
    act = a;
    const lit = a < 0 ? TOP : a;
    steps.forEach((s, i) => {
      tset(s.z, a < 0 ? 0 : LIFT * (NEAR[Math.abs(i - a)] || 0), now, Math.abs(i - from) * stag);
      s.el.sil.classList.toggle("hi", i === lit);
      s.label.classList.toggle("hi", i === lit);
    });
    tset(pos, lit, now, 0);
    read.textContent = a < 0 ? "rest" : ROLES[a];
    B.wake();
  }
  setActive(-1);

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "ladder",
  means: "Six treads from worker to operations manager, each titled on its top: the one under the pointer rises, and the pawn hops onto it.",
  rules: [1, 2, 5, 8],
  range: [0, 45, 90],
  tour: [[230, 205], [210, 165], [180, 120], null],
  mount,
});

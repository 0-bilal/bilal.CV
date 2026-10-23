/**
 * Stairs: a flight of six steps on a plinth, one per role on the way from
 * worker to operations manager, with a pawn standing on the top one. The step
 * under the pointer rises and the pawn moves onto it; its neighbours rise
 * less, staggered outwards from it. The slider is the stagger, in ms.
 *
 * The pattern: discrete items (Riffle). Tweens, a stagger by distance, and a
 * hit test on each step's resting top, so a rising step cannot flip the choice.
 */
const {
  Cam, clamp, circ, facing, fit, prism, proj, rings, tset, tval, tween, tdone,
  disposer, mk, pointer, put, register, solid,
} = HL;

const N = 6, W = 40, G = 19, FOOT = 16, LIFT = 14, PB = 5;
const ROLES = ["عامل", "تحضير منتجات", "كاشير", "مدير فرع", "مدير فرعين", "مدير تشغيل"];
const Y = (i) => (N - 1 - i) * G, H0 = (i) => 10 + i * 9;
const TOP = N - 1, NEAR = [1, 0.55, 0.12];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  // Fitted to the plinth with the top step lifted and the pawn on it.
  const C = Cam(45, 0.5, 2.0);
  const Y1 = Y(0) + FOOT + 6;
  fit(C, [[-6, -6, -PB], [W + 6, Y1, -PB], [W + 6, -6, -PB], [-6, Y1, -PB], [W / 2, Y(TOP) + FOOT / 2, H0(TOP) + LIFT + 13]], 200, 170);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-6, -6, W + 6, Y1, 7, 2);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));

  // The far step (the highest) first, so nearer, lower steps cover it.
  const steps = [];
  for (let i = TOP; i >= 0; i--) {
    const [ring, inner] = rings(0, Y(i), W, Y(i) + FOOT, 3, 1.2);
    steps[i] = { ring, inner, el: solid(g), z: tween(0), drawn: NaN };
  }

  // The pawn: a disc for a foot and a post for a body. It rides one step's top.
  const pawn = mk("g", {}, g), foot = solid(pawn), body = solid(pawn);
  const fr = circ(5, 16), fi = circ(4, 16), br = circ(2.6, 12), bi = circ(1.8, 12);
  const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
  const pos = tween(TOP);
  let pawnOn = -1;

  function drawStep(i, now) {
    const s = steps[i], h = H0(i) + tval(s.z, now);
    if (h === s.drawn) return;
    s.drawn = h;
    put(s.el, prism(P, front, s.ring, s.inner, 0, h));
  }
  function drawPawn(now) {
    const t = tval(pos, now), k = clamp(Math.round(t), 0, TOP);
    if (k !== pawnOn) { pawnOn = k; steps[k].el.g.after(pawn); }
    const lo = Math.floor(t), hi = Math.ceil(t), f = t - lo;
    // between two steps it stands on the higher one and hops: it never sinks into a step
    const z = Math.max(H0(lo) + tval(steps[lo].z, now), H0(hi) + tval(steps[hi].z, now)) + 7 * Math.sin(Math.PI * f);
    const x = W / 2, y = Y(0) + FOOT / 2 - t * G;
    put(foot, prism(P, front, at(fr, x, y), at(fi, x, y), z, z + 2.5));
    put(body, prism(P, front, at(br, x, y), at(bi, x, y), z + 2.5, z + 12));
  }

  const B = register(stage, (_dt, now) => {
    let moving = !tdone(pos, now);
    steps.forEach((s, i) => { drawStep(i, now); if (!tdone(s.z, now)) moving = true; });
    drawPawn(now);
    return moving;
  });
  bag.add(B.unregister);

  // Hit test on the RESTING tops: the step whose top centre is nearest the pointer's x.
  const tops = steps.map((_, i) => P(W / 2, Y(i) + FOOT / 2, H0(i)));
  function hit([x, y]) {
    let best = -1, bd = 1e9;
    tops.forEach((p, i) => { const d = Math.abs(p[0] - x); if (d < bd) { bd = d; best = i; } });
    return bd < 26 && Math.abs(y - tops[best][1]) < 70 ? best : -1;
  }

  let act = null;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act >= 0 ? act : TOP;
    act = a;
    steps.forEach((s, i) => {
      const d = Math.abs(i - from), lift = a < 0 ? 0 : LIFT * (NEAR[Math.abs(i - a)] || 0);
      tset(s.z, lift, now, d * stag);
      s.el.sil.classList.toggle("hi", i === (a < 0 ? TOP : a));
    });
    tset(pos, a < 0 ? TOP : a, now, 0);
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
  name: "stairs",
  means: "Six steps from worker to operations manager: the one under the pointer rises, and the pawn climbs onto it.",
  rules: [1, 2, 5, 8],
  range: [0, 45, 90],
  tour: [[150, 210], [200, 170], [255, 120], null],
  mount,
});

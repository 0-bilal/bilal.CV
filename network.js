// شبكة العلاقات: رسم على شكل شبكة عصبية. في المركز صاحب السيرة، حوله المجالات،
// وحول كل مجال الجهات التي فيه. البيانات في عنصر <script type="application/json" id="network-data">.
(function () {
  const root = document.getElementById("network");
  const dataEl = document.getElementById("network-data");
  if (!root || !dataEl) return;
  const CATS = JSON.parse(dataEl.textContent);
  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svgBox = root.querySelector(".net-svg");
  const tip = root.querySelector(".net-tip");
  const panel = root.querySelector(".net-panel");
  const defaultPanel = panel.innerHTML;
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  // عشوائية ثابتة: نفس الشكل في كل مرة
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  let edges = [], hubs = [], active = -1, raf = 0, visible = false, last = 0, gPulse = null;
  const pulses = [];

  function build() {
    seed = 7;
    const small = svgBox.clientWidth < 620;
    const W = small ? 600 : 1000, H = small ? 800 : 680, SY = small ? 1.2 : 0.92;
    const cx = W / 2, cy = H / 2;
    const R1 = small ? 190 : 205, R2 = small ? 248 : 300, SPREAD = small ? 0.55 : 0.7;
    svgBox.replaceChildren();
    root.classList.toggle("small", small);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "شبكة العلاقات المهنية" }, svgBox);
    const gEdges = el("g", { class: "net-edges" }, svg);
    const gNodes = el("g", {}, svg);
    edges = []; hubs = [];
    const n = CATS.length;

    CATS.forEach((cat, ci) => {
      const a = -Math.PI / 2 + (ci / n) * Math.PI * 2;
      const hx = cx + Math.cos(a) * R1, hy = cy + Math.sin(a) * R1 * SY;
      // رابط من المركز إلى المجال، منحنٍ قليلًا كمحور عصبي
      const bend = 0.18;
      const mx = (cx + hx) / 2 - (hy - cy) * bend, my = (cy + hy) / 2 + (hx - cx) * bend;
      const spine = el("path", { d: `M${cx},${cy} Q${mx},${my} ${hx},${hy}`, class: "net-spine" }, gEdges);
      const hub = { ci, a, x: hx, y: hy, spine, leaves: [], twigs: [] };
      edges.push({ path: spine, hub: ci, main: true });

      cat.names.forEach((name, k) => {
        const t = cat.names.length === 1 ? 0.5 : k / (cat.names.length - 1);
        const ang = a + (t - 0.5) * SPREAD * 2 * (0.75 + 0.25 * Math.min(1, cat.names.length / 40)) + (rnd() - 0.5) * 0.05;
        const rr = R2 + (rnd() - 0.5) * (small ? 44 : 80) + (k % 3) * (small ? 8 : 14);
        const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * SY;
        const qx = (hx + x) / 2 + (rnd() - 0.5) * 24, qy = (hy + y) / 2 + (rnd() - 0.5) * 24;
        const twig = el("path", { d: `M${hx},${hy} Q${qx},${qy} ${x},${y}`, class: "net-twig" }, gEdges);
        const leaf = el("circle", { cx: x, cy: y, r: small ? 4 : 3.6, class: "net-leaf", tabindex: "-1" }, gNodes);
        leaf.dataset.name = name; leaf.dataset.cat = ci;
        hub.leaves.push(leaf); hub.twigs.push(twig);
        edges.push({ path: twig, hub: ci, main: false });
      });
      hubs.push(hub);
    });

    // المجالات فوق الجهات، والمركز فوق الجميع
    hubs.forEach((h) => {
      const cat = CATS[h.ci];
      const g = el("g", { class: "net-hub", tabindex: "0", role: "button", "aria-label": `${cat.label}: ${cat.names.length} جهة` }, gNodes);
      el("circle", { cx: h.x, cy: h.y, r: small ? 30 : 27, class: "net-hub-ring" }, g);
      el("text", { x: h.x, y: h.y + 1, class: "net-hub-num", "text-anchor": "middle", "dominant-baseline": "central" }, g).textContent = cat.names.length;
      // اسم المجال خارج الدائرة، بعيدًا عن المركز
      // على الشاشات الضيقة يوضع الاسم تحت الدائرة حتى لا يخرج عن الرسم
      const ox = Math.cos(h.a), oy = Math.sin(h.a);
      const side = !small && Math.abs(ox) >= 0.5;
      const lx = side ? h.x + ox * 44 : h.x, ly = small ? h.y + (oy < 0 ? -50 : 50) : side ? h.y + oy * 40 : h.y + (oy < 0 ? -44 : 46);
      // الرسم من اليمين لليسار: "end" يمدّ النص يمينًا و"start" يمدّه يسارًا
      const anchor = !side ? "middle" : ox > 0 ? "end" : "start";
      const lab = el("text", { x: lx, y: ly, class: "net-hub-label", "text-anchor": anchor, "dominant-baseline": "central" }, g);
      lab.textContent = cat.label;
      h.g = g;
      g.addEventListener("mouseenter", () => select(h.ci));
      g.addEventListener("focus", () => select(h.ci));
      g.addEventListener("click", () => select(h.ci, true));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(h.ci, true); } });
    });
    // الإشارات تُرسم تحت المركز حتى لا تمرّ فوق الاسم
    gPulse = el("g", {}, svg);
    const core = el("g", { class: "net-core" }, svg);
    el("circle", { cx, cy, r: small ? 62 : 58, class: "net-core-halo" }, core);
    el("circle", { cx, cy, r: small ? 50 : 46, class: "net-core-ring" }, core);
    el("text", { x: cx, y: cy - 10, class: "net-core-name", "text-anchor": "middle", "dominant-baseline": "central" }, core).textContent = "محمد بلال";
    el("text", { x: cx, y: cy + 16, class: "net-core-sub", "text-anchor": "middle", "dominant-baseline": "central" }, core).textContent = "الخواجة";

    // اسم الجهة عند المرور على نقطتها
    gNodes.addEventListener("pointerover", (e) => {
      const n = e.target.closest(".net-leaf");
      if (!n) return;
      tip.textContent = n.dataset.name;
      const r = svgBox.getBoundingClientRect(), c = n.getBoundingClientRect();
      tip.style.left = c.left - r.left + c.width / 2 + "px";
      tip.style.top = c.top - r.top + "px";
      tip.hidden = false;
      n.classList.add("hover");
    });
    gNodes.addEventListener("pointerout", (e) => {
      const n = e.target.closest(".net-leaf");
      if (n) { n.classList.remove("hover"); tip.hidden = true; }
    });
    if (active >= 0) select(active, true, true);
  }

  function select(ci, sticky, silent) {
    active = ci;
    root.classList.add("focused");
    hubs.forEach((h) => {
      const on = h.ci === ci;
      h.g.classList.toggle("on", on);
      h.spine.classList.toggle("on", on);
      h.twigs.forEach((t) => t.classList.toggle("on", on));
      h.leaves.forEach((l) => l.classList.toggle("on", on));
    });
    const cat = CATS[ci];
    panel.innerHTML = `<h3>${cat.label} <span>${cat.names.length} جهة</span></h3><ul class="net-names">${cat.names.map((n) => `<li>${n.replace(/[<>&]/g, "")}</li>`).join("")}</ul>`;
    if (!silent) for (let k = 0; k < 4; k++) spawn(ci);
  }
  root.addEventListener("mouseleave", () => {
    active = -1; root.classList.remove("focused");
    hubs.forEach((h) => { h.g.classList.remove("on"); h.spine.classList.remove("on"); h.twigs.forEach((t) => t.classList.remove("on")); h.leaves.forEach((l) => l.classList.remove("on")); });
    panel.innerHTML = defaultPanel;
  });

  // الإشارات: نقاط مضيئة تسري من المركز إلى المجال ثم إلى إحدى الجهات
  function spawn(ci) {
    if (!gPulse || !hubs.length) return;
    const h = hubs[ci != null ? ci : Math.floor(Math.random() * hubs.length)];
    const k = Math.floor(Math.random() * h.twigs.length);
    const dot = el("circle", { r: 3.2, class: "net-pulse" }, gPulse);
    pulses.push({ dot, legs: [h.spine, h.twigs[k]], leaf: h.leaves[k], leg: 0, t: 0, speed: 0.9 + Math.random() * 0.5 });
  }
  function frame(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    if (pulses.length < 14 && Math.random() < dt * 5) spawn(active >= 0 && Math.random() < 0.6 ? active : null);
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i], path = p.legs[p.leg], len = path.getTotalLength();
      p.t += (dt * p.speed * 260) / len;
      if (p.t >= 1) {
        if (p.leg === 0) { p.leg = 1; p.t = 0; continue; }
        p.leaf.classList.add("fire");
        setTimeout(() => p.leaf.classList.remove("fire"), 450);
        p.dot.remove(); pulses.splice(i, 1); continue;
      }
      const pt = path.getPointAtLength(p.t * len);
      p.dot.setAttribute("cx", pt.x); p.dot.setAttribute("cy", pt.y);
    }
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!reduce && visible && !raf) { last = 0; raf = requestAnimationFrame(frame); } };

  build();
  let width = svgBox.clientWidth;
  window.addEventListener("resize", () => {
    if (Math.abs(svgBox.clientWidth - width) < 40) return;
    width = svgBox.clientWidth;
    pulses.splice(0).forEach((p) => p.dot.remove());
    build();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); start(); }).observe(root);
  } else { visible = true; start(); }
})();

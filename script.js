// ===== رقم الجوال =====
// اكتب رقمك هنا مرة واحدة فقط (بالصيغة الدولية بدون + أو أصفار في البداية، مثال: 9665XXXXXXXX)
// وسيظهر تلقائيًا في كل مكان في الموقع (النص وزر الاتصال وزر واتساب).
const PHONE = "966538381612";
// طريقة عرض الرقم في الصفحة
const PHONE_DISPLAY = "+966 53 838 1612";

(function () {
  // روابط الجوال وواتساب
  document.querySelectorAll("[data-phone-link]").forEach((a) => {
    a.href = a.dataset.phoneLink === "whatsapp" ? `https://wa.me/${PHONE}` : `tel:+${PHONE}`;
  });
  document.querySelectorAll(".phone-text").forEach((el) => (el.textContent = PHONE_DISPLAY));

  // العمر الحالي من تاريخ الميلاد
  document.querySelectorAll("[data-birth]").forEach((el) => {
    const birth = new Date(el.dataset.birth + "T00:00:00"), now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
    el.textContent = `(العمر ${age} ${age >= 3 && age <= 10 ? "سنوات" : "سنة"})`;
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // اسم الواجهة: كل كلمة تظهر بعد الأخرى
  document.querySelectorAll(".hero-name").forEach((h) => {
    h.innerHTML = h.textContent.trim().split(/\s+/)
      .map((w, i) => `<span class="word" style="--i:${i}">${w}</span>`).join(" ");
    h.classList.add("split");
  });

  // ترقيم عناصر القوائم لتظهر واحدًا تلو الآخر
  document.querySelectorAll(".regions li, .steps li, .bars li").forEach((li) => {
    li.style.setProperty("--i", [...li.parentElement.children].indexOf(li));
  });

  // ظهور الأقسام عند التمرير: العناصر التي تظهر معًا تتتابع بفاصل بسيط
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        e.target.style.transitionDelay = i * 0.14 + "s";
        e.target.classList.add("in");
        io.unobserve(e.target);
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  // عدّاد الأرقام
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = el.dataset.count === "years" ? new Date().getFullYear() - 2015 : +el.dataset.count;
    const suffix = el.dataset.suffix || (el.dataset.count === "years" ? "+" : "");
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now() + (+el.dataset.delay || 0), dur = 1200;
    const step = (t) => {
      const p = Math.max(0, Math.min((t - start) / dur, 1));
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
    }));
    counters.forEach((el) => co.observe(el));
  } else counters.forEach(runCounter);

  // شريط أماكن العمل المتحرك: نكرر العناصر حتى تبدو الحركة متصلة
  document.querySelectorAll(".marquee-track").forEach((track) => {
    const items = [...track.children];
    const addCopies = () => items.forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.classList.add("clone");
      track.appendChild(copy);
    });
    // نصف الشريط يجب أن يغطي عرض الإطار كاملًا، ثم نضاعفه
    const setWidth = track.scrollWidth || 1;
    const reps = Math.max(1, Math.ceil(track.parentElement.clientWidth / setWidth));
    for (let i = 1; i < reps; i++) addCopies();
    for (let i = 0; i < reps; i++) addCopies();
    track.style.animationDuration = Math.round(6 * items.length * reps) + "s";
  });

  // الكتابة الحيّة: يُكتب النص حرفًا حرفًا كأنه يُكتب أمام الزائر
  const typers = [];
  let instant = reduceMotion; // يصبح true عند الطباعة لإظهار كل شيء فورًا
  const typeInto = (el, speed = 16) => new Promise((resolve) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push([walker.currentNode, walker.currentNode.data]);
    const finish = () => { nodes.forEach(([n, t]) => (n.data = t)); el.classList.remove("typing"); el.style.minHeight = ""; resolve(); };
    if (instant) return finish();
    el.style.minHeight = el.getBoundingClientRect().height + "px";
    nodes.forEach(([n]) => (n.data = ""));
    el.classList.add("typing");
    let ni = 0, ci = 0, done = false;
    typers.push(() => { if (!done) { done = true; finish(); } });
    const tick = () => {
      if (done) return;
      while (ni < nodes.length && ci >= nodes[ni][1].length) { ni++; ci = 0; }
      if (ni >= nodes.length) { done = true; return finish(); }
      const [n, t] = nodes[ni];
      ci = Math.min(t.length, ci + (t[ci] === " " ? 2 : 1));
      n.data = t.slice(0, ci);
      setTimeout(tick, speed);
    };
    tick();
  });
  const typeChips = async (list, speed = 22) => {
    if (list.dataset.typed) return;
    list.dataset.typed = "1";
    const items = [...list.children];
    if (instant) return items.forEach((li) => li.classList.remove("waiting"));
    items.forEach((li) => li.classList.add("waiting"));
    for (const li of items) { li.classList.remove("waiting"); await typeInto(li, speed); }
  };
  const whenVisible = (el, fn) => {
    if (!("IntersectionObserver" in window)) return fn();
    const ob = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { ob.disconnect(); setTimeout(fn, 300); }
    }, { rootMargin: "0px 0px -30% 0px" });
    ob.observe(el);
  };

  if (!reduceMotion) document.querySelectorAll("[data-type-chips] .chips li").forEach((li) => li.classList.add("waiting"));
  document.querySelectorAll("[data-type]").forEach((el) => {
    const card = el.closest(".card") || el;
    card.classList.add("type-pending");
    whenVisible(card, async () => {
      await typeInto(el);
      card.classList.remove("type-pending");
      const chipsCard = card.closest("section") && card.closest("section").querySelector("[data-type-chips]");
      if (chipsCard && !chipsCard.dataset.typed) {
        chipsCard.dataset.typed = "1";
        const active = chipsCard.querySelector(".tab-panel:not([hidden])");
        if (active) typeChips(active);
      }
    });
  });

  // أزرار "اقرأ المزيد"
  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    const panel = document.getElementById(btn.dataset.toggle);
    const label = btn.textContent;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", panel.id);
    btn.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? "إخفاء" : label;
      if (open && btn.hasAttribute("data-type-more") && !panel.dataset.typed) {
        panel.dataset.typed = "1";
        (async () => { for (const para of panel.querySelectorAll("p")) await typeInto(para, 12); })();
      }
    });
  });

  // تبويبات المهارات
  const tabs = document.querySelectorAll(".tab[data-tab]");
  tabs.forEach((tab) => tab.addEventListener("click", () => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      document.getElementById(t.dataset.tab).hidden = !on;
    });
    typeChips(document.getElementById(tab.dataset.tab), 14);
  }));

  // نافذة تفاصيل المشاريع
  const modal = document.getElementById("modal");
  if (modal) {
    document.querySelectorAll("[data-modal]").forEach((btn) => btn.addEventListener("click", () => {
      const card = btn.closest(".project");
      const logo = card.querySelector("img"), mono = card.querySelector(".mono");
      const modalImg = document.getElementById("modal-img"), modalMono = document.getElementById("modal-mono");
      modalImg.hidden = !logo; modalMono.hidden = !!logo;
      if (logo) modalImg.src = logo.src; else modalMono.textContent = mono.textContent;
      document.getElementById("modal-title").textContent = card.querySelector("h3").textContent;
      document.getElementById("modal-sub").textContent = card.querySelector(".sub").textContent;
      const body = document.getElementById("modal-body");
      body.replaceChildren(document.getElementById(btn.dataset.modal).content.cloneNode(true));
      modal.showModal();
    }));
    document.getElementById("modal-close").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  }

  // قائمة الهاتف
  const menuBtn = document.getElementById("menu-btn");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }));
  }

  // تمييز القسم الحالي في شريط التنقل
  const links = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (sections.length) {
    const onScroll = () => {
      let current = null;
      sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.35) current = s.id; });
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
      document.querySelector(".topbar").classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // التصفية حسب المجال (صفحتا الشهادات والمشاريع)
  const filters = document.querySelectorAll("[data-filter]");
  filters.forEach((f) => f.addEventListener("click", () => {
    filters.forEach((x) => x.setAttribute("aria-selected", String(x === f)));
    document.querySelectorAll(".filter-list > [data-cat]").forEach((c) => {
      c.hidden = f.dataset.filter !== "all" && c.dataset.cat !== f.dataset.filter;
    });
  }));

  // عند الطباعة: افتح كل الأقسام المطوية
  window.addEventListener("beforeprint", () => {
    document.querySelectorAll(".more").forEach((p) => { p.classList.add("open"); p.style.maxHeight = "none"; });
    document.querySelectorAll(".tab-panel").forEach((p) => (p.hidden = false));
    reveals.forEach((el) => el.classList.add("in"));
    instant = true;
    typers.forEach((stop) => stop());
    document.querySelectorAll(".waiting").forEach((li) => li.classList.remove("waiting"));
  });
})();

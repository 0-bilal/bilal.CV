// ===== رقم الجوال =====
// اكتب رقمك هنا مرة واحدة فقط (بالصيغة الدولية بدون + أو أصفار في البداية، مثال: 9665XXXXXXXX)
// وسيظهر تلقائيًا في كل مكان في الموقع (النص وزر الاتصال وزر واتساب).
const PHONE = "966538381612";
// طريقة عرض الرقم في الصفحة
const PHONE_DISPLAY = "+966 53 838 1612";

(function () {
  const EN = document.documentElement.lang === "en";

  // زر اللغة: ينقل إلى نفس الصفحة باللغة الأخرى، ويحافظ على القسم المفتوح (#)
  document.querySelectorAll("[data-lang-switch]").forEach((a) => a.addEventListener("click", () => {
    if (location.hash) a.href = a.href.split("#")[0] + location.hash;
  }));

  // زر «تحميل PDF»: ملف السيرة الذاتية حسب لغة الصفحة (المصدر والبناء في مجلد cv/)
  document.querySelectorAll("[data-cv]").forEach((a) => {
    const lang = document.documentElement.lang === "en" ? "EN" : "AR";
    a.href = a.getAttribute("href").replace(/CV-(AR|EN)\.pdf/, `CV-${lang}.pdf`);
  });

  // قائمة «تحميل PDF»: خياران (السيرة المصممة ونسخة ATS)، تُغلق بالاختيار أو Esc أو الضغط خارجها
  document.querySelectorAll("[data-cv-toggle]").forEach((btn) => {
    const menu = document.getElementById(btn.getAttribute("aria-controls"));
    const set = (open) => { menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => {
      set(menu.hidden);
      if (!menu.hidden) menu.querySelector("a").focus();
    });
    // يُغلق بعد بدء التحميل، لا قبله
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setTimeout(() => set(false), 0); });
    document.addEventListener("click", (e) => { if (!menu.hidden && !btn.parentElement.contains(e.target)) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); } });
  });

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
    el.textContent = EN ? `(age ${age})` : `(العمر ${age} ${age >= 3 && age <= 10 ? "سنوات" : "سنة"})`;
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
  const counterFinal = (el) => {
    const target = el.dataset.count === "years" ? new Date().getFullYear() - 2015 : +el.dataset.count;
    const suffix = el.dataset.suffix || (el.dataset.count === "years" ? "+" : "");
    return [target, suffix];
  };
  const runCounter = (el) => {
    const [target, suffix] = counterFinal(el);
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now() + (+el.dataset.delay || 0), dur = 1200;
    const step = (t) => {
      const p = Math.max(0, Math.min((t - start) / dur, 1));
      if (el.dataset.done) return;
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

  // الأشرطة المتحركة: نكرر العناصر حتى تبدو الحركة متصلة
  const initMarquee = (track) => {
    if (track.dataset.ready || !track.offsetParent) return;
    track.dataset.ready = "1";
    const items = [...track.children];
    const addCopies = () => items.forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.setAttribute("tabindex", "-1");
      copy.classList.add("clone");
      track.appendChild(copy);
    });
    // نصف الشريط يجب أن يغطي عرض الإطار كاملًا، ثم نضاعفه
    const setWidth = track.scrollWidth || 1;
    const widest = Math.max(track.parentElement.clientWidth, window.screen.width || 0, 1920);
    const reps = Math.max(1, Math.ceil(widest / setWidth));
    for (let i = 1; i < reps; i++) addCopies();
    for (let i = 0; i < reps; i++) addCopies();
    track.style.animationDuration = Math.round(6 * items.length * reps) + "s";
  };
  document.querySelectorAll(".marquee-track").forEach(initMarquee);

  // الكتابة الحيّة: يُكتب النص حرفًا حرفًا كأنه يُكتب أمام الزائر
  const typers = [];
  let instant = reduceMotion; // يصبح true عند الطباعة لإظهار كل شيء فورًا
  // prepareType يُفرغ النص فورًا ويحجز مكانه، ويعيد دالة تبدأ الكتابة.
  // نُفرغ كل الفقرات أولًا ثم نكتبها بالترتيب، حتى لا تظهر فقرة ثم تختفي ثم تُكتب.
  const prepareType = (el, speed = 16) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push([walker.currentNode, walker.currentNode.data]);
    let done = false, resolveRun = () => {};
    const finish = () => { done = true; nodes.forEach(([n, t]) => (n.data = t)); el.classList.remove("typing"); el.style.minHeight = ""; resolveRun(); };
    if (instant) { finish(); return () => Promise.resolve(); }
    el.style.minHeight = el.getBoundingClientRect().height + "px";
    nodes.forEach(([n]) => (n.data = ""));
    typers.push(() => { if (!done) finish(); });
    return () => new Promise((resolve) => {
      resolveRun = resolve;
      if (done) return resolve();
      el.classList.add("typing");
      typeLoop(nodes, speed, () => done, finish);
    });
  };
  const typeLoop = (nodes, speed, isDone, finish) => {
    let ni = 0, ci = 0;
    const tick = () => {
      if (isDone()) return;
      while (ni < nodes.length && ci >= nodes[ni][1].length) { ni++; ci = 0; }
      if (ni >= nodes.length) return finish();
      const [n, t] = nodes[ni];
      ci = Math.min(t.length, ci + (t[ci] === " " ? 2 : 1));
      n.data = t.slice(0, ci);
      setTimeout(tick, speed);
    };
    tick();
  };
  const typeInto = (el, speed) => prepareType(el, speed)();
  const whenVisible = (el, fn) => {
    if (!("IntersectionObserver" in window)) return fn();
    const ob = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { ob.disconnect(); setTimeout(fn, 300); }
    }, { rootMargin: "0px 0px -30% 0px" });
    ob.observe(el);
  };

  document.querySelectorAll("[data-type]").forEach((el) => {
    const card = el.closest(".card") || el;
    card.classList.add("type-pending");
    whenVisible(card, async () => {
      await typeInto(el);
      card.classList.remove("type-pending");
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
      if (open) {
        panel.style.maxHeight = panel.scrollHeight + "px";
        const release = (e) => { if (e.target === panel && panel.classList.contains("open")) panel.style.maxHeight = "none"; };
        panel.addEventListener("transitionend", release, { once: true });
        if (reduceMotion) panel.style.maxHeight = "none";
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.getBoundingClientRect(); // يثبت الارتفاع الحالي قبل الإغلاق ليعمل الانتقال
        panel.style.maxHeight = "0px";
      }
      btn.setAttribute("aria-expanded", String(open));
      btn.textContent = open ? (EN ? "Hide" : "إخفاء") : label;
      if (open && btn.hasAttribute("data-type-more") && !panel.dataset.typed) {
        panel.dataset.typed = "1";
        const runs = [...panel.querySelectorAll("p")].map((para) => prepareType(para, 12));
        (async () => { for (const run of runs) await run(); })();
      }
    });
  });

  // أيقونات البرامج: الضغط على أيقونة يوقف الشريطين ويُظهر فوقها اسم البرنامج واستخدامه
  const techPanel = document.getElementById("sk-tech");
  if (techPanel) {
    const tip = techPanel.querySelector(".app-tip");
    const strips = techPanel.querySelectorAll(".marquee");
    let pinned = null;
    const show = (app) => {
      tip.innerHTML = `<b dir="ltr">${app.dataset.name}</b><span>${app.dataset.use}</span>`;
      tip.hidden = false;
      const p = techPanel.getBoundingClientRect(), r = app.getBoundingClientRect();
      const half = tip.offsetWidth / 2, x = r.left - p.left + r.width / 2;
      tip.style.left = Math.min(Math.max(x, half + 4), p.width - half - 4) + "px";
      tip.style.top = r.top - p.top - 10 + "px";
      strips.forEach((m) => m.classList.add("paused"));
    };
    const hide = () => { tip.hidden = true; pinned = null; strips.forEach((m) => m.classList.remove("paused")); };
    techPanel.addEventListener("click", (e) => {
      const app = e.target.closest(".app");
      if (!app) return hide();
      if (pinned === app) return hide();
      pinned = app; show(app);
    });
    techPanel.addEventListener("keydown", (e) => {
      const app = e.target.closest(".app");
      if (app && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pinned = app; show(app); }
      if (e.key === "Escape") hide();
    });
    techPanel.addEventListener("pointerover", (e) => {
      const app = e.target.closest(".app");
      if (app && e.pointerType === "mouse" && !pinned) show(app);
    });
    techPanel.addEventListener("pointerout", (e) => {
      const app = e.target.closest(".app");
      if (app && e.pointerType === "mouse" && !pinned && !app.contains(e.relatedTarget)) hide();
    });
    document.addEventListener("click", (e) => { if (pinned && !techPanel.contains(e.target)) hide(); });
  }

  // خزانة المشاريع: الضغط على درج يعرض تعريف مشروعه في اللوحة المجاورة
  const panel = document.querySelector(".qb-panel");
  if (panel) {
    document.addEventListener("hl-pick", (e) => {
      const info = [...panel.querySelectorAll(".qb-info[data-name]")].find((x) => x.dataset.name === e.detail);
      if (!info) return;
      panel.querySelectorAll(".qb-info").forEach((x) => { x.hidden = x !== info; });
      info.classList.remove("show");
      void info.offsetWidth; // يعيد تشغيل حركة الظهور
      info.classList.add("show");
      if (window.innerWidth <= 860) panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    });
  }

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
    const closeMenu = () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); };
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    document.addEventListener("click", (e) => { if (!nav.contains(e.target) && !menuBtn.contains(e.target)) closeMenu(); });
  }

  // تمييز القسم الحالي في شريط التنقل
  const links = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const topbar = document.querySelector(".topbar");
  const onScroll = () => {
    if (topbar) topbar.classList.toggle("scrolled", window.scrollY > 8);
    if (!sections.length) return;
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.35) current = s.id; });
    // في نهاية الصفحة يكون القسم الأخير هو الحالي حتى لو كان قصيرًا
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections[sections.length - 1].id;
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
    counters.forEach((el) => { const [t, sfx] = counterFinal(el); el.dataset.done = "1"; el.textContent = t + sfx; });
    document.querySelectorAll(".waiting").forEach((li) => li.classList.remove("waiting"));
  });
})();

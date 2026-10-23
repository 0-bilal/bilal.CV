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

  // ظهور الأقسام عند التمرير
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
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
    const start = performance.now(), dur = 1200;
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
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
  });
})();

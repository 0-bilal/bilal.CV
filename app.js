(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hoursLabel = (n) => (n === 1 ? "ساعة واحدة" : n === 2 ? "ساعتان" : n <= 10 ? `${n} ساعات` : `${n} ساعة`);
  const fmtDate = (d) => new Date(d).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn", { year: "numeric", month: "long", day: "numeric" });

  // Hero
  $("name").textContent = CV.name;
  $("name-en").textContent = CV.nameEn;
  $("title").textContent = CV.title;
  $("about-text").textContent = CV.about;
  $("footer-name").textContent = CV.name;
  $("year").textContent = new Date().getFullYear();
  $("github-link").href = CV.github;

  const totalHours = CV.certificates.reduce((sum, c) => sum + c.hours, 0);
  const years = new Date().getFullYear() - CV.startYear;
  const stats = [
    [years + "+", "سنوات خبرة"],
    [CV.certificates.length, "شهادة تدريبية"],
    [totalHours, "ساعة تدريب"],
    [2, "فرعان تحت إدارتي"],
  ];
  $("stats").innerHTML = stats
    .map(([n, label]) => `<div class="stat"><b>${esc(n)}</b><span>${esc(label)}</span></div>`)
    .join("");

  // Experience
  $("timeline").innerHTML = CV.experience
    .map((job) => {
      const ladder = job.roles.length
        ? `<ol class="ladder">${job.roles.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>`
        : "";
      const extra = job.extra ? `<p class="extra">${esc(job.extra)}</p>` : "";
      const exit = job.exit ? `<div class="exit"><b>سبب ترك العمل:</b> ${esc(job.exit)}</div>` : "";
      return `<article class="job">
        <div class="job-head"><h3>${esc(job.company)}</h3><span class="period">${esc(job.period)}</span></div>
        <p>${esc(job.summary)}</p>${ladder}${extra}${exit}
      </article>`;
    })
    .join("");

  // Certificates
  $("cert-summary").textContent =
    `${CV.certificates.length} شهادة إتمام دورات إلكترونية من منصة دروب (صندوق تنمية الموارد البشرية – هدف) بإجمالي ${totalHours} ساعة تدريبية.`;

  const used = new Set(CV.certificates.map((c) => c.category));
  const cats = Object.keys(CV.categories).filter((k) => k === "all" || used.has(k));
  let current = "all";

  function renderFilters() {
    $("filters").innerHTML = cats
      .map((k) => `<button class="chip" role="tab" data-cat="${k}" aria-selected="${k === current}">${esc(CV.categories[k])}</button>`)
      .join("");
  }
  function renderCerts() {
    const list = CV.certificates.filter((c) => current === "all" || c.category === current);
    $("cert-grid").innerHTML = list
      .map((c) => `<a class="cert" href="certificates/${c.file}.pdf" target="_blank" rel="noopener">
        <img src="certificates/thumbs/${c.file}.jpg" alt="شهادة ${esc(c.title)}" loading="lazy" width="596" height="420">
        <div class="cert-body">
          <h3>${esc(c.title)}</h3>
          <p class="en">${esc(c.en)}</p>
          <div class="meta"><span class="hours">${hoursLabel(c.hours)}</span><span>${fmtDate(c.date)}</span><span>دروب</span></div>
        </div>
      </a>`)
      .join("");
  }
  $("filters").addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    current = btn.dataset.cat;
    renderFilters();
    renderCerts();
  });
  renderFilters();
  renderCerts();

  // Projects (QB)
  $("project-list").innerHTML = CV.projects.length
    ? CV.projects
        .map((p) => `<article class="project">
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.description)}</p>
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
          ${p.link ? `<p><a href="${esc(p.link)}" target="_blank" rel="noopener">عرض المشروع ←</a></p>` : ""}
        </article>`)
        .join("")
    : `<div class="empty">برمجيات QB — تفاصيل المشاريع ستُضاف قريبًا.</div>`;

  // Highlight the active section in the bottom nav
  const links = [...document.querySelectorAll(".bottom-nav a")];
  const targets = links.map((a) => document.querySelector(a.getAttribute("href")));
  const onScroll = () => {
    let idx = 0;
    targets.forEach((t, i) => { if (t.getBoundingClientRect().top < window.innerHeight * 0.4) idx = i; });
    links.forEach((a, i) => a.classList.toggle("active", i === idx));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

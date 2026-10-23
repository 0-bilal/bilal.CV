// يربط رسومات Hairline بالموقع: كل ملف رسمة يستدعي hairline({ ... }) عند تحميله،
// فنضعه في العنصر الذي يحمل data-figure باسمه، ونشغّل جولته التلقائية.
// يجب تحميل هذا الملف بعد kernel.js وقبل ملفات الرسومات.
(() => {
  let injected = false;
  window.hairline = (figure) => {
    const stage = document.querySelector(`[data-figure="${figure.name}"]`);
    if (!stage) return;
    if (!injected) { HL.inject(document); injected = true; }

    const card = stage.closest(".hl-card");
    const out = card && card.querySelector(".hl-read");
    const restLabel = out ? out.textContent : "";
    stage.setAttribute("data-hairline", figure.name);
    stage.setAttribute("role", "img");
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);

    // ما يقرؤه الشكل يظهر تحت الرسمة؛ وعند الراحة تظهر عبارة الإرشاد
    let text = null;
    const read = {
      get textContent() { return text; },
      set textContent(value) {
        text = value == null ? "" : String(value);
        if (out) {
          out.textContent = text === "rest" ? restLabel : text;
          out.classList.toggle("on", text !== "rest");
        }
      },
    };

    figure.mount({ stage, svg, read }, figure.range[1]);
    // الضغط على الرسمة يرسل اسم ما تحت المؤشر إلى الصفحة (حدث hl-pick)
    stage.addEventListener("click", () => {
      if (text && text !== "rest") stage.dispatchEvent(new CustomEvent("hl-pick", { detail: text, bubbles: true }));
    });
    // الجولة التلقائية: مؤشر خفي يمرّ على الرسمة حتى يلمسها الزائر بنفسه
    HL.tour(stage, figure.tour || HL.LAP);
  };
})();

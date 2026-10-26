// يبني ملفات PDF للسيرة الذاتية: النسخة المصممة (cv-ar.html وcv-en.html، ورقة A4 واحدة)
// ونسخة ATS (cv-ats-ar.html وcv-ats-en.html، نص بعمود واحد، صفحتان كحد أقصى).
// التشغيل من جذر المشروع: node cv/build.js
// يحتاج Playwright مع Chromium، واتصالًا بالإنترنت لتحميل خط IBM Plex من Google Fonts.
const fs = require("fs");
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const files = [
  ["cv-ar.html", "Bilal-Zakaria-AlKhawaja-CV-AR.pdf"],
  ["cv-en.html", "Bilal-Zakaria-AlKhawaja-CV-EN.pdf"],
  ["cv-ats-ar.html", "Bilal-Zakaria-AlKhawaja-ATS-CV-AR.pdf", { ats: true }],
  ["cv-ats-en.html", "Bilal-Zakaria-AlKhawaja-ATS-CV-EN.pdf", { ats: true }],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [src, out, opts = {}] of files) {
    await page.goto("file://" + path.join(__dirname, src), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    if (!opts.ats) {
      // النسخة المصممة يجب أن تبقى ورقة واحدة: نتحقق أن المحتوى لم يتجاوز حدود الورقة
      const overflow = await page.evaluate(() => {
        const bottom = document.querySelector(".page").getBoundingClientRect().bottom;
        return [...document.querySelectorAll(".side > *, .main > *")].some((el) => el.getBoundingClientRect().bottom > bottom - 6);
      });
      if (overflow) throw new Error(src + ": المحتوى أطول من ورقة A4 واحدة، اختصره");
    }
    const file = path.join(__dirname, out);
    await page.pdf({ path: file, format: "A4", printBackground: !opts.ats, preferCSSPageSize: true });
    if (opts.ats) {
      const pages = (fs.readFileSync(file, "latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
      if (pages > 2) throw new Error(src + `: نسخة ATS في ${pages} صفحات، والحد صفحتان؛ اختصرها`);
    }
    console.log("built", out);
  }
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });

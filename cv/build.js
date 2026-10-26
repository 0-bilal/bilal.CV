// يبني ملفات PDF للسيرة الذاتية من cv-ar.html وcv-en.html.
// التشغيل من جذر المشروع: node cv/build.js
// يحتاج Playwright مع Chromium، واتصالًا بالإنترنت لتحميل خط IBM Plex من Google Fonts.
const path = require("path");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");

const files = [
  ["cv-ar.html", "Bilal-Zakaria-AlKhawaja-CV-AR.pdf"],
  ["cv-en.html", "Bilal-Zakaria-AlKhawaja-CV-EN.pdf"],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const [src, out] of files) {
    await page.goto("file://" + path.join(__dirname, src), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    // الصفحة يجب أن تبقى ورقة واحدة: نتحقق أن المحتوى لم يتجاوز حدود الورقة
    const overflow = await page.evaluate(() => {
      const bottom = document.querySelector(".page").getBoundingClientRect().bottom;
      return [...document.querySelectorAll(".side > *, .main > *")].some((el) => el.getBoundingClientRect().bottom > bottom - 6);
    });
    if (overflow) throw new Error(src + ": المحتوى أطول من ورقة A4 واحدة، اختصره");
    await page.pdf({ path: path.join(__dirname, out), format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log("built", out);
  }
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });

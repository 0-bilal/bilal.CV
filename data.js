// بيانات السيرة الذاتية — عدّل هذا الملف لتحديث محتوى الموقع
const CV = {
  name: "بلال زكريا الخواجه",
  nameEn: "Bilal Zakaria Al-Khawaja",
  title: "إدارة تشغيل المتاجر · المشتريات · التدريب · مطوّر برمجيات",
  startYear: 2015,
  about:
    "أعمل في مجال الأعمال منذ عام 2015، وبدأت من أرض المتجر: الاستقبال والكاشير والتحضير. ترقّيت درجةً درجة حتى أدرت فرعين، ثم أدرت المشتريات والتدريب. أهتم بتطوير فرق العمل وضبط التكاليف، وأبني حلولًا برمجية تخدم بيئة العمل.",
  github: "https://github.com/0-bilal",

  experience: [
    {
      company: "عصير تايم",
      period: "2020 – 2025",
      summary:
        "أبرز محطاتي المهنية؛ بدأت فيها عاملًا وتدرّجت في المناصب حتى إدارة المشتريات ثم إدارة التدريب.",
      roles: [
        "عامل",
        "موظف تحضير منتجات",
        "كاشير",
        "مدير فرع",
        "مدير فرعين",
        "إدارة المشتريات",
        "إدارة التدريب",
      ],
      extra: "إلى جانب أعمال ومهام متعددة في أقسام أخرى من المؤسسة.",
      exit:
        "استقالة طوعية؛ رأيت أن المؤسسة لم تعد بحاجة إلى منصب بخبرتي، فكان خروجي لتقليل التكاليف هو الأفضل للمؤسسة.",
    },
    {
      company: "فروز",
      period: "2019 – 2020",
      summary: "متجر آيس كريم؛ عملت في صالة المتجر ثم في منطقة التحضير.",
      roles: ["موظف استقبال في صالة المتجر", "كاشير", "تحضير منتجات الآيس كريم"],
      exit: "تقليص عدد الموظفين بسبب جائحة كورونا.",
    },
    {
      company: "أعمال متنوعة",
      period: "2015 – 2019",
      summary: "بداية مسيرتي في مجال الأعمال والعمل مع العملاء.",
      roles: [],
    },
  ],

  // category: retail | customer | accounting | tech | other
  certificates: [
    { title: "التصوير الفوتوغرافي وتحرير الصور - اصنع صورًا جذابة", en: "Photography and Image Editing", hours: 25, date: "2020-04-10", file: "photography", category: "other" },
    { title: "مبادئ المحاسبة المالية - الدورة المحاسبية", en: "Principles of Financial Accounting - Accounting Cycle", hours: 8, date: "2020-04-08", file: "accounting-cycle", category: "accounting" },
    { title: "مبادئ المحاسبة المالية - الإطار العام للمحاسبة", en: "Principles of Financial Accounting - Accounting Framework", hours: 7, date: "2020-04-08", file: "accounting-framework", category: "accounting" },
    { title: "مبادئ المحاسبة المالية - التسوية الجردية وإعداد القوائم المالية", en: "Adjustments Entries and Financial Statements Preparation", hours: 7, date: "2020-04-10", file: "accounting-statements", category: "accounting" },
    { title: "خدمة العملاء - تعامل باحترافية", en: "Customer Service - Professional Interaction", hours: 5, date: "2020-04-08", file: "customer-service", category: "customer" },
    { title: "التواصل الفعال مع العملاء", en: "Communicate Effectively with Customers", hours: 4, date: "2020-04-07", file: "customer-communication", category: "customer" },
    { title: "السلامة وعمليات المتجر اليومية", en: "Safety and Daily Store Operations", hours: 3, date: "2020-04-11", file: "store-safety", category: "retail" },
    { title: "العمل الجماعي في متجر البيع بالتجزئة", en: "Teamwork in the Retail Store", hours: 3, date: "2020-04-11", file: "retail-teamwork", category: "retail" },
    { title: "إجراءات نقطة البيع", en: "Point of Sale Procedures", hours: 3, date: "2020-04-13", file: "point-of-sale", category: "retail" },
    { title: "التعامل مع مدفوعات العميل", en: "Dealing with Customer Payments", hours: 3, date: "2020-04-15", file: "customer-payments", category: "retail" },
    { title: "أمن المعلومات", en: "Cyber Security", hours: 3, date: "2020-04-08", file: "cyber-security", category: "tech" },
    { title: "المبيعات والتسويق", en: "Sales and Marketing", hours: 2, date: "2020-04-12", file: "sales-marketing", category: "retail" },
    { title: "أساسيات صيانة الجوالات", en: "Basic Mobile Maintenance Skills", hours: 2, date: "2020-04-07", file: "mobile-maintenance", category: "tech" },
    { title: "إجراءات الوقاية ومكافحة العدوى من فيروس كورونا", en: "Coronavirus Infection Prevention and Control", hours: 2, date: "2020-04-09", file: "covid-prevention", category: "other" },
    { title: "إدارة بيانات العملاء", en: "Customer Data Management", hours: 1, date: "2020-04-11", file: "customer-data", category: "customer" },
    { title: "أخلاقيات العمل الذكية", en: "Smart Work Ethics", hours: 1, date: "2020-04-07", file: "work-ethics", category: "other" },
  ],

  categories: {
    all: "الكل",
    retail: "التجزئة والمتاجر",
    customer: "خدمة العملاء",
    accounting: "المحاسبة",
    tech: "التقنية",
    other: "أخرى",
  },

  // أعمال QB البرمجية — أضف المشاريع هنا: { name, description, tags: [], link }
  projects: [],
};

export type ArticleMode = "breakdown" | "findFix";
export type ArticleId = "bali" | "remote" | "morning" | "bandung" | "bike";

export interface ArticleFilter {
  mode: ArticleMode | "all";
  articleId: ArticleId | "all";
}

export interface ArticleSegment {
  text: string;
  spanId?: string;
  /** Grammar structure label shown in explanations or Spot feedback. */
  structure?: string;
}

export interface BreakdownQuestion {
  kind: "diagnose" | "spot";
  id: string;
  articleId: ArticleId;
  articleTitle: string;
  category: string;
  segments: ArticleSegment[];
  /** For `diagnose`, the highlighted span; for `spot`, the primary target span. */
  targetSpanId: string;
  /** Additional acceptable spans when multiple phrases share the asked structure in `spot`. */
  acceptedSpanIds?: readonly string[];
  prompt: string;
  /** Answer options shown as tap chips for `diagnose`. */
  options?: readonly string[];
  answer: string;
  spokenSentence: string;
  hint: string;
  explanation: string;
}

export interface FindFixQuestion {
  kind: "findFix";
  id: string;
  articleId: ArticleId;
  articleTitle: string;
  category: string;
  rule: string;
  segments: ArticleSegment[];
  errorSpanId: string;
  wrongText: string;
  correction: string;
  acceptedCorrections?: readonly string[];
  spokenSentence: string;
  hint: string;
  explanation: string;
}

export type ArticleQuestion = BreakdownQuestion | FindFixQuestion;

export const ARTICLE_TITLES: Record<ArticleId, string> = {
  bali: "Bali: Island of the Gods",
  remote: "Remote Work & Cafes",
  morning: "Morning Habits for Focus",
  bandung: "A Rainy Trip to Bandung",
  bike: "City Bike-Sharing Program",
};

export const ARTICLE_MODE_LABELS: Record<ArticleMode, string> = {
  breakdown: "Bedah Struktur",
  findFix: "Cari & Perbaiki",
};

export function buildArticlePool(): ArticleQuestion[] {
  const pool: ArticleQuestion[] = [];

  // =========================================================================
  // 1. BALI: ISLAND OF THE GODS
  // =========================================================================
  const baliIntroSegments: ArticleSegment[] = [
    { text: "Bali, the Island of Gods, " },
    { text: "is", spanId: "is", structure: "Present Simple Nominal" },
    { text: " one of the most famous travel destinations in Indonesia. Geographically, Bali province " },
    { text: "is bordered", spanId: "bordered", structure: "Present Simple Passive" },
    { text: " by the Bali Strait to the west and the Indian Ocean to the south. Visitors " },
    { text: "can enjoy", spanId: "enjoy", structure: "Modal + V1 (Active)" },
    { text: " scenic landscapes in Ubud, while surfers " },
    { text: "prefer visiting", spanId: "visiting", structure: "Verb + Gerund" },
    { text: " Kuta and Canggu." },
  ];

  pool.push(
    {
      kind: "diagnose",
      id: "bali-bd-passive",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      segments: baliIntroSegments,
      targetSpanId: "bordered",
      prompt: "Struktur grammar apa yang dipakai pada frasa yang disorot?",
      options: [
        "Present Simple Passive",
        "Present Simple Active",
        "Past Simple Passive",
        "Present Continuous",
      ],
      answer: "Present Simple Passive",
      spokenSentence:
        "Geographically, Bali province is bordered by the Bali Strait to the west and the Indian Ocean to the south.",
      hint: "Perhatikan pola “is + V3 (bordered) + by ...”. Provinsi Bali bukan melakukan aksi, melainkan dibatasi oleh laut.",
      explanation:
        "“is bordered” menggunakan Present Simple Passive (is/am/are + V3) untuk menyatakan fakta geografis pasif (“dibatasi oleh”).",
    },
    {
      kind: "spot",
      id: "bali-spot-modal-active",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      segments: baliIntroSegments,
      targetSpanId: "enjoy",
      prompt: "Ketuk frasa di artikel yang memakai struktur Modal + V1 (Active).",
      answer: "can enjoy",
      spokenSentence: "Visitors can enjoy scenic landscapes in Ubud, while surfers prefer visiting Kuta and Canggu.",
      hint: "Cari kata bantu modal (seperti can/should/must) yang langsung diikuti kata kerja dasar V1.",
      explanation:
        "“can enjoy” adalah Modal + V1 aktif yang menyatakan kemampuan atau kesempatan bagi pengunjung untuk menikmati pemandangan.",
    },
    {
      kind: "diagnose",
      id: "bali-bd-gerund",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      segments: baliIntroSegments,
      targetSpanId: "visiting",
      prompt: "Apa pola kata kerja pada bagian “prefer visiting”?",
      options: [
        "Verb + Gerund",
        "Present Continuous",
        "Verb + To-Infinitive",
        "Modal + V1 (Active)",
      ],
      answer: "Verb + Gerund",
      spokenSentence: "Visitors can enjoy scenic landscapes in Ubud, while surfers prefer visiting Kuta and Canggu.",
      hint: "“prefer” diikuti oleh kata kerja berbentuk -ing sebagai objeknya (bukan to be + V-ing).",
      explanation:
        "“prefer visiting” menggunakan pola Verb + Gerund (V-ing). Tidak ada to be (am/is/are) di depannya, jadi ini bukan Present Continuous.",
    },
  );

  const baliGrowthSegments: ArticleSegment[] = [
    { text: "Nowadays, Seminyak and Canggu " },
    { text: "are growing", spanId: "growing", structure: "Present Continuous" },
    { text: " rapidly and " },
    { text: "aim to become", spanId: "aim", structure: "Verb + To-Infinitive" },
    { text: " top lifestyle hubs. They offer what modern tourists want when they " },
    { text: "decide to visit", spanId: "decide", structure: "Verb + To-Infinitive" },
    { text: " the island. Peaceful cafes, yoga studios, and local culture " },
    { text: "can be found", spanId: "found", structure: "Modal + Passive Voice" },
    { text: " easily in both areas, which is why Canggu " },
    { text: "became", spanId: "became", structure: "Past Simple" },
    { text: " a favorite spot for business." },
  ];

  pool.push(
    {
      kind: "diagnose",
      id: "bali-bd-continuous",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      segments: baliGrowthSegments,
      targetSpanId: "growing",
      prompt: "Mengapa kalimat pertama memakai bentuk “are growing”?",
      options: [
        "Present Continuous",
        "Present Simple Passive",
        "Verb + Gerund",
        "Past Continuous",
      ],
      answer: "Present Continuous",
      spokenSentence: "Nowadays, Seminyak and Canggu are growing rapidly and aim to become top lifestyle hubs.",
      hint: "Perhatikan penanda waktu “Nowadays” (saat ini) dan pola to be jamak “are” + V-ing.",
      explanation:
        "“are growing” adalah Present Continuous (am/is/are + V-ing) untuk perkembangan yang sedang berlangsung di masa kini (“Nowadays”).",
    },
    {
      kind: "spot",
      id: "bali-spot-modal-passive",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      segments: baliGrowthSegments,
      targetSpanId: "found",
      prompt: "Ketuk frasa di artikel yang memakai struktur Modal + Passive Voice.",
      answer: "can be found",
      spokenSentence: "Peaceful cafes, yoga studios, and local culture can be found easily in both areas.",
      hint: "Cari pola “modal + be + V3” (bisa di-/ditemukan).",
      explanation:
        "“can be found” menggunakan pola Modal + Passive (can + be + V3) karena kafe, studio yoga, dan budaya bukan mencari, melainkan “dapat ditemukan”.",
    },
    {
      kind: "spot",
      id: "bali-spot-infinitive",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      segments: baliGrowthSegments,
      targetSpanId: "decide",
      acceptedSpanIds: ["aim", "decide"],
      prompt: "Ketuk salah satu frasa yang memakai pola Verb + To-Infinitive.",
      answer: "decide to visit",
      spokenSentence: "They offer what modern tourists want when they decide to visit the island.",
      hint: "Cari kata kerja utama yang langsung diikuti oleh “to + V1”.",
      explanation:
        "Kata kerja seperti “aim” dan “decide” diikuti oleh to-infinitive (aim to become / decide to visit).",
    },
  );

  pool.push(
    {
      kind: "findFix",
      id: "bali-ff-passive",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      rule: "Modal + Passive (modal + be + V3)",
      segments: [
        { text: "The local culture, tranquility, boutiques, and even party spots " },
        { text: "can be find", spanId: "err", structure: "Modal + Passive" },
        { text: " easily in Seminyak and Canggu. Today, both areas " },
        { text: "are growing", spanId: "ok1", structure: "Present Continuous" },
        { text: " quickly and " },
        { text: "aim to become", spanId: "ok2", structure: "Verb + To-Infinitive" },
        { text: " the " },
        { text: "most popular", spanId: "ok3", structure: "Superlative" },
        { text: " destinations on the island." },
      ],
      errorSpanId: "err",
      wrongText: "can be find",
      correction: "can be found",
      spokenSentence:
        "The local culture, tranquility, boutiques, and even party spots can be found easily in Seminyak and Canggu.",
      hint: "Pada kalimat pasif setelah “modal + be”, kata kerja harus berbentuk V3 (past participle), bukan V1.",
      explanation:
        "Pola Modal + Passive wajib memakai “modal + be + V3”. Bentuk V3 dari “find” adalah “found”, jadi perbaikannya adalah “can be found”.",
    },
    {
      kind: "findFix",
      id: "bali-ff-agreement",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      rule: "Subject–Verb Agreement & Plural",
      segments: [
        { text: "Seminyak and Canggu " },
        { text: "have", spanId: "ok1", structure: "Present Simple Active" },
        { text: " what the modern " },
        { text: "tourist want", spanId: "err", structure: "Subject–Verb Agreement" },
        { text: " when they " },
        { text: "decide to visit", spanId: "ok2", structure: "Verb + To-Infinitive" },
        { text: " Bali. Healthy cafes and surf spots " },
        { text: "are located", spanId: "ok3", structure: "Present Simple Passive" },
        { text: " within walking distance of the beach." },
      ],
      errorSpanId: "err",
      wrongText: "tourist want",
      correction: "tourists want",
      acceptedCorrections: ["tourists want", "tourist wants"],
      spokenSentence: "Seminyak and Canggu have what the modern tourists want when they decide to visit Bali.",
      hint: "Perhatikan kata ganti “they” di klausa berikutnya. Jika subjeknya tunggal (tourist), kata kerja perlu -s; jika merujuk ke “they”, subjeknya jamak (tourists).",
      explanation:
        "Kata benda tunggal “tourist” harus cocok dengan kata kerja dan kata ganti “they” sesudahnya: gunakan jamak “tourists want” (atau “tourist wants” untuk tunggal).",
    },
    {
      kind: "findFix",
      id: "bali-ff-preposition",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      rule: "Ejaan Preposisi (among)",
      segments: [
        { text: "Besides Kuta, which " },
        { text: "is well known", spanId: "ok1", structure: "Present Simple Passive" },
        { text: " " },
        { text: "amongs", spanId: "err", structure: "Preposition" },
        { text: " surfers, Ubud " },
        { text: "offers", spanId: "ok2", structure: "Present Simple Active" },
        { text: " peaceful rice terraces and traditional art markets " },
        { text: "in the highlands", spanId: "ok3", structure: "Prepositional Phrase" },
        { text: "." },
      ],
      errorSpanId: "err",
      wrongText: "amongs",
      correction: "among",
      spokenSentence:
        "Besides Kuta, which is well known among surfers, Ubud offers peaceful rice terraces and traditional art markets in the highlands.",
      hint: "Preposisi untuk “di antara (banyak orang)” tidak memiliki akhiran -s.",
      explanation:
        "Preposisi yang benar adalah “among” (tanpa huruf s di akhir). Bentuk “amongs” tidak baku dalam bahasa Inggris.",
    },
  );

  // =========================================================================
  // 2. REMOTE WORK & CAFES
  // =========================================================================
  const remoteSegments1: ArticleSegment[] = [
    { text: "Technology " },
    { text: "has changed", spanId: "changed", structure: "Present Perfect" },
    { text: " the way many professionals work today. " },
    { text: "Working", spanId: "working", structure: "Gerund (Subjek)" },
    { text: " from a quiet cafe " },
    { text: "helps", spanId: "helps", structure: "Present Simple Active" },
    { text: " some people stay creative " },
    { text: "without commuting", spanId: "commuting", structure: "Preposition + Gerund" },
    { text: " through heavy morning traffic." },
  ];

  const remoteSegments2: ArticleSegment[] = [
    { text: "Employees " },
    { text: "who work remotely", spanId: "who", structure: "Relative Clause (who)" },
    { text: " often " },
    { text: "enjoy discussing", spanId: "enjoy", structure: "Verb + Gerund" },
    { text: " ideas online, yet they " },
    { text: "must protect", spanId: "must", structure: "Modal Kewajiban" },
    { text: " their focus. If a cafe gets too noisy, you " },
    { text: "might prefer", spanId: "might", structure: "Modal Kemungkinan" },
    { text: " a quiet coworking space instead." },
  ];

  pool.push(
    {
      kind: "diagnose",
      id: "remote-bd-perfect",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      segments: remoteSegments1,
      targetSpanId: "changed",
      prompt: "Tense apa yang digunakan pada frasa “has changed”?",
      options: [
        "Present Perfect",
        "Past Simple",
        "Present Simple Active",
        "Present Continuous",
      ],
      answer: "Present Perfect",
      spokenSentence: "Technology has changed the way many professionals work today.",
      hint: "Perhatikan pola “has + V3” yang menghubungkan perubahan dari masa lalu dengan dampaknya hari ini (“today”).",
      explanation:
        "“has changed” menggunakan Present Perfect (have/has + V3) untuk perubahan yang terjadi sejak dulu dan dampaknya masih terasa sekarang.",
    },
    {
      kind: "diagnose",
      id: "remote-bd-gerund-subj",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      segments: remoteSegments1,
      targetSpanId: "working",
      prompt: "Apa fungsi kata “Working” di awal kalimat kedua?",
      options: [
        "Gerund (Subjek)",
        "Present Continuous",
        "Past Continuous",
        "Verb + To-Infinitive",
      ],
      answer: "Gerund (Subjek)",
      spokenSentence: "Working from a quiet cafe helps some people stay creative.",
      hint: "Kata kerja “work” diubah menjadi -ing agar bisa berdiri sebagai subjek sebelum kata kerja utama “helps”.",
      explanation:
        "“Working” di posisi awal sebelum kata kerja “helps” berfungsi sebagai Gerund (kata benda dari kata kerja) yang menjadi subjek kalimat.",
    },
    {
      kind: "spot",
      id: "remote-spot-prep-gerund",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      segments: remoteSegments1,
      targetSpanId: "commuting",
      prompt: "Ketuk frasa di artikel yang mengikuti aturan Preposition + Gerund.",
      answer: "without commuting",
      spokenSentence: "Working from a quiet cafe helps some people stay creative without commuting through heavy morning traffic.",
      hint: "Cari kata depan (seperti without/before/after/by) yang diikuti V-ing.",
      explanation:
        "Setelah preposisi “without”, kata kerja wajib berbentuk gerund (-ing), sehingga menjadi “without commuting”.",
    },
    {
      kind: "spot",
      id: "remote-spot-relative",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      segments: remoteSegments2,
      targetSpanId: "who",
      prompt: "Ketuk klausa penghubung (Relative Clause) yang menerangkan orang.",
      answer: "who work remotely",
      spokenSentence: "Employees who work remotely often enjoy discussing ideas online, yet they must protect their focus.",
      hint: "Cari bagian yang diawali kata penghubung “who” tepat setelah kata benda orang (“Employees”).",
      explanation:
        "“who work remotely” adalah relative clause dengan “who” untuk menjelaskan kata benda orang “Employees”.",
    },
    {
      kind: "diagnose",
      id: "remote-bd-modal-may",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      segments: remoteSegments2,
      targetSpanId: "might",
      prompt: "Apa makna dan struktur dari frasa “might prefer”?",
      options: [
        "Modal Kemungkinan",
        "Modal Kewajiban",
        "Future Simple",
        "Present Simple Passive",
      ],
      answer: "Modal Kemungkinan",
      spokenSentence: "If a cafe gets too noisy, you might prefer a quiet coworking space instead.",
      hint: "Kata modal “might” menyatakan sesuatu yang mungkin terjadi, bukan kewajiban mutlak.",
      explanation:
        "“might prefer” memakai Modal Kemungkinan (might + V1) untuk menyatakan pilihan atau kemungkinan yang belum pasti.",
    },
    {
      kind: "findFix",
      id: "remote-ff-enjoy",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      rule: "Verb + Gerund (enjoy + V-ing)",
      segments: [
        { text: "Many remote designers " },
        { text: "enjoy to work", spanId: "err", structure: "Verb + Gerund" },
        { text: " from neighborhood cafes because they " },
        { text: "can order", spanId: "ok1", structure: "Modal + V1" },
        { text: " fresh coffee " },
        { text: "while answering", spanId: "ok2", structure: "Conjunction + Gerund" },
        { text: " client emails " },
        { text: "on their laptops", spanId: "ok3", structure: "Prepositional Phrase" },
        { text: "." },
      ],
      errorSpanId: "err",
      wrongText: "enjoy to work",
      correction: "enjoy working",
      spokenSentence:
        "Many remote designers enjoy working from neighborhood cafes because they can order fresh coffee.",
      hint: "Kata kerja “enjoy” termasuk kelompok kata kerja yang wajib diikuti gerund (V-ing), bukan to + V1.",
      explanation:
        "Setelah “enjoy”, selalu gunakan gerund (-ing): ubah “enjoy to work” menjadi “enjoy working”.",
    },
    {
      kind: "findFix",
      id: "remote-ff-prep",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      rule: "Preposition + Gerund (without + V-ing)",
      segments: [
        { text: "Some writers finish their drafts " },
        { text: "without check", spanId: "err", structure: "Preposition + Gerund" },
        { text: " social media, which " },
        { text: "helps them", spanId: "ok1", structure: "Present Simple Active" },
        { text: " stay productive " },
        { text: "until", spanId: "ok2", structure: "Conjunction" },
        { text: " the afternoon " },
        { text: "meeting starts", spanId: "ok3", structure: "Present Simple Active" },
        { text: "." },
      ],
      errorSpanId: "err",
      wrongText: "without check",
      correction: "without checking",
      spokenSentence:
        "Some writers finish their drafts without checking social media, which helps them stay productive.",
      hint: "Setelah preposisi “without”, kata kerja tidak bisa dibiarkan dalam bentuk V1 murni.",
      explanation:
        "Setiap kata kerja yang langsung mengikuti preposisi seperti “without” harus berbentuk gerund (-ing): “without checking”.",
    },
  );

  // =========================================================================
  // 3. MORNING HABITS FOR FOCUS
  // =========================================================================
  const morningSegments1: ArticleSegment[] = [
    { text: "" },
    { text: "Waking up", spanId: "waking", structure: "Gerund (Subjek)" },
    { text: " thirty minutes earlier " },
    { text: "gives", spanId: "gives", structure: "Present Simple Active" },
    { text: " you extra time to prepare calmly. Drinking " },
    { text: "enough water", spanId: "water", structure: "Quantifier" },
    { text: " and spending " },
    { text: "a few minutes", spanId: "few", structure: "Quantifier (Countable)" },
    { text: " stretching can improve your mood before work." },
  ];

  const morningSegments2: ArticleSegment[] = [
    { text: "" },
    { text: "Although", spanId: "although", structure: "Conjunction Pertentangan" },
    { text: " checking your phone feels tempting, it often " },
    { text: "makes", spanId: "makes", structure: "Present Simple Active" },
    { text: " your morning feel rushed. People who " },
    { text: "plan to exercise", spanId: "plan", structure: "Verb + To-Infinitive" },
    { text: " regularly sleep " },
    { text: "better", spanId: "better", structure: "Comparative Tidak Beraturan" },
    { text: " at night." },
  ];

  pool.push(
    {
      kind: "spot",
      id: "morning-spot-few",
      articleId: "morning",
      articleTitle: ARTICLE_TITLES.morning,
      category: "Kebiasaan Sehat",
      segments: morningSegments1,
      targetSpanId: "few",
      prompt: "Ketuk quantifier yang digunakan untuk kata benda yang dapat dihitung (countable).",
      answer: "a few minutes",
      spokenSentence: "Drinking enough water and spending a few minutes stretching can improve your mood before work.",
      hint: "“minutes” berbentuk jamak (-s) dan dapat dihitung, berbeda dengan “water” (uncountable).",
      explanation:
        "“a few minutes” menggunakan “a few” karena “minutes” adalah countable noun jamak.",
    },
    {
      kind: "diagnose",
      id: "morning-bd-although",
      articleId: "morning",
      articleTitle: ARTICLE_TITLES.morning,
      category: "Kebiasaan Sehat",
      segments: morningSegments2,
      targetSpanId: "although",
      prompt: "Apa fungsi kata sambung “Although” di awal kalimat tersebut?",
      options: [
        "Conjunction Pertentangan",
        "Conjunction Sebab-Akibat",
        "Conjunction Syarat",
        "Relative Pronoun",
      ],
      answer: "Conjunction Pertentangan",
      spokenSentence: "Although checking your phone feels tempting, it often makes your morning feel rushed.",
      hint: "Hubungan antara “terlihat menggoda” dan “membuat pagi terasa terburu-buru” saling bertentangan.",
      explanation:
        "“Although” (meskipun) adalah conjunction pertentangan untuk menggabungkan anak kalimat yang kontras dengan klausa utamanya.",
    },
    {
      kind: "spot",
      id: "morning-spot-plan",
      articleId: "morning",
      articleTitle: ARTICLE_TITLES.morning,
      category: "Kebiasaan Sehat",
      segments: morningSegments2,
      targetSpanId: "plan",
      prompt: "Ketuk frasa yang menggunakan pola Verb + To-Infinitive.",
      answer: "plan to exercise",
      spokenSentence: "People who plan to exercise regularly sleep better at night.",
      hint: "Cari kata kerja utama yang diikuti oleh “to + V1”.",
      explanation:
        "Kata kerja “plan” selalu diikuti to-infinitive (to + V1): “plan to exercise”.",
    },
    {
      kind: "findFix",
      id: "morning-ff-well",
      articleId: "morning",
      articleTitle: ARTICLE_TITLES.morning,
      category: "Kebiasaan Sehat",
      rule: "Adjective vs Adverb (good → well)",
      segments: [
        { text: "When you sleep " },
        { text: "good", spanId: "err", structure: "Adverb" },
        { text: " at night, you " },
        { text: "can concentrate", spanId: "ok1", structure: "Modal + V1" },
        { text: " " },
        { text: "more easily", spanId: "ok2", structure: "Comparative Adverb" },
        { text: " during morning " },
        { text: "meetings", spanId: "ok3", structure: "Plural Noun" },
        { text: "." },
      ],
      errorSpanId: "err",
      wrongText: "good",
      correction: "well",
      spokenSentence: "When you sleep well at night, you can concentrate more easily during morning meetings.",
      hint: "Bagian kosong ini menerangkan kata kerja aksi “sleep” (tidur dengan nyenyak), bukan kata benda.",
      explanation:
        "Untuk menerangkan kata kerja “sleep”, gunakan adverb “well” (bukan adjective “good”).",
    },
    {
      kind: "findFix",
      id: "morning-ff-quantifier",
      articleId: "morning",
      articleTitle: ARTICLE_TITLES.morning,
      category: "Kebiasaan Sehat",
      rule: "Quantifier (a few vs a little)",
      segments: [
        { text: "Take " },
        { text: "a little minutes", spanId: "err", structure: "Quantifier" },
        { text: " to breathe deeply " },
        { text: "before starting", spanId: "ok1", structure: "Preposition + Gerund" },
        { text: " your tasks, " },
        { text: "because", spanId: "ok2", structure: "Conjunction" },
        { text: " a calm start " },
        { text: "reduces", spanId: "ok3", structure: "Present Simple Active" },
        { text: " daily stress." },
      ],
      errorSpanId: "err",
      wrongText: "a little minutes",
      correction: "a few minutes",
      spokenSentence: "Take a few minutes to breathe deeply before starting your tasks.",
      hint: "“minutes” adalah kata benda jamak yang bisa dihitung (1 menit, 2 menit). “a little” hanya untuk benda yang tidak bisa dihitung.",
      explanation:
        "Karena “minutes” adalah countable noun jamak, gunakan “a few minutes”, bukan “a little minutes”.",
    },
  );

  // =========================================================================
  // 4. A RAINY TRIP TO BANDUNG
  // =========================================================================
  const bandungSegments: ArticleSegment[] = [
    { text: "When we " },
    { text: "arrived", spanId: "arrived", structure: "Past Simple" },
    { text: " in Bandung last Saturday, it " },
    { text: "was raining", spanId: "raining", structure: "Past Continuous" },
    { text: " heavily. Fortunately, we " },
    { text: "had booked", spanId: "booked", structure: "Past Perfect" },
    { text: " a cozy guesthouse " },
    { text: "where", spanId: "where", structure: "Relative Pronoun (Tempat)" },
    { text: " warm ginger tea " },
    { text: "was served", spanId: "served", structure: "Past Simple Passive" },
    { text: "." },
  ];

  pool.push(
    {
      kind: "diagnose",
      id: "bandung-bd-past-cont",
      articleId: "bandung",
      articleTitle: ARTICLE_TITLES.bandung,
      category: "Cerita Masa Lalu",
      segments: bandungSegments,
      targetSpanId: "raining",
      prompt: "Struktur apa yang digunakan pada “was raining”?",
      options: [
        "Past Continuous",
        "Past Simple",
        "Present Continuous",
        "Past Perfect",
      ],
      answer: "Past Continuous",
      spokenSentence: "When we arrived in Bandung last Saturday, it was raining heavily.",
      hint: "Perhatikan pola “was + V-ing” untuk kejadian yang sedang berlangsung di masa lalu ketika kejadian lain datang (“arrived”).",
      explanation:
        "“was raining” adalah Past Continuous (was/were + V-ing) yang menggambarkan hujan sedang turun saat kami tiba di masa lalu.",
    },
    {
      kind: "diagnose",
      id: "bandung-bd-past-perf",
      articleId: "bandung",
      articleTitle: ARTICLE_TITLES.bandung,
      category: "Cerita Masa Lalu",
      segments: bandungSegments,
      targetSpanId: "booked",
      prompt: "Mengapa kalimat kedua memakai “had booked”?",
      options: [
        "Past Perfect",
        "Present Perfect",
        "Past Simple",
        "Past Simple Passive",
      ],
      answer: "Past Perfect",
      spokenSentence: "Fortunately, we had booked a cozy guesthouse where warm ginger tea was served.",
      hint: "Pemesanan penginapan dilakukan LEBIH DULU sebelum mereka tiba di Bandung Sabtu lalu.",
      explanation:
        "“had booked” menggunakan Past Perfect (had + V3) untuk menyatakan peristiwa yang sudah selesai sebelum peristiwa lampau lainnya (“arrived”).",
    },
    {
      kind: "spot",
      id: "bandung-spot-passive",
      articleId: "bandung",
      articleTitle: ARTICLE_TITLES.bandung,
      category: "Cerita Masa Lalu",
      segments: bandungSegments,
      targetSpanId: "served",
      prompt: "Ketuk frasa yang memakai pola Past Simple Passive.",
      answer: "was served",
      spokenSentence: "Fortunately, we had booked a cozy guesthouse where warm ginger tea was served.",
      hint: "Cari pola “was/were + V3” yang artinya “disajikan”.",
      explanation:
        "“was served” adalah Past Simple Passive (was + V3) karena teh jahe disajikan (bukan menyajikan).",
    },
    {
      kind: "findFix",
      id: "bandung-ff-passive",
      articleId: "bandung",
      articleTitle: ARTICLE_TITLES.bandung,
      category: "Cerita Masa Lalu",
      rule: "Past Simple Passive (was/were + V3)",
      segments: [
        { text: "We stayed in a historic villa that " },
        { text: "was build", spanId: "err", structure: "Past Simple Passive" },
        { text: " in 1935, " },
        { text: "while", spanId: "ok1", structure: "Conjunction" },
        { text: " heavy rain " },
        { text: "fell", spanId: "ok2", structure: "Past Simple" },
        { text: " outside " },
        { text: "all evening", spanId: "ok3", structure: "Time Expression" },
        { text: "." },
      ],
      errorSpanId: "err",
      wrongText: "was build",
      correction: "was built",
      spokenSentence: "We stayed in a historic villa that was built in 1935, while heavy rain fell outside.",
      hint: "Setelah “was” pada kalimat pasif (“dibangun”), kata kerja “build” harus diubah ke bentuk V3.",
      explanation:
        "Pola Past Simple Passive adalah “was/were + V3”. Bentuk V3 dari “build” adalah “built”, jadi perbaikannya “was built”.",
    },
    {
      kind: "findFix",
      id: "bandung-ff-ed",
      articleId: "bandung",
      articleTitle: ARTICLE_TITLES.bandung,
      category: "Cerita Masa Lalu",
      rule: "Adjective -ed vs -ing",
      segments: [
        { text: "Nobody felt " },
        { text: "boring", spanId: "err", structure: "Adjective -ed" },
        { text: " during the trip " },
        { text: "because", spanId: "ok1", structure: "Conjunction" },
        { text: " the mountain view " },
        { text: "was", spanId: "ok2", structure: "Past Nominal" },
        { text: " truly " },
        { text: "amazing", spanId: "ok3", structure: "Adjective -ing" },
        { text: "." },
      ],
      errorSpanId: "err",
      wrongText: "boring",
      correction: "bored",
      spokenSentence: "Nobody felt bored during the trip because the mountain view was truly amazing.",
      hint: "“Nobody felt ...” menggambarkan perasaan orang (merasa bosan), bukan sifat benda yang membosankan.",
      explanation:
        "Untuk perasaan seseorang gunakan akhiran -ed (“bored”), sedangkan -ing (“boring”) berarti membosankan.",
    },
  );

  // =========================================================================
  // 5. CITY BIKE-SHARING PROGRAM
  // =========================================================================
  const bikeSegments: ArticleSegment[] = [
    { text: "The city's bike-sharing program " },
    { text: "has been growing", spanId: "growing", structure: "Present Perfect Continuous" },
    { text: " steadily since 2023. Riding a bicycle is " },
    { text: "cheaper than", spanId: "cheaper", structure: "Comparative" },
    { text: " taking a taxi, and fifty new stations " },
    { text: "will be added", spanId: "added", structure: "Future Simple Passive" },
    { text: " next month " },
    { text: "unless", spanId: "unless", structure: "Conjunction Syarat Negatif" },
    { text: " bad weather delays construction." },
  ];

  pool.push(
    {
      kind: "diagnose",
      id: "bike-bd-perf-cont",
      articleId: "bike",
      articleTitle: ARTICLE_TITLES.bike,
      category: "Kota & Lingkungan",
      segments: bikeSegments,
      targetSpanId: "growing",
      prompt: "Tense apa yang digunakan pada “has been growing”?",
      options: [
        "Present Perfect Continuous",
        "Present Perfect",
        "Present Continuous",
        "Past Perfect Continuous",
      ],
      answer: "Present Perfect Continuous",
      spokenSentence: "The city's bike-sharing program has been growing steadily since 2023.",
      hint: "Perhatikan pola “has + been + V-ing” dengan keterangan “since 2023”.",
      explanation:
        "“has been growing” adalah Present Perfect Continuous (has/have + been + V-ing) untuk proses yang dimulai sejak 2023 dan masih berlanjut hingga kini.",
    },
    {
      kind: "diagnose",
      id: "bike-bd-future-passive",
      articleId: "bike",
      articleTitle: ARTICLE_TITLES.bike,
      category: "Kota & Lingkungan",
      segments: bikeSegments,
      targetSpanId: "added",
      prompt: "Struktur apa yang dipakai pada frasa “will be added”?",
      options: [
        "Future Simple Passive",
        "Future Simple Active",
        "Present Simple Passive",
        "Modal + V1 (Active)",
      ],
      answer: "Future Simple Passive",
      spokenSentence: "Fifty new stations will be added next month unless bad weather delays construction.",
      hint: "Ada “will + be + V3” untuk stasiun baru yang “akan ditambahkan” bulan depan.",
      explanation:
        "“will be added” adalah Future Simple Passive (will + be + V3) untuk menyatakan tindakan yang akan dilakukan pada subjek di masa depan.",
    },
    {
      kind: "spot",
      id: "bike-spot-unless",
      articleId: "bike",
      articleTitle: ARTICLE_TITLES.bike,
      category: "Kota & Lingkungan",
      segments: bikeSegments,
      targetSpanId: "unless",
      prompt: "Ketuk kata sambung syarat negatif (“kecuali jika”) di paragraf ini.",
      answer: "unless",
      spokenSentence: "Fifty new stations will be added next month unless bad weather delays construction.",
      hint: "Kata sambung ini menggantikan makna “if ... not” (jika cuaca buruk tidak menunda konstruksi).",
      explanation:
        "“unless” berarti “kecuali jika / jika tidak”, sehingga kalimat di belakangnya tidak perlu memakai kata “not” lagi.",
    },
    {
      kind: "findFix",
      id: "bike-ff-modal-to",
      articleId: "bike",
      articleTitle: ARTICLE_TITLES.bike,
      category: "Kota & Lingkungan",
      rule: "Modal + V1 tanpa “to”",
      segments: [
        { text: "Every rider " },
        { text: "must to return", spanId: "err", structure: "Modal + V1" },
        { text: " the bicycle " },
        { text: "before midnight", spanId: "ok1", structure: "Prepositional Phrase" },
        { text: " so that other commuters " },
        { text: "can use", spanId: "ok2", structure: "Modal + V1" },
        { text: " it " },
        { text: "the next morning", spanId: "ok3", structure: "Time Expression" },
        { text: "." },
      ],
      errorSpanId: "err",
      wrongText: "must to return",
      correction: "must return",
      spokenSentence:
        "Every rider must return the bicycle before midnight so that other commuters can use it the next morning.",
      hint: "Modal auxiliary seperti “must”, “can”, atau “should” tidak boleh diikuti oleh “to”.",
      explanation:
        "Modal “must” langsung diikuti V1 murni tanpa “to”: perbaikannya adalah “must return”.",
    },
    {
      kind: "findFix",
      id: "bike-ff-comparative",
      articleId: "bike",
      articleTitle: ARTICLE_TITLES.bike,
      category: "Kota & Lingkungan",
      rule: "Comparative 1 Suku Kata (-er)",
      segments: [
        { text: "For short trips downtown, cycling is " },
        { text: "more fast", spanId: "err", structure: "Comparative" },
        { text: " than waiting in traffic, " },
        { text: "and", spanId: "ok1", structure: "Conjunction" },
        { text: " new lanes " },
        { text: "will be built", spanId: "ok2", structure: "Future Simple Passive" },
        { text: " " },
        { text: "next year", spanId: "ok3", structure: "Time Expression" },
        { text: "." },
      ],
      errorSpanId: "err",
      wrongText: "more fast",
      correction: "faster",
      spokenSentence: "For short trips downtown, cycling is faster than waiting in traffic.",
      hint: "“fast” hanya terdiri dari 1 suku kata, jadi bentuk comparative-nya memakai akhiran -er, bukan “more”.",
      explanation:
        "Kata sifat pendek 1 suku kata “fast” berubah menjadi “faster” (bukan “more fast”).",
    },
  );

  return pool;
}

export const ARTICLE_POOL = buildArticlePool();

export function createArticleDeck(
  filter: ArticleFilter,
  previousId?: string,
): ArticleQuestion[] {
  const deck = ARTICLE_POOL.filter((q) => {
    const modeOk =
      filter.mode === "all" ||
      (filter.mode === "breakdown" && q.kind !== "findFix") ||
      (filter.mode === "findFix" && q.kind === "findFix");
    const articleOk =
      filter.articleId === "all" || q.articleId === filter.articleId;
    return modeOk && articleOk;
  });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (deck.length > 1 && deck[0].id === previousId) {
    [deck[0], deck[1]] = [deck[1], deck[0]];
  }
  return deck;
}

export function checkBreakdownAnswer(
  q: BreakdownQuestion,
  chosen: string,
): "correct" | "incorrect" {
  if (q.kind === "diagnose") {
    return chosen === q.answer ? "correct" : "incorrect";
  }
  const accepted = q.acceptedSpanIds ?? [q.targetSpanId];
  return accepted.includes(chosen) ? "correct" : "incorrect";
}

export function checkFindFixCorrection(
  q: FindFixQuestion,
  input: string,
): "empty" | "correct" | "incorrect" {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalized) return "empty";
  const accepted = q.acceptedCorrections ?? [q.correction];
  return accepted.some((ans) => ans.toLowerCase() === normalized)
    ? "correct"
    : "incorrect";
}

export function spotTapFeedback(
  q: BreakdownQuestion,
  tappedSpanId: string,
): string {
  const seg = q.segments.find((s) => s.spanId === tappedSpanId);
  if (!seg) {
    return "Ketuk salah satu frasa yang dapat dipilih di dalam paragraf.";
  }
  return `“${seg.text}” adalah ${seg.structure ?? "struktur lain"}, bukan target yang diminta. ${q.hint}`;
}

export function findFixSpanFeedback(
  q: FindFixQuestion,
  tappedSpanId: string,
): string {
  const seg = q.segments.find((s) => s.spanId === tappedSpanId);
  if (!seg) {
    return "Ketuk salah satu frasa yang dapat dipilih untuk menemukan kesalahannya.";
  }
  return `Bagian “${seg.text}” sudah benar (${seg.structure ?? "sesuai konteks"}). Cari bagian lain yang terasa janggal.`;
}

export function findFixMistakeHint(q: FindFixQuestion, input: string): string {
  const normalized = input.trim().toLowerCase().replace(/\s+/g, " ");
  if (normalized === q.wrongText.toLowerCase()) {
    return `“${q.wrongText}” adalah bentuk yang masih salah. ${q.hint}`;
  }
  return `Perbaikan “${input.trim()}” belum tepat. ${q.hint}`;
}


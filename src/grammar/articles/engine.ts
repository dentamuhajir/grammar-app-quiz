export type ArticleMode = "breakdown" | "findFix";
export type ArticleId =
  | "bali"
  | "remote"
  | "morning"
  | "bandung"
  | "bike"
  | "kuliner"
  | "interview"
  | "shopping"
  | "bromo"
  | "finance"
  | "ev"
  | "language";

export interface ArticleFilter {
  mode: ArticleMode | "all";
  articleId: ArticleId | "all";
}

export interface ArticleSegment {
  text: string;
  spanId?: string;
  /** Grammar structure label shown in explanations or feedback. */
  structure?: string;
}

export interface BreakdownEvidence {
  phrase: string;
  tag: string;
}

export interface BreakdownSentence {
  id: string;
  text: string;
  expectedTags: readonly string[];
  evidence: readonly BreakdownEvidence[];
  trapHints?: Readonly<Record<string, string>>;
}

export interface BreakdownQuestion {
  kind: "breakdown";
  id: string;
  articleId: ArticleId;
  articleTitle: string;
  category: string;
  sentences: readonly BreakdownSentence[];
  tagBank: readonly string[];
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

export interface SentenceBreakdownCheck {
  correct: boolean;
  missingCount: number;
  wrongTags: string[];
  hint: string;
}

export interface ParagraphBreakdownResult {
  status: "incomplete" | "correct" | "incorrect";
  perSentence: Record<string, SentenceBreakdownCheck>;
  message: string;
}

export const ARTICLE_TITLES: Record<ArticleId, string> = {
  bali: "Bali: Island of the Gods",
  remote: "Remote Work & Cafes",
  morning: "Morning Habits for Focus",
  bandung: "A Rainy Trip to Bandung",
  bike: "City Bike-Sharing Program",
  kuliner: "Rendang & Indonesian Street Food",
  interview: "Preparing for a Job Interview",
  shopping: "Smart Online Shopping",
  bromo: "Sunrise at Mount Bromo",
  finance: "Managing Personal Finances",
  ev: "Electric Vehicles in Big Cities",
  language: "Learning a Foreign Language",
};

export const ARTICLE_MODE_LABELS: Record<ArticleMode, string> = {
  breakdown: "Bedah Kalimat (Tag)",
  findFix: "Cari & Perbaiki",
};

interface SpanMutation {
  id: string;
  rule: string;
  wrongText: string;
  correction: string;
  acceptedCorrections?: readonly string[];
  spokenSentence: string;
  hint: string;
  explanation: string;
}

interface DynamicPart {
  text: string;
  spanId?: string;
  structure?: string;
  mutation?: SpanMutation;
}

/**
 * Generates multiple Find & Fix questions from one paragraph template.
 * Each mutation corrupts ONLY its target span while keeping all other clickable
 * spans in the same paragraph 100% grammatically clean, preventing memorization.
 */
function expandFindFixParagraph(
  articleId: ArticleId,
  category: string,
  parts: readonly DynamicPart[],
): FindFixQuestion[] {
  const questions: FindFixQuestion[] = [];
  for (const target of parts) {
    if (!target.spanId || !target.mutation) continue;
    const mut = target.mutation;
    const segments: ArticleSegment[] = parts.map((p) => {
      if (!p.spanId) return { text: p.text };
      const isMutated = p.spanId === target.spanId;
      return {
        text: isMutated ? mut.wrongText : p.text,
        spanId: p.spanId,
        structure: p.structure,
      };
    });
    questions.push({
      kind: "findFix",
      id: mut.id,
      articleId,
      articleTitle: ARTICLE_TITLES[articleId],
      category,
      rule: mut.rule,
      segments,
      errorSpanId: target.spanId,
      wrongText: mut.wrongText,
      correction: mut.correction,
      acceptedCorrections: mut.acceptedCorrections,
      spokenSentence: mut.spokenSentence,
      hint: mut.hint,
      explanation: mut.explanation,
    });
  }
  return questions;
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildArticlePool(): ArticleQuestion[] {
  const pool: ArticleQuestion[] = [];

  // =========================================================================
  // 1. BALI: ISLAND OF THE GODS
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "bali-bd-1",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      sentences: [
        {
          id: "s1",
          text: "Bali, the Island of Gods, is one of the most famous travel destinations in Indonesia.",
          expectedTags: ["Present Simple Nominal", "Superlative"],
          evidence: [
            { phrase: "is", tag: "Present Simple Nominal" },
            { phrase: "the most famous", tag: "Superlative" },
          ],
          trapHints: {
            "Present Simple Passive":
              "Kalimat 1 memakai “is” diikuti kata benda/sifat (“one of the most famous...”), bukan V3. Itu adalah kalimat Nominal, bukan Passive.",
          },
        },
        {
          id: "s2",
          text: "Geographically, Bali province is bordered by the Bali Strait to the west and the Indian Ocean to the south.",
          expectedTags: ["Present Simple Passive"],
          evidence: [{ phrase: "is bordered", tag: "Present Simple Passive" }],
          trapHints: {
            "Past Simple Passive":
              "Kalimat 2 memakai to be masa kini “is” + V3 (“is bordered”), bukan “was/were bordered”.",
            "Present Simple Nominal":
              "Setelah “is” pada Kalimat 2 terdapat V3 “bordered” + “by ...” (“dibatasi oleh”), sehingga ini adalah Passive Voice.",
          },
        },
        {
          id: "s3",
          text: "Visitors can enjoy scenic landscapes in Ubud, while surfers prefer visiting Kuta and Canggu.",
          expectedTags: ["Modal + V1 (Active)", "Verb + Gerund"],
          evidence: [
            { phrase: "can enjoy", tag: "Modal + V1 (Active)" },
            { phrase: "prefer visiting", tag: "Verb + Gerund" },
          ],
          trapHints: {
            "Present Continuous":
              "Hati-hati di Kalimat 3: “visiting” jatuh setelah kata kerja “prefer” tanpa to be (am/is/are), jadi ini Verb + Gerund, bukan Present Continuous.",
          },
        },
      ],
      tagBank: [
        "Present Simple Nominal",
        "Superlative",
        "Present Simple Passive",
        "Modal + V1 (Active)",
        "Verb + Gerund",
        "Present Continuous",
        "Past Simple Passive",
        "Verb + To-Infinitive",
      ],
      spokenSentence:
        "Bali, the Island of Gods, is one of the most famous travel destinations in Indonesia. Geographically, Bali province is bordered by the Bali Strait to the west and the Indian Ocean to the south. Visitors can enjoy scenic landscapes in Ubud, while surfers prefer visiting Kuta and Canggu.",
      hint: "Cermati perbedaan antara “is + noun/superlative” di Kalimat 1, “is + V3 (bordered) by” di Kalimat 2, serta gabungan modal dan kata kerja kedua setelah “prefer” di Kalimat 3.",
      explanation:
        "Kalimat 1 menggunakan Present Simple Nominal (“is”) dan Superlative (“the most famous”). Kalimat 2 menggunakan Present Simple Passive (“is bordered”). Kalimat 3 menggabungkan Modal + V1 (“can enjoy”) dan Verb + Gerund (“prefer visiting”).",
    },
    {
      kind: "breakdown",
      id: "bali-bd-2",
      articleId: "bali",
      articleTitle: ARTICLE_TITLES.bali,
      category: "Travel & Budaya",
      sentences: [
        {
          id: "s1",
          text: "Nowadays, Seminyak and Canggu are growing rapidly and aim to become top lifestyle hubs.",
          expectedTags: ["Present Continuous", "Verb + To-Infinitive"],
          evidence: [
            { phrase: "are growing", tag: "Present Continuous" },
            { phrase: "aim to become", tag: "Verb + To-Infinitive" },
          ],
          trapHints: {
            "Present Simple Passive":
              "“are growing” di Kalimat 1 memakai to be + V-ing (sedang berkembang), bukan to be + V3.",
          },
        },
        {
          id: "s2",
          text: "Peaceful cafes, yoga studios, and local culture can be found easily across both areas.",
          expectedTags: ["Modal + Passive Voice"],
          evidence: [{ phrase: "can be found", tag: "Modal + Passive Voice" }],
          trapHints: {
            "Modal + V1 (Active)":
              "Perhatikan Kalimat 2: setelah “can” ada “be + V3 (found)” yang berarti “dapat ditemukan” (pasif), bukan aktif.",
          },
        },
        {
          id: "s3",
          text: "Because the region offers modern facilities, Canggu became a favorite spot for business.",
          expectedTags: ["Conjunction Sebab (because)", "Past Simple"],
          evidence: [
            { phrase: "Because", tag: "Conjunction Sebab (because)" },
            { phrase: "became", tag: "Past Simple" },
          ],
          trapHints: {
            "Present Perfect":
              "Kalimat 3 memakai V2 murni “became” tanpa have/has, jadi itu adalah Past Simple.",
          },
        },
      ],
      tagBank: [
        "Present Continuous",
        "Verb + To-Infinitive",
        "Modal + Passive Voice",
        "Conjunction Sebab (because)",
        "Past Simple",
        "Modal + V1 (Active)",
        "Present Simple Passive",
        "Present Perfect",
      ],
      spokenSentence:
        "Nowadays, Seminyak and Canggu are growing rapidly and aim to become top lifestyle hubs. Peaceful cafes, yoga studios, and local culture can be found easily across both areas. Because the region offers modern facilities, Canggu became a favorite spot for business.",
      hint: "Di Kalimat 1 ada “are + V-ing” dan “aim to + V1”. Di Kalimat 2 ada “can + be + V3”. Di Kalimat 3 ada klausa alasan dan kata kerja lampau V2.",
      explanation:
        "Kalimat 1: “are growing” (Present Continuous) & “aim to become” (Verb + To-Infinitive). Kalimat 2: “can be found” (Modal + Passive Voice). Kalimat 3: “Because” (Conjunction Sebab) & “became” (Past Simple).",
    },
    ...expandFindFixParagraph("bali", "Travel & Budaya", [
      {
        text: "The local culture, tranquility, boutiques, and even party spots ",
      },
      {
        text: "can be found",
        spanId: "err",
        structure: "Modal + Passive",
        mutation: {
          id: "bali-ff-passive",
          rule: "Modal + Passive (modal + be + V3)",
          wrongText: "can be find",
          correction: "can be found",
          spokenSentence:
            "The local culture, tranquility, boutiques, and even party spots can be found easily in Seminyak and Canggu.",
          hint: "Pada kalimat pasif setelah “modal + be”, kata kerja harus berbentuk V3 (past participle), bukan V1.",
          explanation:
            "Pola Modal + Passive wajib memakai “modal + be + V3”. Bentuk V3 dari “find” adalah “found”, jadi perbaikannya adalah “can be found”.",
        },
      },
      { text: " easily in Seminyak and Canggu. Today, both areas " },
      {
        text: "are growing",
        spanId: "ok1",
        structure: "Present Continuous",
        mutation: {
          id: "bali-ff-growing",
          rule: "Present Continuous (are + V-ing)",
          wrongText: "are grow",
          correction: "are growing",
          spokenSentence:
            "Today, both areas are growing quickly and aim to become the most popular destinations on the island.",
          hint: "Setelah to be “are” untuk menyatakan proses yang sedang berlangsung (“Today”), kata kerja “grow” harus berbentuk V-ing.",
          explanation:
            "To be “are” tidak boleh diikuti V1 murni “grow”; gunakan Present Continuous “are growing”.",
        },
      },
      { text: " quickly and " },
      {
        text: "aim to become",
        spanId: "ok2",
        structure: "Verb + To-Infinitive",
        mutation: {
          id: "bali-ff-aim",
          rule: "Verb + To-Infinitive (aim + to V1)",
          wrongText: "aim becoming",
          correction: "aim to become",
          spokenSentence:
            "Today, both areas are growing quickly and aim to become the most popular destinations on the island.",
          hint: "Kata kerja “aim” diikuti oleh to-infinitive (to + V1), bukan gerund (-ing).",
          explanation:
            "Gunakan “aim to become” karena kata kerja “aim” wajib diikuti to-infinitive.",
        },
      },
      { text: " the " },
      { text: "most popular", spanId: "ok3", structure: "Superlative" },
      { text: " destinations on the island." },
    ]),
    ...expandFindFixParagraph("bali", "Travel & Budaya", [
      { text: "Seminyak and Canggu " },
      { text: "have", spanId: "ok1", structure: "Present Simple Active" },
      { text: " what the modern " },
      {
        text: "tourists want",
        spanId: "err",
        structure: "Subject–Verb Agreement",
        mutation: {
          id: "bali-ff-agreement",
          rule: "Subject–Verb Agreement & Plural",
          wrongText: "tourist want",
          correction: "tourists want",
          acceptedCorrections: ["tourists want", "tourist wants"],
          spokenSentence:
            "Seminyak and Canggu have what the modern tourists want when they decide to visit Bali.",
          hint: "Perhatikan kata ganti “they” di klausa berikutnya. Jika subjeknya tunggal (tourist), kata kerja perlu -s; jika merujuk ke “they”, subjeknya jamak (tourists).",
          explanation:
            "Kata benda tunggal “tourist” harus cocok dengan kata kerja dan kata ganti “they” sesudahnya: gunakan jamak “tourists want” (atau “tourist wants” untuk tunggal).",
        },
      },
      { text: " when they " },
      {
        text: "decide to visit",
        spanId: "ok2",
        structure: "Verb + To-Infinitive",
      },
      { text: " Bali. Besides Kuta, which is well known " },
      {
        text: "among",
        spanId: "ok3",
        structure: "Preposition",
        mutation: {
          id: "bali-ff-preposition",
          rule: "Ejaan Preposisi (among)",
          wrongText: "amongs",
          correction: "among",
          spokenSentence:
            "Besides Kuta, which is well known among surfers, Ubud offers peaceful rice terraces in the highlands.",
          hint: "Preposisi untuk “di antara (banyak orang)” tidak memiliki akhiran -s.",
          explanation:
            "Preposisi yang benar adalah “among” (tanpa huruf s di akhir). Bentuk “amongs” tidak baku dalam bahasa Inggris.",
        },
      },
      { text: " surfers, Ubud offers peaceful rice terraces." },
    ]),
  );

  // =========================================================================
  // 2. REMOTE WORK & CAFES
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "remote-bd-1",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      sentences: [
        {
          id: "s1",
          text: "Technology has changed the way many professionals work today.",
          expectedTags: ["Present Perfect"],
          evidence: [{ phrase: "has changed", tag: "Present Perfect" }],
          trapHints: {
            "Past Simple":
              "Kalimat 1 memakai kata bantu “has” + V3 (“has changed”) dengan keterangan “today”, jadi ini Present Perfect, bukan Past Simple.",
          },
        },
        {
          id: "s2",
          text: "Working from a quiet cafe helps some people stay creative without commuting through heavy traffic.",
          expectedTags: ["Gerund (Subjek)", "Preposition + Gerund"],
          evidence: [
            { phrase: "Working", tag: "Gerund (Subjek)" },
            { phrase: "without commuting", tag: "Preposition + Gerund" },
          ],
          trapHints: {
            "Present Continuous":
              "Di Kalimat 2 tidak ada to be (am/is/are) sebelum “Working” atau “commuting”. Kata kerja utama kalimat ini adalah “helps”.",
          },
        },
        {
          id: "s3",
          text: "A comfortable chair is essential for anyone who works on a laptop all day.",
          expectedTags: ["Relative Clause (who)"],
          evidence: [
            { phrase: "who works on a laptop", tag: "Relative Clause (who)" },
          ],
        },
      ],
      tagBank: [
        "Present Perfect",
        "Gerund (Subjek)",
        "Preposition + Gerund",
        "Relative Clause (who)",
        "Present Continuous",
        "Past Simple",
        "Verb + To-Infinitive",
      ],
      spokenSentence:
        "Technology has changed the way many professionals work today. Working from a quiet cafe helps some people stay creative without commuting through heavy traffic. A comfortable chair is essential for anyone who works on a laptop all day.",
      hint: "Perhatikan “has changed” di Kalimat 1, dua bentuk -ing di Kalimat 2 (di awal kalimat dan setelah “without”), serta klausa penjelas orang di Kalimat 3.",
      explanation:
        "Kalimat 1 menggunakan Present Perfect (“has changed”). Kalimat 2 menggunakan Gerund sebagai subjek (“Working”) dan Preposition + Gerund (“without commuting”). Kalimat 3 menggunakan Relative Clause (“who works...”).",
    },
    {
      kind: "breakdown",
      id: "remote-bd-2",
      articleId: "remote",
      articleTitle: ARTICLE_TITLES.remote,
      category: "Kerja & Gaya Hidup",
      sentences: [
        {
          id: "s1",
          text: "Remote employees often enjoy discussing ideas online, yet they must protect their daily focus.",
          expectedTags: ["Verb + Gerund", "Modal Kewajiban (must)"],
          evidence: [
            { phrase: "enjoy discussing", tag: "Verb + Gerund" },
            { phrase: "must protect", tag: "Modal Kewajiban (must)" },
          ],
          trapHints: {
            "Present Continuous":
              "“discussing” di Kalimat 1 adalah objek setelah kata kerja “enjoy” (Verb + Gerund), bukan Present Continuous.",
          },
        },
        {
          id: "s2",
          text: "If a neighborhood cafe gets too noisy, you might prefer a quiet coworking space instead.",
          expectedTags: ["Conditional (if)", "Modal Kemungkinan (might)"],
          evidence: [
            { phrase: "If a neighborhood cafe gets", tag: "Conditional (if)" },
            { phrase: "might prefer", tag: "Modal Kemungkinan (might)" },
          ],
          trapHints: {
            "Future Simple (will)":
              "Kalimat 2 menggunakan “might prefer” (kemungkinan), bukan “will prefer”.",
          },
        },
      ],
      tagBank: [
        "Verb + Gerund",
        "Modal Kewajiban (must)",
        "Conditional (if)",
        "Modal Kemungkinan (might)",
        "Present Continuous",
        "Future Simple (will)",
        "Modal + Passive Voice",
      ],
      spokenSentence:
        "Remote employees often enjoy discussing ideas online, yet they must protect their daily focus. If a neighborhood cafe gets too noisy, you might prefer a quiet coworking space instead.",
      hint: "Di Kalimat 1 perhatikan pola setelah “enjoy” dan modal “must”. Di Kalimat 2 perhatikan klausa pengandaian “If” dan modal “might”.",
      explanation:
        "Kalimat 1 menggabungkan Verb + Gerund (“enjoy discussing”) dan Modal Kewajiban (“must protect”). Kalimat 2 menggabungkan Conditional (“If...”) dan Modal Kemungkinan (“might prefer”).",
    },
    ...expandFindFixParagraph("remote", "Kerja & Gaya Hidup", [
      { text: "Many remote designers " },
      {
        text: "enjoy working",
        spanId: "err",
        structure: "Verb + Gerund",
        mutation: {
          id: "remote-ff-enjoy",
          rule: "Verb + Gerund (enjoy + V-ing)",
          wrongText: "enjoy to work",
          correction: "enjoy working",
          spokenSentence:
            "Many remote designers enjoy working from neighborhood cafes because they can order fresh coffee.",
          hint: "Kata kerja “enjoy” termasuk kelompok kata kerja yang wajib diikuti gerund (V-ing), bukan to + V1.",
          explanation:
            "Setelah “enjoy”, selalu gunakan gerund (-ing): ubah “enjoy to work” menjadi “enjoy working”.",
        },
      },
      { text: " from neighborhood cafes because they " },
      {
        text: "can order",
        spanId: "ok1",
        structure: "Modal + V1",
        mutation: {
          id: "remote-ff-modal",
          rule: "Modal + V1 (can + V1)",
          wrongText: "can ordering",
          correction: "can order",
          spokenSentence:
            "Many remote designers enjoy working from neighborhood cafes because they can order fresh coffee.",
          hint: "Setelah modal “can”, gunakan kata kerja dasar V1 murni tanpa -ing.",
          explanation:
            "Modal auxiliary “can” wajib diikuti V1 murni: “can order” (bukan “can ordering”).",
        },
      },
      { text: " fresh coffee and finish their drafts " },
      {
        text: "without checking",
        spanId: "ok2",
        structure: "Preposition + Gerund",
        mutation: {
          id: "remote-ff-prep",
          rule: "Preposition + Gerund (without + V-ing)",
          wrongText: "without check",
          correction: "without checking",
          spokenSentence:
            "Some writers finish their drafts without checking social media, which helps them stay productive.",
          hint: "Setelah preposisi “without”, kata kerja tidak bisa dibiarkan dalam bentuk V1 murni.",
          explanation:
            "Setiap kata kerja yang langsung mengikuti preposisi seperti “without” harus berbentuk gerund (-ing): “without checking”.",
        },
      },
      { text: " social media " },
      { text: "on their laptops", spanId: "ok3", structure: "Prepositional Phrase" },
      { text: "." },
    ]),
  );

  // =========================================================================
  // 3. MORNING HABITS FOR FOCUS
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "morning-bd-1",
      articleId: "morning",
      articleTitle: ARTICLE_TITLES.morning,
      category: "Kebiasaan Sehat",
      sentences: [
        {
          id: "s1",
          text: "Waking up thirty minutes earlier gives you extra time to prepare calmly.",
          expectedTags: ["Gerund (Subjek)", "Adverb of Manner (-ly)"],
          evidence: [
            { phrase: "Waking up", tag: "Gerund (Subjek)" },
            { phrase: "calmly", tag: "Adverb of Manner (-ly)" },
          ],
          trapHints: {
            "Present Continuous":
              "“Waking up” di awal Kalimat 1 adalah subjek dari kata kerja tunggal “gives” (Gerund), bukan Present Continuous.",
          },
        },
        {
          id: "s2",
          text: "Spending a few minutes stretching can improve your mood before work.",
          expectedTags: ["Quantifier (Countable)", "Modal + V1 (Active)"],
          evidence: [
            { phrase: "a few minutes", tag: "Quantifier (Countable)" },
            { phrase: "can improve", tag: "Modal + V1 (Active)" },
          ],
          trapHints: {
            "Quantifier (Uncountable)":
              "“minutes” pada Kalimat 2 adalah kata benda jamak yang dapat dihitung (countable), sehingga memakai “a few”.",
          },
        },
      ],
      tagBank: [
        "Gerund (Subjek)",
        "Adverb of Manner (-ly)",
        "Quantifier (Countable)",
        "Modal + V1 (Active)",
        "Quantifier (Uncountable)",
        "Present Continuous",
        "Superlative",
      ],
      spokenSentence:
        "Waking up thirty minutes earlier gives you extra time to prepare calmly. Spending a few minutes stretching can improve your mood before work.",
      hint: "Perhatikan subjek di awal Kalimat 1 dan kata berakhiran -ly di ujungnya, lalu perhatikan “a few minutes” serta “can improve” di Kalimat 2.",
      explanation:
        "Kalimat 1 menggunakan Gerund sebagai subjek (“Waking up”) dan Adverb of Manner (“calmly”). Kalimat 2 menggunakan Quantifier Countable (“a few minutes”) dan Modal + V1 (“can improve”).",
    },
    {
      kind: "breakdown",
      id: "morning-bd-2",
      articleId: "morning",
      articleTitle: ARTICLE_TITLES.morning,
      category: "Kebiasaan Sehat",
      sentences: [
        {
          id: "s1",
          text: "Although checking your phone feels tempting, it often makes your morning feel rushed.",
          expectedTags: ["Conjunction Pertentangan", "Present Simple Active"],
          evidence: [
            { phrase: "Although", tag: "Conjunction Pertentangan" },
            { phrase: "often makes", tag: "Present Simple Active" },
          ],
          trapHints: {
            "Conjunction Sebab-Akibat":
              "“Although” berarti “meskipun” (pertentangan), bukan sebab-akibat seperti “because” atau “so”.",
          },
        },
        {
          id: "s2",
          text: "People who plan to exercise regularly usually sleep better at night.",
          expectedTags: ["Verb + To-Infinitive", "Comparative Tidak Beraturan"],
          evidence: [
            { phrase: "plan to exercise", tag: "Verb + To-Infinitive" },
            { phrase: "better", tag: "Comparative Tidak Beraturan" },
          ],
          trapHints: {
            Superlative:
              "“better” adalah bentuk Comparative dari “good/well” (lebih nyenyak); bentuk Superlative-nya adalah “best”.",
          },
        },
      ],
      tagBank: [
        "Conjunction Pertentangan",
        "Present Simple Active",
        "Verb + To-Infinitive",
        "Comparative Tidak Beraturan",
        "Conjunction Sebab-Akibat",
        "Superlative",
        "Preposition + Gerund",
      ],
      spokenSentence:
        "Although checking your phone feels tempting, it often makes your morning feel rushed. People who plan to exercise regularly usually sleep better at night.",
      hint: "Di Kalimat 1 ada “Although” dan kebiasaan umum “often makes”. Di Kalimat 2 ada “plan to exercise” serta bentuk perbandingan dari “good/well”.",
      explanation:
        "Kalimat 1 memakai Conjunction Pertentangan (“Although”) dan Present Simple Active (“often makes”). Kalimat 2 memakai Verb + To-Infinitive (“plan to exercise”) dan Comparative Tidak Beraturan (“better”).",
    },
    ...expandFindFixParagraph("morning", "Kebiasaan Sehat", [
      { text: "When you sleep " },
      {
        text: "well",
        spanId: "err",
        structure: "Adverb",
        mutation: {
          id: "morning-ff-well",
          rule: "Adjective vs Adverb (good → well)",
          wrongText: "good",
          correction: "well",
          spokenSentence:
            "When you sleep well at night, you can concentrate more easily during morning meetings.",
          hint: "Bagian ini menerangkan kata kerja aksi “sleep” (tidur dengan nyenyak), bukan kata benda.",
          explanation:
            "Untuk menerangkan kata kerja “sleep”, gunakan adverb “well” (bukan adjective “good”).",
        },
      },
      { text: " at night, you " },
      { text: "can concentrate", spanId: "ok1", structure: "Modal + V1" },
      { text: " more easily. Take " },
      {
        text: "a few minutes",
        spanId: "ok2",
        structure: "Quantifier (Countable)",
        mutation: {
          id: "morning-ff-quantifier",
          rule: "Quantifier (a few vs a little)",
          wrongText: "a little minutes",
          correction: "a few minutes",
          spokenSentence:
            "Take a few minutes to breathe deeply before starting your tasks.",
          hint: "“minutes” adalah kata benda jamak yang bisa dihitung (1 menit, 2 menit). “a little” hanya untuk benda yang tidak bisa dihitung.",
          explanation:
            "Karena “minutes” adalah countable noun jamak, gunakan “a few minutes”, bukan “a little minutes”.",
        },
      },
      { text: " to breathe deeply " },
      {
        text: "before starting",
        spanId: "ok3",
        structure: "Preposition + Gerund",
        mutation: {
          id: "morning-ff-before",
          rule: "Preposition + Gerund (before + V-ing)",
          wrongText: "before to start",
          correction: "before starting",
          spokenSentence:
            "Take a few minutes to breathe deeply before starting your tasks.",
          hint: "Setelah preposisi “before” tanpa subjek, gunakan bentuk gerund (-ing), bukan to-infinitive.",
          explanation:
            "Preposisi “before” langsung diikuti gerund (-ing): “before starting”.",
        },
      },
      { text: " your tasks." },
    ]),
  );

  // =========================================================================
  // 4. A RAINY TRIP TO BANDUNG
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "bandung-bd-1",
      articleId: "bandung",
      articleTitle: ARTICLE_TITLES.bandung,
      category: "Cerita Masa Lalu",
      sentences: [
        {
          id: "s1",
          text: "When we arrived in Bandung last Saturday, it was raining heavily.",
          expectedTags: ["Past Simple", "Past Continuous"],
          evidence: [
            { phrase: "arrived", tag: "Past Simple" },
            { phrase: "was raining", tag: "Past Continuous" },
          ],
          trapHints: {
            "Present Continuous":
              "Kalimat 1 menggunakan to be lampau “was” + V-ing (“was raining”), jadi itu adalah Past Continuous.",
          },
        },
        {
          id: "s2",
          text: "Fortunately, we had booked a cozy guesthouse where warm ginger tea was served.",
          expectedTags: ["Past Perfect", "Past Simple Passive"],
          evidence: [
            { phrase: "had booked", tag: "Past Perfect" },
            { phrase: "was served", tag: "Past Simple Passive" },
          ],
          trapHints: {
            "Present Perfect":
              "Kalimat 2 memakai “had + V3” (“had booked”) untuk kejadian sebelum tiba di masa lalu, yaitu Past Perfect (bukan Present Perfect have/has).",
          },
        },
      ],
      tagBank: [
        "Past Simple",
        "Past Continuous",
        "Past Perfect",
        "Past Simple Passive",
        "Present Perfect",
        "Present Continuous",
        "Past Perfect Continuous",
      ],
      spokenSentence:
        "When we arrived in Bandung last Saturday, it was raining heavily. Fortunately, we had booked a cozy guesthouse where warm ginger tea was served.",
      hint: "Di Kalimat 1 ada aksi singkat yang memotong kejadian yang sedang berlangsung di masa lalu. Di Kalimat 2 ada “had + V3” dan “was + V3”.",
      explanation:
        "Kalimat 1 menggabungkan Past Simple (“arrived”) dan Past Continuous (“was raining”). Kalimat 2 menggabungkan Past Perfect (“had booked” — dipesan lebih dulu) dan Past Simple Passive (“was served” — disajikan).",
    },
    {
      kind: "breakdown",
      id: "bandung-bd-2",
      articleId: "bandung",
      articleTitle: ARTICLE_TITLES.bandung,
      category: "Cerita Masa Lalu",
      sentences: [
        {
          id: "s1",
          text: "The wooden cafe where we had breakfast overlooks a quiet pine forest.",
          expectedTags: ["Relative Pronoun (where)", "Present Simple Active"],
          evidence: [
            { phrase: "where we had breakfast", tag: "Relative Pronoun (where)" },
            { phrase: "overlooks", tag: "Present Simple Active" },
          ],
        },
        {
          id: "s2",
          text: "Everyone felt relaxed because the mountain air was much cooler than Jakarta.",
          expectedTags: ["Adjective -ed (Perasaan)", "Comparative (-er)"],
          evidence: [
            { phrase: "relaxed", tag: "Adjective -ed (Perasaan)" },
            { phrase: "cooler than", tag: "Comparative (-er)" },
          ],
          trapHints: {
            "Adjective -ing (Penyebab)":
              "“relaxed” berakhiran -ed karena menjelaskan perasaan orang (“Everyone felt relaxed”), bukan -ing.",
            "Past Simple Passive":
              "“felt relaxed” menggunakan linking verb “felt” + adjective perasaan “relaxed”, bukan kalimat pasif “was relaxed by...”.",
          },
        },
      ],
      tagBank: [
        "Relative Pronoun (where)",
        "Present Simple Active",
        "Adjective -ed (Perasaan)",
        "Comparative (-er)",
        "Adjective -ing (Penyebab)",
        "Past Simple Passive",
        "Superlative (-est)",
      ],
      spokenSentence:
        "The wooden cafe where we had breakfast overlooks a quiet pine forest. Everyone felt relaxed because the mountain air was much cooler than Jakarta.",
      hint: "Perhatikan kata penghubung tempat dan kata kerja utama “overlooks” di Kalimat 1, serta kata sifat setelah “felt” dan perbandingan “cooler than” di Kalimat 2.",
      explanation:
        "Kalimat 1 menggunakan Relative Pronoun tempat (“where”) dan Present Simple Active (“overlooks”). Kalimat 2 menggunakan Adjective -ed untuk perasaan (“relaxed”) dan Comparative (“cooler than”).",
    },
    ...expandFindFixParagraph("bandung", "Cerita Masa Lalu", [
      { text: "We stayed in a historic villa that " },
      {
        text: "was built",
        spanId: "err",
        structure: "Past Simple Passive",
        mutation: {
          id: "bandung-ff-passive",
          rule: "Past Simple Passive (was/were + V3)",
          wrongText: "was build",
          correction: "was built",
          spokenSentence:
            "We stayed in a historic villa that was built in 1935, while heavy rain fell outside.",
          hint: "Setelah “was” pada kalimat pasif (“dibangun”), kata kerja “build” harus diubah ke bentuk V3.",
          explanation:
            "Pola Past Simple Passive adalah “was/were + V3”. Bentuk V3 dari “build” adalah “built”, jadi perbaikannya “was built”.",
        },
      },
      { text: " in 1935, " },
      { text: "while", spanId: "ok1", structure: "Conjunction" },
      { text: " heavy rain " },
      {
        text: "fell",
        spanId: "ok2",
        structure: "Past Simple",
        mutation: {
          id: "bandung-ff-fell",
          rule: "Past Simple Irregular (fall → fell)",
          wrongText: "falled",
          correction: "fell",
          spokenSentence:
            "We stayed in a historic villa that was built in 1935, while heavy rain fell outside.",
          hint: "Kata kerja “fall” termasuk irregular verb; bentuk V2-nya tidak memakai akhiran -ed.",
          explanation:
            "Bentuk lampau (V2) dari “fall” adalah “fell” (bukan “falled”).",
        },
      },
      { text: " outside. Nobody felt " },
      {
        text: "bored",
        spanId: "ok3",
        structure: "Adjective -ed",
        mutation: {
          id: "bandung-ff-ed",
          rule: "Adjective -ed vs -ing",
          wrongText: "boring",
          correction: "bored",
          spokenSentence:
            "Nobody felt bored during the trip because the mountain view was truly amazing.",
          hint: "“Nobody felt ...” menggambarkan perasaan orang (merasa bosan), bukan sifat benda yang membosankan.",
          explanation:
            "Untuk perasaan seseorang gunakan akhiran -ed (“bored”), sedangkan -ing (“boring”) berarti membosankan.",
        },
      },
      { text: " during the trip." },
    ]),
  );

  // =========================================================================
  // 5. CITY BIKE-SHARING PROGRAM
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "bike-bd-1",
      articleId: "bike",
      articleTitle: ARTICLE_TITLES.bike,
      category: "Kota & Lingkungan",
      sentences: [
        {
          id: "s1",
          text: "The city's bike-sharing program has been growing steadily since 2023.",
          expectedTags: ["Present Perfect Continuous"],
          evidence: [
            { phrase: "has been growing", tag: "Present Perfect Continuous" },
          ],
          trapHints: {
            "Present Continuous":
              "Kalimat 1 memakai “has been + V-ing” dengan “since 2023”, jadi ini Present Perfect Continuous, bukan Present Continuous biasa.",
            "Present Perfect Passive":
              "Setelah “has been” adalah V-ing aktif (“growing”), bukan V3 pasif.",
          },
        },
        {
          id: "s2",
          text: "Riding a bicycle is cheaper than taking a taxi during rush hour.",
          expectedTags: ["Comparative (-er)"],
          evidence: [{ phrase: "cheaper than", tag: "Comparative (-er)" }],
        },
        {
          id: "s3",
          text: "Fifty new stations will be added next month unless bad weather delays construction.",
          expectedTags: [
            "Future Simple Passive",
            "Conjunction Syarat Negatif (unless)",
          ],
          evidence: [
            { phrase: "will be added", tag: "Future Simple Passive" },
            { phrase: "unless", tag: "Conjunction Syarat Negatif (unless)" },
          ],
          trapHints: {
            "Future Simple Active":
              "Di Kalimat 3 ada “will + be + V3 (added)” karena stasiun baru “akan ditambahkan” (pasif).",
          },
        },
      ],
      tagBank: [
        "Present Perfect Continuous",
        "Comparative (-er)",
        "Future Simple Passive",
        "Conjunction Syarat Negatif (unless)",
        "Present Continuous",
        "Future Simple Active",
        "Present Perfect Passive",
      ],
      spokenSentence:
        "The city's bike-sharing program has been growing steadily since 2023. Riding a bicycle is cheaper than taking a taxi during rush hour. Fifty new stations will be added next month unless bad weather delays construction.",
      hint: "Cermati pola “has been + V-ing” di Kalimat 1, perbandingan “cheaper than” di Kalimat 2, serta “will be + V3” dan “unless” di Kalimat 3.",
      explanation:
        "Kalimat 1 menggunakan Present Perfect Continuous (“has been growing”). Kalimat 2 menggunakan Comparative (“cheaper than”). Kalimat 3 menggunakan Future Simple Passive (“will be added”) dan Conjunction Syarat Negatif (“unless”).",
    },
    {
      kind: "breakdown",
      id: "bike-bd-2",
      articleId: "bike",
      articleTitle: ARTICLE_TITLES.bike,
      category: "Kota & Lingkungan",
      sentences: [
        {
          id: "s1",
          text: "Commuters whose offices are near the station can rent a bicycle using a mobile card.",
          expectedTags: [
            "Relative Pronoun Kepemilikan (whose)",
            "Modal + V1 (Active)",
          ],
          evidence: [
            {
              phrase: "whose offices",
              tag: "Relative Pronoun Kepemilikan (whose)",
            },
            { phrase: "can rent", tag: "Modal + V1 (Active)" },
          ],
          trapHints: {
            "Relative Pronoun (who)":
              "Di Kalimat 1 kata penghubung diikuti benda yang dimiliki (“whose offices” = yang kantornya), bukan “who”.",
          },
        },
        {
          id: "s2",
          text: "Every bicycle must be returned to an official dock before the station closes at midnight.",
          expectedTags: ["Modal + Passive Voice", "Conjunction Waktu (before)"],
          evidence: [
            { phrase: "must be returned", tag: "Modal + Passive Voice" },
            { phrase: "before", tag: "Conjunction Waktu (before)" },
          ],
          trapHints: {
            "Past Simple Passive":
              "Kalimat 2 memakai “must + be + V3 (returned)”, yaitu Modal + Passive Voice, bukan Past Simple Passive (was/were + V3).",
          },
        },
      ],
      tagBank: [
        "Relative Pronoun Kepemilikan (whose)",
        "Modal + V1 (Active)",
        "Modal + Passive Voice",
        "Conjunction Waktu (before)",
        "Relative Pronoun (who)",
        "Past Simple Passive",
        "Verb + To-Infinitive",
      ],
      spokenSentence:
        "Commuters whose offices are near the station can rent a bicycle using a mobile card. Every bicycle must be returned to an official dock before the station closes at midnight.",
      hint: "Di Kalimat 1 ada kata ganti kepemilikan sebelum “offices” dan modal aktif “can rent”. Di Kalimat 2 ada “must be returned” dan konjungsi waktu “before”.",
      explanation:
        "Kalimat 1 memakai Relative Pronoun kepemilikan (“whose”) dan Modal + V1 (“can rent”). Kalimat 2 memakai Modal + Passive Voice (“must be returned”) dan Conjunction Waktu (“before”).",
    },
    ...expandFindFixParagraph("bike", "Kota & Lingkungan", [
      { text: "Every rider " },
      {
        text: "must return",
        spanId: "err",
        structure: "Modal + V1",
        mutation: {
          id: "bike-ff-modal-to",
          rule: "Modal + V1 tanpa “to”",
          wrongText: "must to return",
          correction: "must return",
          spokenSentence:
            "Every rider must return the bicycle before midnight so that other commuters can use it the next morning.",
          hint: "Modal auxiliary seperti “must”, “can”, atau “should” tidak boleh diikuti oleh “to”.",
          explanation:
            "Modal “must” langsung diikuti V1 murni tanpa “to”: perbaikannya adalah “must return”.",
        },
      },
      { text: " the bicycle before midnight. For short trips downtown, cycling is " },
      {
        text: "faster",
        spanId: "ok1",
        structure: "Comparative",
        mutation: {
          id: "bike-ff-comparative",
          rule: "Comparative 1 Suku Kata (-er)",
          wrongText: "more fast",
          correction: "faster",
          spokenSentence:
            "For short trips downtown, cycling is faster than waiting in traffic.",
          hint: "“fast” hanya terdiri dari 1 suku kata, jadi bentuk comparative-nya memakai akhiran -er, bukan “more”.",
          explanation:
            "Kata sifat pendek 1 suku kata “fast” berubah menjadi “faster” (bukan “more fast”).",
        },
      },
      { text: " than waiting in traffic, and new lanes " },
      {
        text: "will be built",
        spanId: "ok2",
        structure: "Future Simple Passive",
        mutation: {
          id: "bike-ff-future-passive",
          rule: "Future Simple Passive (will + be + V3)",
          wrongText: "will be build",
          correction: "will be built",
          spokenSentence:
            "New cycling lanes will be built across the city center next year.",
          hint: "Setelah “will be” pada kalimat pasif, gunakan bentuk V3 dari “build”.",
          explanation:
            "Future Simple Passive memakai “will + be + V3”: ubah “will be build” menjadi “will be built”.",
        },
      },
      { text: " " },
      { text: "next year", spanId: "ok3", structure: "Time Expression" },
      { text: "." },
    ]),
  );

  // =========================================================================
  // 6. RENDANG & INDONESIAN STREET FOOD
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "kuliner-bd-1",
      articleId: "kuliner",
      articleTitle: ARTICLE_TITLES.kuliner,
      category: "Kuliner Nusantara",
      sentences: [
        {
          id: "s1",
          text: "Rendang is cooked slowly for several hours until the coconut milk thickens into rich spices.",
          expectedTags: ["Present Simple Passive", "Conjunction Batas Waktu (until)"],
          evidence: [
            { phrase: "is cooked", tag: "Present Simple Passive" },
            { phrase: "until", tag: "Conjunction Batas Waktu (until)" },
          ],
          trapHints: {
            "Past Simple Passive":
              "Kalimat 1 menggunakan “is cooked” (fakta cara memasak secara umum), bukan “was cooked”.",
          },
        },
        {
          id: "s2",
          text: "Travelers who visit West Sumatra always enjoy tasting authentic dishes at local markets.",
          expectedTags: ["Relative Clause (who)", "Verb + Gerund"],
          evidence: [
            { phrase: "who visit West Sumatra", tag: "Relative Clause (who)" },
            { phrase: "enjoy tasting", tag: "Verb + Gerund" },
          ],
          trapHints: {
            "Present Continuous":
              "“tasting” di Kalimat 2 adalah objek setelah kata kerja “enjoy” (Verb + Gerund), bukan Present Continuous.",
          },
        },
      ],
      tagBank: [
        "Present Simple Passive",
        "Conjunction Batas Waktu (until)",
        "Relative Clause (who)",
        "Verb + Gerund",
        "Past Simple Passive",
        "Present Continuous",
        "Verb + To-Infinitive",
      ],
      spokenSentence:
        "Rendang is cooked slowly for several hours until the coconut milk thickens into rich spices. Travelers who visit West Sumatra always enjoy tasting authentic dishes at local markets.",
      hint: "Perhatikan pola pasif “is + V3” dan kata sambung “until” di Kalimat 1, serta klausa “who visit” dan “enjoy + V-ing” di Kalimat 2.",
      explanation:
        "Kalimat 1 memakai Present Simple Passive (“is cooked”) dan Conjunction (“until”). Kalimat 2 memakai Relative Clause (“who visit...”) dan Verb + Gerund (“enjoy tasting”).",
    },
    ...expandFindFixParagraph("kuliner", "Kuliner Nusantara", [
      { text: "Traditional rendang " },
      {
        text: "is cooked",
        spanId: "s1",
        structure: "Present Simple Passive",
        mutation: {
          id: "kuliner-ff-passive",
          rule: "Present Simple Passive (is + V3)",
          wrongText: "is cook",
          correction: "is cooked",
          spokenSentence:
            "Traditional rendang is cooked slowly with coconut milk and aromatic spices.",
          hint: "Rendang tidak memasak dirinya sendiri, melainkan “dimasak” (pasif: is + V3).",
          explanation:
            "Setelah “is” pada kalimat pasif, kata kerja “cook” harus diubah ke V3: “is cooked”.",
        },
      },
      { text: " slowly with coconut milk. This dish smells " },
      {
        text: "delicious",
        spanId: "s2",
        structure: "Adjective setelah Linking Verb",
        mutation: {
          id: "kuliner-ff-smell",
          rule: "Linking Verb + Adjective (smells + adj)",
          wrongText: "deliciously",
          correction: "delicious",
          spokenSentence:
            "This dish smells delicious and has become famous around the world.",
          hint: "Kata kerja panca indra “smells” (tercium/beraroma) diikuti oleh adjective, bukan adverb -ly.",
          explanation:
            "Setelah linking verb seperti “smells”, “looks”, atau “tastes”, gunakan adjective “delicious” (bukan “deliciously”).",
        },
      },
      { text: " and " },
      {
        text: "has become",
        spanId: "s3",
        structure: "Present Perfect",
        mutation: {
          id: "kuliner-ff-perfect",
          rule: "Present Perfect (has + V3)",
          wrongText: "has became",
          correction: "has become",
          spokenSentence:
            "This dish smells delicious and has become famous around the world.",
          hint: "Perhatikan perubahan become – became – become: setelah “has”, wajib gunakan V3 (“become”), bukan V2 (“became”).",
          explanation:
            "Bentuk V3 dari “become” kembali menjadi “become” (become–became–become), jadi gunakan “has become”.",
        },
      },
      { text: " one of the " },
      { text: "most flavorful", spanId: "s4", structure: "Superlative" },
      { text: " foods in the world." },
    ]),
  );

  // =========================================================================
  // 7. PREPARING FOR A JOB INTERVIEW
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "interview-bd-1",
      articleId: "interview",
      articleTitle: ARTICLE_TITLES.interview,
      category: "Karier & Profesional",
      sentences: [
        {
          id: "s1",
          text: "Candidates should research the company thoroughly before they attend a job interview.",
          expectedTags: ["Modal Saran (should)", "Conjunction Waktu (before)"],
          evidence: [
            { phrase: "should research", tag: "Modal Saran (should)" },
            { phrase: "before", tag: "Conjunction Waktu (before)" },
          ],
        },
        {
          id: "s2",
          text: "Practicing common questions out loud helps you speak more confidently in front of the recruiter.",
          expectedTags: ["Gerund (Subjek)", "Comparative Adverb (more + -ly)"],
          evidence: [
            { phrase: "Practicing", tag: "Gerund (Subjek)" },
            { phrase: "more confidently", tag: "Comparative Adverb (more + -ly)" },
          ],
          trapHints: {
            "Present Continuous":
              "“Practicing” di awal Kalimat 2 adalah subjek dari kata kerja “helps” (Gerund), bukan Present Continuous.",
          },
        },
      ],
      tagBank: [
        "Modal Saran (should)",
        "Conjunction Waktu (before)",
        "Gerund (Subjek)",
        "Comparative Adverb (more + -ly)",
        "Present Continuous",
        "Modal Kewajiban (must)",
        "Superlative",
      ],
      spokenSentence:
        "Candidates should research the company thoroughly before they attend a job interview. Practicing common questions out loud helps you speak more confidently in front of the recruiter.",
      hint: "Cermati modal saran “should” dan konjungsi “before” di Kalimat 1, serta subjek “Practicing” dan perbandingan “more confidently” di Kalimat 2.",
      explanation:
        "Kalimat 1 memakai Modal Saran (“should research”) dan Conjunction Waktu (“before”). Kalimat 2 memakai Gerund sebagai subjek (“Practicing”) dan Comparative Adverb (“more confidently”).",
    },
    ...expandFindFixParagraph("interview", "Karier & Profesional", [
      { text: "Before the interview begins, you " },
      {
        text: "should prepare",
        spanId: "s1",
        structure: "Modal + V1",
        mutation: {
          id: "interview-ff-should",
          rule: "Modal + V1 (should + V1)",
          wrongText: "should prepares",
          correction: "should prepare",
          spokenSentence:
            "Before the interview begins, you should prepare several questions about the role.",
          hint: "Setelah modal “should”, kata kerja tidak pernah mendapat akhiran -s.",
          explanation:
            "Semua modal auxiliary (should/can/must) wajib diikuti V1 murni tanpa -s: “should prepare”.",
        },
      },
      { text: " several questions about the role. Try to answer every question " },
      {
        text: "clearly",
        spanId: "s2",
        structure: "Adverb of Manner",
        mutation: {
          id: "interview-ff-adverb",
          rule: "Adverb (-ly) untuk menerangkan kata kerja",
          wrongText: "clear",
          correction: "clearly",
          spokenSentence:
            "Try to answer every question clearly and politely during the session.",
          hint: "Kata ini menerangkan cara menjawab (“answer”), sehingga membutuhkan bentuk adverb (-ly).",
          explanation:
            "Untuk menerangkan kata kerja “answer”, ubah adjective “clear” menjadi adverb “clearly”.",
        },
      },
      { text: " and avoid " },
      {
        text: "arriving",
        spanId: "s3",
        structure: "Verb + Gerund",
        mutation: {
          id: "interview-ff-avoid",
          rule: "Verb + Gerund (avoid + V-ing)",
          wrongText: "to arrive",
          correction: "arriving",
          spokenSentence:
            "Always avoid arriving late to an important job interview.",
          hint: "Kata kerja “avoid” wajib diikuti oleh gerund (V-ing), bukan to-infinitive.",
          explanation:
            "Setelah kata kerja “avoid”, gunakan bentuk gerund (-ing): “avoid arriving”.",
        },
      },
      { text: " late " },
      { text: "at the office", spanId: "s4", structure: "Prepositional Phrase" },
      { text: "." },
    ]),
  );

  // =========================================================================
  // 8. SMART ONLINE SHOPPING
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "shopping-bd-1",
      articleId: "shopping",
      articleTitle: ARTICLE_TITLES.shopping,
      category: "Teknologi & Belanja",
      sentences: [
        {
          id: "s1",
          text: "Online shopping has made buying daily necessities much easier for busy families.",
          expectedTags: ["Present Perfect", "Comparative (-er)"],
          evidence: [
            { phrase: "has made", tag: "Present Perfect" },
            { phrase: "easier", tag: "Comparative (-er)" },
          ],
        },
        {
          id: "s2",
          text: "However, buyers should check customer reviews carefully so that they do not receive fake products.",
          expectedTags: ["Modal Saran (should)", "Adverb of Manner (-ly)"],
          evidence: [
            { phrase: "should check", tag: "Modal Saran (should)" },
            { phrase: "carefully", tag: "Adverb of Manner (-ly)" },
          ],
          trapHints: {
            "Present Simple Passive":
              "Di Kalimat 2 tidak ada pola to be + V3; baik “should check” maupun “do not receive” berbentuk aktif.",
          },
        },
      ],
      tagBank: [
        "Present Perfect",
        "Comparative (-er)",
        "Modal Saran (should)",
        "Adverb of Manner (-ly)",
        "Present Simple Passive",
        "Past Perfect",
        "Superlative (-est)",
      ],
      spokenSentence:
        "Online shopping has made buying daily necessities much easier for busy families. However, buyers should check customer reviews carefully so that they do not receive fake products.",
      hint: "Perhatikan “has made” dan “easier” di Kalimat 1, serta anjuran “should check” dan kata keterangan cara “carefully” di Kalimat 2.",
      explanation:
        "Kalimat 1 menggabungkan Present Perfect (“has made”) dan Comparative (“easier”). Kalimat 2 menggabungkan Modal Saran (“should check”) dan Adverb of Manner (“carefully”).",
    },
    ...expandFindFixParagraph("shopping", "Teknologi & Belanja", [
      { text: "Before you decide " },
      {
        text: "to buy",
        spanId: "s1",
        structure: "Verb + To-Infinitive",
        mutation: {
          id: "shopping-ff-decide",
          rule: "Verb + To-Infinitive (decide + to V1)",
          wrongText: "buying",
          correction: "to buy",
          spokenSentence:
            "Before you decide to buy an electronic gadget online, compare the prices carefully.",
          hint: "Kata kerja “decide” selalu diikuti oleh to-infinitive (to + V1), bukan gerund (-ing).",
          explanation:
            "Setelah “decide”, gunakan to-infinitive: “decide to buy”.",
        },
      },
      { text: " an electronic gadget, check whether the store has " },
      {
        text: "any",
        spanId: "s2",
        structure: "Quantifier",
        mutation: {
          id: "shopping-ff-much",
          rule: "Quantifier Countable (many vs much)",
          wrongText: "much",
          correction: "many",
          acceptedCorrections: ["many", "any"],
          spokenSentence:
            "Check whether the online store has many verified reviews from real buyers.",
          hint: "Kata benda setelahnya adalah “verified reviews” (jamak dan dapat dihitung), sehingga tidak boleh memakai “much”.",
          explanation:
            "“Reviews” adalah countable noun jamak; gunakan “many” (atau “any”), bukan “much”.",
        },
      },
      { text: " verified reviews. Packages " },
      {
        text: "are delivered",
        spanId: "s3",
        structure: "Present Simple Passive",
        mutation: {
          id: "shopping-ff-delivered",
          rule: "Present Simple Passive (are + V3)",
          wrongText: "are deliver",
          correction: "are delivered",
          spokenSentence:
            "Packages are delivered directly to your house within two days.",
          hint: "Paket “dikirimkan” (pasif), jadi setelah “are” gunakan bentuk V3.",
          explanation:
            "Pada kalimat pasif, setelah to be “are” wajib diikuti V3: “are delivered”.",
        },
      },
      { text: " directly to your house " },
      { text: "within two days", spanId: "s4", structure: "Time Phrase" },
      { text: "." },
    ]),
  );

  // =========================================================================
  // 9. SUNRISE AT MOUNT BROMO
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "bromo-bd-1",
      articleId: "bromo",
      articleTitle: ARTICLE_TITLES.bromo,
      category: "Petualangan Alam",
      sentences: [
        {
          id: "s1",
          text: "We left our hotel at three in the morning so that we could catch the sunrise at Mount Bromo.",
          expectedTags: ["Past Simple", "Modal Kemampuan Lampau (could)"],
          evidence: [
            { phrase: "left", tag: "Past Simple" },
            { phrase: "could catch", tag: "Modal Kemampuan Lampau (could)" },
          ],
          trapHints: {
            "Modal + V1 (can)":
              "Karena peristiwa ini terjadi di masa lalu (“left”), modal yang dipakai adalah bentuk lampau “could”, bukan “can”.",
          },
        },
        {
          id: "s2",
          text: "Although the wind was freezing, the golden sky looked breathtaking from the viewpoint.",
          expectedTags: [
            "Conjunction Pertentangan",
            "Adjective -ing (Penyebab)",
          ],
          evidence: [
            { phrase: "Although", tag: "Conjunction Pertentangan" },
            { phrase: "breathtaking", tag: "Adjective -ing (Penyebab)" },
          ],
        },
      ],
      tagBank: [
        "Past Simple",
        "Modal Kemampuan Lampau (could)",
        "Conjunction Pertentangan",
        "Adjective -ing (Penyebab)",
        "Modal + V1 (can)",
        "Present Perfect",
        "Adjective -ed (Perasaan)",
      ],
      spokenSentence:
        "We left our hotel at three in the morning so that we could catch the sunrise at Mount Bromo. Although the wind was freezing, the golden sky looked breathtaking from the viewpoint.",
      hint: "Cermati V2 “left” dan modal lampau “could” di Kalimat 1, serta konjungsi “Although” dan sifat pemandangan “breathtaking” di Kalimat 2.",
      explanation:
        "Kalimat 1 menggunakan Past Simple (“left”) dan Modal lampau (“could catch”). Kalimat 2 menggunakan Conjunction Pertentangan (“Although”) dan Adjective -ing (“breathtaking” / “freezing”).",
    },
    ...expandFindFixParagraph("bromo", "Petualangan Alam", [
      { text: "Last month, we rented a jeep " },
      {
        text: "that took",
        spanId: "s1",
        structure: "Relative Clause + Past Simple",
        mutation: {
          id: "bromo-ff-relative",
          rule: "Relative Pronoun untuk Benda (that / which)",
          wrongText: "who took",
          correction: "that took",
          acceptedCorrections: ["that took", "which took"],
          spokenSentence:
            "Last month, we rented a jeep that took us across the sea of sand.",
          hint: "“a jeep” adalah kata benda (kendaraan), bukan orang, sehingga tidak boleh memakai kata ganti “who”.",
          explanation:
            "Untuk benda seperti “a jeep”, gunakan relative pronoun “that” atau “which” (bukan “who”).",
        },
      },
      { text: " us across the sea of sand. Every traveler was " },
      {
        text: "excited",
        spanId: "s2",
        structure: "Adjective -ed (Perasaan)",
        mutation: {
          id: "bromo-ff-excited",
          rule: "Adjective -ed vs -ing (excited vs exciting)",
          wrongText: "exciting",
          correction: "excited",
          spokenSentence:
            "Every traveler was excited when the sun slowly appeared behind the volcano.",
          hint: "Subjeknya adalah orang (“Every traveler”) yang merasakan semangat, bukan sesuatu yang menegangkan.",
          explanation:
            "Untuk menggambarkan perasaan orang (merasa bersemangat/antusias), gunakan akhiran -ed: “excited”.",
        },
      },
      { text: " when the sun " },
      {
        text: "appeared",
        spanId: "s3",
        structure: "Past Simple",
      },
      { text: " behind " },
      { text: "the volcano", spanId: "s4", structure: "Article + Noun" },
      { text: "." },
    ]),
  );

  // =========================================================================
  // 10. MANAGING PERSONAL FINANCES
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "finance-bd-1",
      articleId: "finance",
      articleTitle: ARTICLE_TITLES.finance,
      category: "Keuangan Pribadi",
      sentences: [
        {
          id: "s1",
          text: "Recording your daily expenses helps you understand where your money goes each month.",
          expectedTags: ["Gerund (Subjek)", "Present Simple Active"],
          evidence: [
            { phrase: "Recording", tag: "Gerund (Subjek)" },
            { phrase: "helps / goes", tag: "Present Simple Active" },
          ],
          trapHints: {
            "Present Continuous":
              "“Recording” di awal Kalimat 1 adalah Gerund sebagai subjek dari kata kerja “helps”.",
          },
        },
        {
          id: "s2",
          text: "If you save a little money every payday, your emergency fund will grow steadily.",
          expectedTags: [
            "Quantifier (Uncountable)",
            "Future Simple Active",
          ],
          evidence: [
            { phrase: "a little money", tag: "Quantifier (Uncountable)" },
            { phrase: "will grow", tag: "Future Simple Active" },
          ],
          trapHints: {
            "Quantifier (Countable)":
              "“money” adalah uncountable noun (tidak dihitung satuan), sehingga menggunakan “a little”, bukan “a few”.",
          },
        },
      ],
      tagBank: [
        "Gerund (Subjek)",
        "Present Simple Active",
        "Quantifier (Uncountable)",
        "Future Simple Active",
        "Quantifier (Countable)",
        "Present Continuous",
        "Future Simple Passive",
      ],
      spokenSentence:
        "Recording your daily expenses helps you understand where your money goes each month. If you save a little money every payday, your emergency fund will grow steadily.",
      hint: "Cermati subjek “Recording” di Kalimat 1, serta quantifier sebelum “money” dan bentuk “will grow” di Kalimat 2.",
      explanation:
        "Kalimat 1 memakai Gerund sebagai subjek (“Recording”) dan Present Simple Active (“helps”). Kalimat 2 memakai Quantifier Uncountable (“a little money”) dan Future Simple Active (“will grow”).",
    },
    ...expandFindFixParagraph("finance", "Keuangan Pribadi", [
      { text: "Many young workers do not spend " },
      {
        text: "much money",
        spanId: "s1",
        structure: "Quantifier Uncountable",
        mutation: {
          id: "finance-ff-much",
          rule: "Much vs Many untuk Uncountable Noun",
          wrongText: "many money",
          correction: "much money",
          spokenSentence:
            "Many young workers do not spend much money on luxury items.",
          hint: "Kata “money” adalah uncountable noun, sehingga tidak pernah dipasangkan dengan “many”.",
          explanation:
            "Gunakan “much money” karena “money” tidak dapat dihitung secara langsung dalam bahasa Inggris.",
        },
      },
      { text: " on luxury items because they prefer " },
      {
        text: "investing",
        spanId: "s2",
        structure: "Verb + Gerund",
      },
      { text: " for the future. You will not reach your savings goal " },
      {
        text: "unless",
        spanId: "s3",
        structure: "Conjunction Syarat Negatif",
        mutation: {
          id: "finance-ff-unless",
          rule: "Conjunction (unless vs if)",
          wrongText: "if",
          correction: "unless",
          spokenSentence:
            "You will not reach your savings goal unless you control impulse buying.",
          hint: "Jika memakai “if you control”, artinya menjadi terbalik (tidak akan tercapai jika kamu berhemat). Gunakan kata sambung yang berarti “kecuali jika”.",
          explanation:
            "Gunakan “unless” (kecuali jika / jika tidak) agar makna syaratnya tepat.",
        },
      },
      { text: " you " },
      { text: "control", spanId: "s4", structure: "Present Simple" },
      { text: " impulse buying." },
    ]),
  );

  // =========================================================================
  // 11. ELECTRIC VEHICLES IN BIG CITIES
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "ev-bd-1",
      articleId: "ev",
      articleTitle: ARTICLE_TITLES.ev,
      category: "Transportasi Masa Depan",
      sentences: [
        {
          id: "s1",
          text: "Electric buses are being introduced in major cities to reduce air pollution.",
          expectedTags: ["Present Continuous Passive"],
          evidence: [
            {
              phrase: "are being introduced",
              tag: "Present Continuous Passive",
            },
          ],
          trapHints: {
            "Present Continuous":
              "Perhatikan kata “being + V3 (introduced)” setelah “are”: bus listrik “sedang diperkenalkan” (pasif), bukan memperkenalkan.",
            "Present Simple Passive":
              "Ada kata “being” di antara “are” dan “introduced”, yang menandakan proses sedang berlangsung saat ini (Continuous Passive).",
          },
        },
        {
          id: "s2",
          text: "Although electric cars are quieter than gasoline cars, more charging stations must be built across the highway.",
          expectedTags: ["Comparative (-er)", "Modal + Passive Voice"],
          evidence: [
            { phrase: "quieter than", tag: "Comparative (-er)" },
            { phrase: "must be built", tag: "Modal + Passive Voice" },
          ],
        },
      ],
      tagBank: [
        "Present Continuous Passive",
        "Comparative (-er)",
        "Modal + Passive Voice",
        "Present Continuous",
        "Present Simple Passive",
        "Superlative (-est)",
        "Modal + V1 (Active)",
      ],
      spokenSentence:
        "Electric buses are being introduced in major cities to reduce air pollution. Although electric cars are quieter than gasoline cars, more charging stations must be built across the highway.",
      hint: "Perhatikan pola “are + being + V3” di Kalimat 1, serta perbandingan “quieter than” dan “must be built” di Kalimat 2.",
      explanation:
        "Kalimat 1 menggunakan Present Continuous Passive (“are being introduced”). Kalimat 2 menggunakan Comparative (“quieter than”) dan Modal + Passive Voice (“must be built”).",
    },
    ...expandFindFixParagraph("ev", "Transportasi Masa Depan", [
      { text: "Fast-charging stations " },
      {
        text: "can be found",
        spanId: "s1",
        structure: "Modal + Passive",
        mutation: {
          id: "ev-ff-passive",
          rule: "Modal + Passive (can + be + V3)",
          wrongText: "can found",
          correction: "can be found",
          spokenSentence:
            "Fast-charging stations can be found at many rest areas along the toll road.",
          hint: "Stasiun pengisian daya “dapat ditemukan” (pasif); jangan lupakan kata “be” di antara “can” dan V3 “found”.",
          explanation:
            "Pola Modal + Passive membutuhkan “be” sebelum V3: “can be found” (bukan “can found”).",
        },
      },
      { text: " at many rest areas. Driving an electric car is " },
      {
        text: "more environmentally friendly",
        spanId: "s2",
        structure: "Comparative",
      },
      { text: " than driving an old diesel car, " },
      {
        text: "although",
        spanId: "s3",
        structure: "Conjunction Pertentangan",
        mutation: {
          id: "ev-ff-although",
          rule: "Conjunction (although vs because)",
          wrongText: "because",
          correction: "although",
          acceptedCorrections: ["although", "even though", "though", "but"],
          spokenSentence:
            "Driving an electric car is cleaner, although the battery price is still quite high.",
          hint: "Klausa kedua (“harga baterainya masih cukup mahal”) berlawanan dengan kelebihan di klausa pertama, bukan penyebabnya.",
          explanation:
            "Hubungan kedua klausa adalah pertentangan (kontras), jadi gunakan “although” / “even though” (bukan “because”).",
        },
      },
      { text: " the battery price " },
      { text: "is still", spanId: "s4", structure: "Present Nominal" },
      { text: " quite high." },
    ]),
  );

  // =========================================================================
  // 12. LEARNING A FOREIGN LANGUAGE
  // =========================================================================
  pool.push(
    {
      kind: "breakdown",
      id: "language-bd-1",
      articleId: "language",
      articleTitle: ARTICLE_TITLES.language,
      category: "Edukasi & Konsistensi",
      sentences: [
        {
          id: "s1",
          text: "Learners who practice speaking for fifteen minutes every day improve much faster than those who only memorize rules.",
          expectedTags: ["Relative Clause (who)", "Comparative (-er)"],
          evidence: [
            { phrase: "who practice speaking", tag: "Relative Clause (who)" },
            { phrase: "faster than", tag: "Comparative (-er)" },
          ],
        },
        {
          id: "s2",
          text: "You should not be afraid of making mistakes because every correction helps you remember the pattern.",
          expectedTags: [
            "Modal Saran Negatif (should not)",
            "Preposition + Gerund",
          ],
          evidence: [
            {
              phrase: "should not be",
              tag: "Modal Saran Negatif (should not)",
            },
            { phrase: "of making", tag: "Preposition + Gerund" },
          ],
          trapHints: {
            "Present Continuous":
              "“making” di Kalimat 2 jatuh setelah preposisi “of” (“afraid of making”), sehingga berstatus Preposition + Gerund.",
          },
        },
      ],
      tagBank: [
        "Relative Clause (who)",
        "Comparative (-er)",
        "Modal Saran Negatif (should not)",
        "Preposition + Gerund",
        "Present Continuous",
        "Superlative (-est)",
        "Past Simple Passive",
      ],
      spokenSentence:
        "Learners who practice speaking for fifteen minutes every day improve much faster than those who only memorize rules. You should not be afraid of making mistakes because every correction helps you remember the pattern.",
      hint: "Perhatikan klausa “who practice” dan “faster than” di Kalimat 1, serta “should not” dan bentuk setelah preposisi “of” di Kalimat 2.",
      explanation:
        "Kalimat 1 memakai Relative Clause (“who practice...”) dan Comparative (“faster than”). Kalimat 2 memakai Modal Saran Negatif (“should not”) dan Preposition + Gerund (“of making”).",
    },
    ...expandFindFixParagraph("language", "Edukasi & Konsistensi", [
      { text: "Many students are interested in " },
      {
        text: "learning",
        spanId: "s1",
        structure: "Preposition + Gerund",
        mutation: {
          id: "language-ff-in",
          rule: "Preposition + Gerund (interested in + V-ing)",
          wrongText: "learn",
          correction: "learning",
          spokenSentence:
            "Many students are interested in learning English by watching movies.",
          hint: "Setelah preposisi “in” pada ungkapan “interested in”, kata kerja wajib berbentuk gerund (-ing).",
          explanation:
            "Setelah preposisi “in”, ubah kata kerja “learn” menjadi gerund “learning”.",
        },
      },
      { text: " English by watching movies. If you keep " },
      {
        text: "practicing",
        spanId: "s2",
        structure: "Verb + Gerund",
        mutation: {
          id: "language-ff-keep",
          rule: "Verb + Gerund (keep + V-ing)",
          wrongText: "to practice",
          correction: "practicing",
          spokenSentence:
            "If you keep practicing every day, you will speak English fluently.",
          hint: "Kata kerja “keep” (terus melakukan) selalu diikuti oleh V-ing, bukan to + V1.",
          explanation:
            "Gunakan “keep practicing” karena setelah “keep” kata kerja harus berbentuk gerund (-ing).",
        },
      },
      { text: " every day, you will speak English " },
      {
        text: "fluently",
        spanId: "s3",
        structure: "Adverb of Manner",
        mutation: {
          id: "language-ff-fluently",
          rule: "Adverb (-ly) untuk menerangkan kata kerja",
          wrongText: "fluent",
          correction: "fluently",
          spokenSentence:
            "If you keep practicing every day, you will speak English fluently.",
          hint: "Kata ini menerangkan cara berbicara (“speak English ...”), sehingga membutuhkan adverb (-ly).",
          explanation:
            "Untuk menerangkan kata kerja “speak”, gunakan adverb “fluently” (bukan adjective “fluent”).",
        },
      },
      { text: " " },
      { text: "in the future", spanId: "s4", structure: "Time Phrase" },
      { text: "." },
    ]),
  );

  return pool;
}

export const ARTICLE_POOL = buildArticlePool();

export function createArticleDeck(
  filter: ArticleFilter,
  previousId?: string,
): ArticleQuestion[] {
  const filtered = ARTICLE_POOL.filter((q) => {
    const modeOk =
      filter.mode === "all" ||
      (filter.mode === "breakdown" && q.kind === "breakdown") ||
      (filter.mode === "findFix" && q.kind === "findFix");
    const articleOk =
      filter.articleId === "all" || q.articleId === filter.articleId;
    return modeOk && articleOk;
  });

  // Randomize tagBank order on every deck cycle so button positions cannot be memorized
  const deck = shuffleArray(filtered).map((q) =>
    q.kind === "breakdown"
      ? { ...q, tagBank: shuffleArray(q.tagBank) }
      : q,
  );

  if (deck.length > 1 && deck[0].id === previousId) {
    [deck[0], deck[1]] = [deck[1], deck[0]];
  }
  return deck;
}

export function checkParagraphBreakdown(
  q: BreakdownQuestion,
  selections: Record<string, readonly string[]>,
): ParagraphBreakdownResult {
  const perSentence: Record<string, SentenceBreakdownCheck> = {};
  let anyIncomplete = false;
  let firstErrorMessage = "";

  q.sentences.forEach((sentence, idx) => {
    const chosen = selections[sentence.id] ?? [];
    const missingCount = Math.max(
      0,
      sentence.expectedTags.length - chosen.length,
    );
    if (missingCount > 0) {
      anyIncomplete = true;
    }

    const wrongTags = chosen.filter(
      (tag) => !sentence.expectedTags.includes(tag),
    );
    const correct =
      missingCount === 0 &&
      wrongTags.length === 0 &&
      chosen.length === sentence.expectedTags.length;

    let hint = "";
    if (!correct) {
      for (const wrong of wrongTags) {
        if (sentence.trapHints?.[wrong]) {
          hint = sentence.trapHints[wrong];
          break;
        }
      }
      if (!hint && wrongTags.length > 0) {
        hint = `Kalimat ${idx + 1}: struktur “${wrongTags[0]}” belum tepat untuk kalimat ini.`;
      } else if (!hint && missingCount > 0) {
        hint = `Kalimat ${idx + 1}: masih kurang ${missingCount} tag struktur.`;
      }
      if (!firstErrorMessage && hint) {
        firstErrorMessage = hint;
      }
    }

    perSentence[sentence.id] = {
      correct,
      missingCount,
      wrongTags,
      hint,
    };
  });

  if (anyIncomplete) {
    return {
      status: "incomplete",
      perSentence,
      message:
        "Lengkapi semua slot struktur pada setiap kalimat terlebih dahulu.",
    };
  }

  const allCorrect = Object.values(perSentence).every((r) => r.correct);
  if (allCorrect) {
    return {
      status: "correct",
      perSentence,
      message: "Semua kalimat berhasil dibedah dengan tepat!",
    };
  }

  return {
    status: "incorrect",
    perSentence,
    message: firstErrorMessage || q.hint,
  };
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

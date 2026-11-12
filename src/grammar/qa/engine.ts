export type QATense =
  | "presentSimple"
  | "presentContinuous"
  | "pastSimple"
  | "presentPerfect"
  | "futureSimple"
  | "modal"
  | "nominal";

export type Intent =
  | "yesNo"
  | "where"
  | "when"
  | "why"
  | "what"
  | "who"
  | "how"
  | "howLong"
  | "howOften";

export const INTENT_LABELS: Record<Intent, string> = {
  yesNo: "Ya / tidak",
  where: "Tempat",
  when: "Waktu",
  why: "Alasan / tujuan",
  what: "Hal / objek",
  who: "Orang",
  how: "Cara / transportasi",
  howLong: "Durasi (for / since)",
  howOften: "Frekuensi",
};

export const QA_TENSE_LABELS: Record<QATense, string> = {
  presentSimple: "Present Simple",
  presentContinuous: "Present Continuous",
  pastSimple: "Past Simple",
  presentPerfect: "Present Perfect",
  futureSimple: "Future Simple (will)",
  modal: "Modal (can / should)",
  nominal: "Nominal (to be)",
};

export interface QAQuestion {
  id: string;
  tense: QATense;
  intent: Intent;
  question: string;
  replySubject: string;
  prefix: string;
  /** Optional alternate prefixes (e.g. mid-position frequency adverbs or modal choices). */
  altPrefixes?: string[];
  auxiliary: string;
  base: string;
  past: string;
  participle: string;
  ing: string;
  third: string;
  sample: string;
  cue: string;
  explanation: string;
}

export interface QAFilter {
  tense: QATense | "all";
  intent: Intent | "all";
}

export type Verdict = "pass" | "fail" | "unknown";

export interface QAResult {
  status: "correct" | "incorrect" | "partial" | "empty";
  grammar: Verdict;
  response: Verdict;
  message: string;
}

const SUBJECTS = [
  { ask: "you", reply: "I", askThird: false, replyThird: false, askBe: "are", replyBe: "am", askPastBe: "were", replyPastBe: "was" },
  { ask: "I", reply: "you", askThird: false, replyThird: false, askBe: "am", replyBe: "are", askPastBe: "was", replyPastBe: "were" },
  { ask: "she", reply: "she", askThird: true, replyThird: true, askBe: "is", replyBe: "is", askPastBe: "was", replyPastBe: "was" },
  { ask: "he", reply: "he", askThird: true, replyThird: true, askBe: "is", replyBe: "is", askPastBe: "was", replyPastBe: "was" },
  { ask: "they", reply: "they", askThird: false, replyThird: false, askBe: "are", replyBe: "are", askPastBe: "were", replyPastBe: "were" },
];

const VERBS = {
  work: { base: "work", third: "works", past: "worked", participle: "worked", ing: "working" },
  study: { base: "study", third: "studies", past: "studied", participle: "studied", ing: "studying" },
  travel: { base: "travel", third: "travels", past: "travelled", participle: "travelled", ing: "travelling" },
  live: { base: "live", third: "lives", past: "lived", participle: "lived", ing: "living" },
  exercise: { base: "exercise", third: "exercises", past: "exercised", participle: "exercised", ing: "exercising" },
};

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

function whLabel(intent: Intent): string {
  if (intent === "yesNo") return "";
  if (intent === "howLong") return "how long ";
  if (intent === "howOften") return "how often ";
  return `${intent} `;
}

export function createQAPool(): QAQuestion[] {
  const pool: QAQuestion[] = [];
  const verbalTenses: Array<Exclude<QATense, "nominal">> = [
    "presentSimple",
    "presentContinuous",
    "pastSimple",
    "presentPerfect",
    "futureSimple",
    "modal",
  ];

  for (const tense of verbalTenses) {
    for (const intent of Object.keys(INTENT_LABELS) as Intent[]) {
      // Skip unnatural tense + wh combinations (e.g. "When have you worked?").
      if (tense === "presentPerfect" && intent === "when") continue;
      if (tense === "presentContinuous" && (intent === "howLong" || intent === "howOften")) continue;

      for (const s of SUBJECTS) {
        const verb =
          intent === "how"
            ? VERBS.travel
            : intent === "what"
              ? VERBS.study
              : intent === "howLong" && tense === "presentPerfect"
                ? VERBS.live
                : intent === "howOften"
                  ? VERBS.exercise
                  : VERBS.work;

        const modalWord = intent === "why" || intent === "what" || intent === "howOften" ? "should" : "can";
        const aux =
          tense === "pastSimple"
            ? "did"
            : tense === "presentContinuous"
              ? s.askBe
              : tense === "presentPerfect"
                ? s.askThird ? "has" : "have"
                : tense === "futureSimple"
                  ? "will"
                  : tense === "modal"
                    ? modalWord
                    : s.askThird
                      ? "does"
                      : "do";

        const answerAux =
          tense === "presentContinuous"
            ? s.replyBe
            : tense === "pastSimple"
              ? "did"
              : tense === "presentPerfect"
                ? s.replyThird ? "has" : "have"
                : tense === "futureSimple"
                  ? "will"
                  : tense === "modal"
                    ? modalWord
                    : s.replyThird
                      ? "does"
                      : "do";

        const main =
          tense === "presentContinuous"
            ? verb.ing
            : tense === "presentPerfect"
              ? verb.participle
              : verb.base;

        const verbAnswer =
          tense === "pastSimple"
            ? verb.past
            : tense === "presentContinuous"
              ? `${s.replyBe} ${verb.ing}`
              : tense === "presentPerfect"
                ? `${answerAux} ${verb.participle}`
                : tense === "futureSimple"
                  ? `will ${verb.base}`
                  : tense === "modal"
                    ? `${modalWord} ${verb.base}`
                    : s.replyThird
                      ? verb.third
                      : verb.base;

        const wh = whLabel(intent);
        const suffix =
          intent === "who"
            ? " with"
            : intent === "yesNo"
              ? " here"
              : intent === "howLong" && verb.base === "live"
                ? " here"
                : "";

        const prefixSuffix =
          intent === "who"
            ? " with"
            : intent === "howLong" && verb.base === "live"
              ? " here"
              : "";

        const prefix = `${capitalize(s.reply)} ${verbAnswer}${prefixSuffix}`;
        const midAdverbs = ["always", "usually", "often", "sometimes", "rarely", "seldom", "never"];
        const altPrefixes =
          intent === "howOften"
            ? midAdverbs.map((adv) =>
                tense === "modal"
                  ? `${capitalize(s.reply)} ${modalWord} ${adv} ${verb.base}`
                  : `${capitalize(s.reply)} ${adv} ${verbAnswer}`,
              )
            : undefined;

        const tail =
          intent === "where"
            ? "at a hospital"
            : intent === "when"
              ? tense === "pastSimple"
                ? "yesterday"
                : tense === "presentContinuous"
                  ? "this afternoon"
                  : tense === "futureSimple" || tense === "modal"
                    ? "tomorrow"
                    : "every morning"
              : intent === "why"
                ? tense === "pastSimple"
                  ? "because the team needed help"
                  : "because the team needs help"
                : intent === "what"
                  ? "English"
                  : intent === "who"
                    ? "my sister"
                    : intent === "how"
                      ? "by bus"
                      : intent === "howLong"
                        ? "for two years"
                        : "three times a week";

        const yesSample = `Yes, ${s.reply} ${answerAux}.`;
        const tenseRule =
          tense === "pastSimple"
            ? "Did + V1 menunjukkan past simple; jawaban positif lengkap memakai V2."
            : tense === "presentContinuous"
              ? "Am/is/are + V-ing menunjukkan kegiatan sedang berlangsung atau rencana terjadwal."
              : tense === "presentPerfect"
                ? "Have/has + V3 menghubungkan kejadian masa lalu dengan keadaan sekarang."
                : tense === "futureSimple"
                  ? "Will + V1 menyatakan rencana atau kejadian yang akan datang."
                  : tense === "modal"
                    ? `Modal ${modalWord} diikuti bentuk dasar V1 tanpa tambahan -s/-es atau to.`
                    : "Do/does + V1 membentuk pertanyaan present simple.";

        pool.push({
          id: `${tense}-${intent}-${s.ask}`,
          tense,
          intent,
          question: capitalize(`${wh}${aux} ${s.ask} ${main}${suffix}?`),
          replySubject: s.reply,
          prefix,
          altPrefixes,
          auxiliary: answerAux,
          ...verb,
          sample: intent === "yesNo" ? yesSample : `${prefix} ${tail}.`,
          cue:
            intent === "yesNo"
              ? "Jawab singkat (Yes / No + subjek + kata bantu) atau kalimat lengkap."
              : `Jawab lengkap memakai kata kerja ${verb.base} (${INTENT_LABELS[intent].toLowerCase()} bebas).`,
          explanation: `${intent === "yesNo" ? "Pertanyaan ini meminta jawaban ya/tidak" : `${capitalize(wh.trim())} meminta ${INTENT_LABELS[intent].toLowerCase()}`}. ${tenseRule} ${s.ask === "you" ? "You dalam pertanyaan menjadi I dalam jawaban." : s.ask === "I" ? "I dalam pertanyaan menjadi you dalam jawaban." : `Jawaban tetap memakai subjek ${s.reply}.`}`,
        });
      }
    }
  }

  // Nominal (to be) questions across present & past
  const nominalIntents: Array<{
    intent: Intent;
    past: boolean;
    complementQ: string;
    complementPrefix: string;
    tail: string;
  }> = [
    { intent: "yesNo", past: false, complementQ: " ready", complementPrefix: "ready", tail: "" },
    { intent: "where", past: true, complementQ: "", complementPrefix: "", tail: "at home" },
    { intent: "why", past: false, complementQ: " late", complementPrefix: "late", tail: "because the bus was late" },
    { intent: "who", past: true, complementQ: " with", complementPrefix: "with", tail: "my family" },
    { intent: "howLong", past: true, complementQ: " there", complementPrefix: "there", tail: "for two hours" },
  ];

  for (const item of nominalIntents) {
    for (const s of SUBJECTS) {
      const askBe = item.past ? s.askPastBe : s.askBe;
      const replyBe = item.past ? s.replyPastBe : s.replyBe;
      const wh = whLabel(item.intent);
      const prefix = item.complementPrefix
        ? `${capitalize(s.reply)} ${replyBe} ${item.complementPrefix}`
        : `${capitalize(s.reply)} ${replyBe}`;
      pool.push({
        id: `nominal-${item.intent}-${s.ask}`,
        tense: "nominal",
        intent: item.intent,
        question: capitalize(`${wh}${askBe} ${s.ask}${item.complementQ}?`),
        replySubject: s.reply,
        prefix,
        auxiliary: replyBe,
        base: "be",
        third: s.replyBe,
        past: s.replyPastBe,
        participle: "been",
        ing: "being",
        sample: item.intent === "yesNo" ? `Yes, ${s.reply} ${replyBe}.` : `${prefix} ${item.tail}.`,
        cue:
          item.intent === "yesNo"
            ? "Jawab singkat dengan to be (Yes, S + am/is/are/was/were / No, … not)."
            : `Jawab lengkap memakai to be (${replyBe}) sesuai subjek.`,
        explanation: `Pertanyaan nominal ini memakai to be (${askBe} → ${replyBe}), bukan do/does/did. ${s.ask === "you" ? "You menjadi I dalam jawaban." : s.ask === "I" ? "I menjadi you dalam jawaban." : `Subjek tetap ${s.reply}.`}`,
      });
    }
  }

  return pool;
}

export const QA_POOL = createQAPool();

export function qaDeck(filter: QAFilter, previousId?: string): QAQuestion[] {
  const deck = QA_POOL.filter(
    (q) =>
      (filter.tense === "all" || filter.tense === q.tense) &&
      (filter.intent === "all" || filter.intent === q.intent),
  );
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  if (deck.length > 1 && deck[0].id === previousId) [deck[0], deck[1]] = [deck[1], deck[0]];
  return deck;
}

export function normalizeQA(raw: string, tense?: QATense): string {
  const sExpansion = tense === "presentPerfect" ? "$1 has" : "$1 is";
  return raw
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(
      /\b(don't|doesn't|didn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|won't|can't|cannot|shouldn't)\b/g,
      (word) =>
        ({
          "don't": "do not",
          "doesn't": "does not",
          "didn't": "did not",
          "isn't": "is not",
          "aren't": "are not",
          "wasn't": "was not",
          "weren't": "were not",
          "haven't": "have not",
          "hasn't": "has not",
          "hadn't": "had not",
          "won't": "will not",
          "can't": "can not",
          cannot: "can not",
          "shouldn't": "should not",
        })[word]!,
    )
    .replace(/\bi'm\b/g, "i am")
    .replace(/\b(you|we|they)'re\b/g, "$1 are")
    .replace(/\b(i|you|we|they)'ve\b/g, "$1 have")
    .replace(/\b(i|you|we|they|he|she|it)'ll\b/g, "$1 will")
    .replace(/\b(he|she|it)'s\b/g, sExpansion)
    .replace(/\btraveled\b/g, "travelled")
    .replace(/\btraveling\b/g, "travelling")
    .replace(/[.,!?;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Recognized phrase families for conservative rule-based checking.
const places =
  "hospital|restaurant|school|office|library|university|factory|shop|store|bank|hotel|cafe|café|park|museum|airport|station";
const cities =
  "jakarta|bandung|surabaya|london|paris|tokyo|bali|indonesia|japan|france|singapore|australia";
const knownPlace = new RegExp(
  `^(?:(?:at|in) (?:the (?:${places})|a (?:hospital|restaurant|school|library|university|factory|shop|store|bank|hotel|cafe|café|park|museum|station))|(?:at|in) an (?:office|airport)|in (?:${cities})|at (?:home|school|work|university)|(?:here|there|abroad))$`,
);
const days = "monday|tuesday|wednesday|thursday|friday|saturday|sunday";
const knownTime = new RegExp(
  `^(?:yesterday(?: (?:morning|afternoon|evening))?|today|tomorrow|tonight|now|right now|every (?:day|morning|afternoon|evening|night|week|${days})|(?:this|last|next) (?:week|month|year|morning|afternoon|evening)|on (?:${days})(?:s)?|in (?:the (?:morning|afternoon|evening)|january|february|march|april|may|june|july|august|september|october|november|december|[12][0-9]{3})|at (?:night|noon|midnight|(?:[1-9]|1[0-2])(?::[0-5][0-9])?(?: (?:am|pm|a m|p m|o'clock))?))$`,
);
const knownPerson =
  /^(?:(?:my|his|her|our|their|your) (?:sister|brother|mother|father|parent|parents|family|friend|friends|colleague|colleagues|teacher|team|boss|manager|partner)|(?:a|the) (?:teacher|friend|colleague|manager|doctor)|him|her|them|you|maya|rina|alex)$/;
const knownObject =
  /^(?:english|indonesian|japanese|spanish|french|korean|mandarin|arabic|german|mathematics|math|maths|science|history|biology|physics|chemistry|computer science|coding|programming|grammar|medicine|art|music|economics|law|business|design)$/;
const knownMethod =
  /^(?:by (?:bus|train|car|plane|boat|ship|bicycle|bike|motorcycle|motorbike|scooter|taxi|subway|mrt)|on foot)$/;
const knownReason =
  /^(?:because (?:the team (?:needs|needed) help|the bus (?:is|was) late|traffic (?:is|was) bad|(?:i|you|we|they) (?:need|needed|want|wanted) (?:money|experience|a job|to learn)|(?:he|she) (?:needs|needed|wants|wanted) (?:money|experience|a job|to learn)|(?:i|you|we|they) (?:like|liked|love|loved) (?:it|the job)|(?:he|she) (?:likes|liked|loves|loved) (?:it|the job)|(?:i am|you are|we are|they are|he is|she is|i was|he was|she was|you were|we were|they were) (?:busy|happy|tired))|to (?:get a (?:job|better job)|earn money|help the team|learn (?:english|new skills)|improve (?:my|our|his|her|their) skills|stay healthy))$/;
const numberWords = "one|two|three|four|five|six|seven|eight|nine|ten|several|many|a few|a couple of";
const durationUnits = "minutes|hours|days|weeks|months|years";
const knownDuration = new RegExp(
  `^(?:for (?:(?:${numberWords}|[1-9][0-9]*) (?:${durationUnits})|a (?:long time|short time|week|month|year|day|hour)|an hour)|since (?:yesterday|last (?:night|week|month|year)|(?:${days})|january|february|march|april|may|june|july|august|september|october|november|december|[12][0-9]{3}|morning|(?:[1-9]|1[0-2]) (?:am|pm|o'clock))|all (?:day|morning|afternoon|week|year))$`,
);
const knownFrequency = new RegExp(
  `^(?:(?:once|twice|(?:${numberWords}|[1-9]) times) a (?:day|week|month|year)|every (?:day|morning|afternoon|evening|night|week|month|year|weekend|${days})|on weekends)$`,
);

function informationType(tail: string, preferred?: Intent): Intent | undefined {
  if (preferred === "howOften" && knownFrequency.test(tail)) return "howOften";
  if (preferred === "howLong" && knownDuration.test(tail)) return "howLong";
  if (knownPlace.test(tail)) return "where";
  if (knownTime.test(tail)) return "when";
  if (knownDuration.test(tail)) return "howLong";
  if (knownFrequency.test(tail)) return "howOften";
  if (knownPerson.test(tail)) return "who";
  if (knownObject.test(tail)) return "what";
  if (knownMethod.test(tail)) return "how";
  if (knownReason.test(tail)) return "why";
  return undefined;
}

const result = (
  status: QAResult["status"],
  grammar: Verdict,
  response: Verdict,
  message: string,
): QAResult => ({ status, grammar, response, message });

export function checkQA(q: QAQuestion, raw: string): QAResult {
  const text = normalizeQA(raw, q.tense);
  if (!text) return result("empty", "unknown", "unknown", "Ketik jawaban terlebih dahulu.");
  const subject = q.replySubject.toLowerCase();

  if (q.intent === "yesNo") {
    if (
      /^yes[,\s]+(?:i[’']m|(?:you|we|they)[’'](?:re|ve|ll)|(?:he|she|it)[’'](?:s|ll))[.!?\s]*$/i.test(
        raw.trim(),
      )
    ) {
      return result(
        "incorrect",
        "fail",
        "pass",
        "Pada jawaban singkat positif, kata bantu di akhir tidak disingkat: Yes, I am / Yes, she is / Yes, I have.",
      );
    }
    const yes = `yes ${subject} ${q.auxiliary}`;
    const no = `no ${subject} ${q.auxiliary} not`;
    const fullYes = `yes ${normalizeQA(q.prefix, q.tense)} here`;
    const fullNo = `no ${subject} ${q.auxiliary} not ${q.base} here`;
    if (text === yes || text === no || text === fullYes || text === fullNo) {
      return result(
        "correct",
        "pass",
        "pass",
        `Jawaban sesuai. Gunakan ${q.auxiliary} dengan ${q.replySubject}; jawaban No menambahkan not.`,
      );
    }
    if (!/^(yes|no)\b/.test(text)) {
      return result(
        "partial",
        "unknown",
        "unknown",
        "Awali jawaban dengan Yes atau No diikuti subjek + kata bantu.",
      );
    }
    if (text === `yes ${subject} ${q.auxiliary} not` || text === `no ${subject} ${q.auxiliary}`) {
      return result(
        "incorrect",
        "fail",
        "fail",
        "Yes perlu jawaban positif; No perlu jawaban negatif dengan not.",
      );
    }
    if (text.split(" ").length > 6) {
      return result(
        "partial",
        "unknown",
        "unknown",
        "Jawaban lebih panjang dari pola singkat yang didukung. Coba Yes/No + subjek + kata bantu.",
      );
    }
    return result(
      "incorrect",
      "fail",
      "unknown",
      `Periksa sudut pandang dan kata bantu: gunakan ${q.replySubject} + ${q.auxiliary}${text.startsWith("no") ? " + not" : ""}.`,
    );
  }

  if (/^(yes|no)\b/.test(text)) {
    return result(
      "incorrect",
      "unknown",
      "fail",
      `Pertanyaan ini meminta ${INTENT_LABELS[q.intent].toLowerCase()}, bukan ya/tidak.`,
    );
  }

  const prefix = normalizeQA(q.prefix, q.tense);
  const altPrefixes = (q.altPrefixes ?? []).map((p) => normalizeQA(p, q.tense));

  // Mid-position frequency adverb support for How often ("I always exercise.", "She usually exercises every morning.")
  if (q.intent === "howOften") {
    const matchedAlt = altPrefixes.find((alt) => text === alt || text.startsWith(`${alt} `));
    if (matchedAlt) {
      const rest = text.slice(matchedAlt.length).trim();
      if (!rest || rest === "here" || knownFrequency.test(rest) || knownTime.test(rest)) {
        return result(
          "correct",
          "pass",
          "pass",
          "Pola kalimat dan keterangan frekuensi di tengah kalimat sudah tepat.",
        );
      }
    }
  }

  if (!text.startsWith(`${prefix} `)) {
    if (text === prefix) {
      return result(
        "incorrect",
        "pass",
        "fail",
        `Pola utama sudah sesuai, tetapi tambahkan ${INTENT_LABELS[q.intent].toLowerCase()} untuk menjawab pertanyaan.`,
      );
    }
    if (informationType(text, q.intent) === q.intent) {
      return result(
        "partial",
        "unknown",
        "pass",
        "Informasinya sesuai dan jawaban pendek ini alami dalam percakapan. Untuk latihan kalimat lengkap, tambahkan subjek dan kata kerja.",
      );
    }
    const words = text.split(" ");
    if (words[0] !== subject) {
      return result(
        "partial",
        "unknown",
        "unknown",
        `Latihan ini memakai sudut pandang ${q.replySubject}. Periksa siapa yang sedang dibicarakan.`,
      );
    }
    if (words[1] === "did" && [q.past, q.ing, q.third].includes(words[2])) {
      return result(
        "incorrect",
        "fail",
        "unknown",
        `Setelah did, gunakan bentuk dasar ${q.base}, bukan ${words[2]}. Untuk jawaban positif biasa, gunakan ${q.prefix}.`,
      );
    }
    if ((words[1] === "will" || words[1] === "can" || words[1] === "should") && [q.past, q.ing, q.third, "to"].includes(words[2])) {
      return result(
        "incorrect",
        "fail",
        "unknown",
        `Setelah ${words[1]}, gunakan bentuk dasar V1 (${q.base}) tanpa to, -s, atau -ing.`,
      );
    }
    if ((words[1] === "have" || words[1] === "has") && [q.base, q.ing, q.third].includes(words[2]) && words[2] !== q.participle) {
      return result(
        "incorrect",
        "fail",
        "unknown",
        `Pada Present Perfect, setelah ${words[1]} gunakan V3 (${q.participle}).`,
      );
    }
    const recognizedVerb = [
      q.base,
      q.past,
      q.participle,
      q.ing,
      q.third,
      "am",
      "is",
      "are",
      "was",
      "were",
      "do",
      "does",
      "did",
      "have",
      "has",
      "will",
      "can",
      "should",
    ].includes(words[1]);

    if (
      /\bnot\b/.test(text) ||
      (words[1] === "did" && words[2] === q.base) ||
      (["do", "does"].includes(words[1]) && words[2] === q.base)
    ) {
      return result(
        "partial",
        "unknown",
        "unknown",
        "Bentuk negatif atau penekanan ini berada di luar pola jawaban positif latihan ini. Belum dinilai sebagai salah.",
      );
    }
    if (recognizedVerb) {
      return result(
        "incorrect",
        "fail",
        "unknown",
        `Bentuk kata kerja/bantu belum sesuai dengan subjek atau waktu pertanyaan. Gunakan pola “${q.prefix} …”. ${q.explanation}`,
      );
    }
    return result(
      "partial",
      "unknown",
      "unknown",
      "Susunan ini belum dikenali. Gunakan kata kerja pada pertanyaan dan kalimat positif lengkap.",
    );
  }

  const tail = text.slice(prefix.length + 1);

  // Specific grammar check for How long: for vs since mix-ups
  if (q.intent === "howLong") {
    if (
      /^for (?:yesterday|last (?:night|week|month|year)|monday|tuesday|wednesday|thursday|friday|saturday|sunday|[12][0-9]{3}|morning)$/.test(
        tail,
      )
    ) {
      return result(
        "incorrect",
        "fail",
        "fail",
        "Gunakan “since” untuk titik awal waktu (seperti yesterday / Monday / 2020), sedangkan “for” dipakai untuk durasi waktu.",
      );
    }
    if (
      new RegExp(
        `^since (?:(?:${numberWords}|[1-9][0-9]*) (?:${durationUnits})|a (?:long time|week|month|year|day|hour)|an hour)$`,
      ).test(tail)
    ) {
      return result(
        "incorrect",
        "fail",
        "fail",
        "Gunakan “for” untuk durasi/lamanya waktu (seperti two hours / three years), sedangkan “since” dipakai untuk titik awal waktu.",
      );
    }
  }

  const kind = informationType(tail, q.intent);
  if (kind && kind !== q.intent) {
    return result(
      "incorrect",
      "pass",
      "fail",
      `Pola utama sudah sesuai, tetapi bagian akhir menyebut ${INTENT_LABELS[kind].toLowerCase()}. Pertanyaan ini meminta ${INTENT_LABELS[q.intent].toLowerCase()}.`,
    );
  }
  if (kind === q.intent) {
    const pastTime = /^(?:yesterday|last\b)/.test(tail);
    const futureTime = /^(?:tomorrow|next\b)/.test(tail);
    if (
      q.intent === "when" &&
      ((q.tense !== "pastSimple" && q.tense !== "nominal" && pastTime) ||
        (q.tense === "pastSimple" && (futureTime || /^(?:now|right now)$/.test(tail))) ||
        (q.tense === "futureSimple" && (pastTime || /^every\b/.test(tail))))
    ) {
      return result(
        "incorrect",
        "pass",
        "fail",
        "Pola utama benar, tetapi keterangan waktunya tidak cocok dengan waktu yang ditanyakan.",
      );
    }
    return result(
      "correct",
      "pass",
      "pass",
      `Pola utama dan ${INTENT_LABELS[q.intent].toLowerCase()} sesuai.`,
    );
  }
  if (
    q.intent === "where" &&
    /^(?:at|in|on) (?:a |an |the )?(?:happy|sad|busy|tired|yesterday|tomorrow)$/.test(tail)
  ) {
    return result(
      "incorrect",
      "pass",
      "fail",
      "Pola utama sesuai, tetapi kata setelah preposisi itu bukan keterangan tempat yang tepat.",
    );
  }
  if (q.intent === "where" && /^(?:at|in) (?:a|an)\b/.test(tail)) {
    const article = tail.split(" ")[1];
    const noun = tail.split(" ").slice(2).join(" ");
    if (
      (article === "a" && /^(office|airport)$/.test(noun)) ||
      (article === "an" && new RegExp(`^(?:${places})$`).test(noun) && !/^(office|airport)$/.test(noun))
    ) {
      return result(
        "incorrect",
        "pass",
        "fail",
        "Pola utama sesuai. Periksa a/an pada tempat: an office/an airport, tetapi a hospital/a restaurant.",
      );
    }
  }
  const plausible =
    (q.intent === "why" && (tail.startsWith("because ") || tail.startsWith("to "))) ||
    (q.intent === "where" && /^(?:at|in|on|near|inside|outside)\s/.test(tail)) ||
    (q.intent === "howLong" && /^(?:for|since)\s/.test(tail));
  return result(
    "partial",
    "pass",
    "unknown",
    `Pola utama sudah sesuai${plausible ? " dan bagian akhir tampak menuju jenis informasi yang diminta" : ""}. Keterangan “${tail}” belum dapat diverifikasi oleh pemeriksa ini; jawabanmu tidak otomatis salah.`,
  );
}

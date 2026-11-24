import { checkAnswer } from "./check";
import { effectiveTense } from "./explanations";
import type { Question, Tense } from "./types";

const SUBJECTS_ID: Record<string, string> = {
  I: "saya", you: "kamu", we: "kita", they: "mereka",
  he: "dia laki-laki", she: "dia perempuan", it: "benda itu",
  "a pilot": "seorang pilot", "the teacher": "guru itu", "my brother": "saudara laki-laki saya",
  "the engineer": "insinyur itu", "the dog": "anjing itu", "the students": "para siswa itu",
  "the children": "anak-anak itu", "my parents": "orang tua saya", "the workers": "para pekerja itu",
  Emma: "Emma", James: "James", Olivia: "Olivia", Daniel: "Daniel",
  "Emma and James": "Emma dan James", "Olivia and Daniel": "Olivia dan Daniel",
  "James and Olivia": "James dan Olivia", "the boy with two dogs": "anak laki-laki dengan dua anjing itu",
  "the teacher near the windows": "guru di dekat jendela-jendela itu",
  "the girl with the red bag": "anak perempuan dengan tas merah itu",
  "the students in this class": "para siswa di kelas ini", "the children near the door": "anak-anak di dekat pintu itu",
  "the workers in the office": "para pekerja di kantor itu", "the phone": "ponsel itu",
  "the computer": "komputer itu", "the machines": "mesin-mesin itu",
};

// Active and passive meanings are explicit because Indonesian affixes vary.
const VERBS_ID: Record<string, [string, string]> = {
  work: ["bekerja", ""], play: ["bermain", "dimainkan"], study: ["mempelajari", "dipelajari"],
  watch: ["menonton", "ditonton"], clean: ["membersihkan", "dibersihkan"], cook: ["memasak", "dimasak"],
  open: ["membuka", "dibuka"], close: ["menutup", "ditutup"], call: ["menelepon", "ditelepon"],
  help: ["membantu", "dibantu"], finish: ["menyelesaikan", "diselesaikan"], start: ["menyalakan", "dinyalakan"],
  paint: ["mengecat", "dicat"], repair: ["memperbaiki", "diperbaiki"], build: ["membangun", "dibangun"],
  write: ["menulis", "ditulis"], read: ["membaca", "dibaca"], eat: ["menyantap", "disantap"],
  drink: ["minum", "diminum"], make: ["membuat", "dibuat"], take: ["naik", ""],
  give: ["memberikan", "diberikan"], buy: ["membeli", "dibeli"], sell: ["menjual", "dijual"],
  send: ["mengirim", "dikirim"], bring: ["membawa", "dibawa"], teach: ["mengajarkan", "diajarkan"],
  catch: ["menangkap", "ditangkap"], throw: ["melempar", "dilempar"], kick: ["menendang", "ditendang"],
  drive: ["mengemudikan", "dikemudikan"], ride: ["mengendarai", ""], wash: ["mencuci", "dicuci"],
  fix: ["memperbaiki", "diperbaiki"], wear: ["memakai", ""], draw: ["menggambar", "digambar"],
  win: ["memenangkan", "dimenangkan"], lose: ["kalah dalam", "berakhir dengan kekalahan"],
  find: ["menemukan", "ditemukan"], meet: ["menemui", ""], visit: ["mengunjungi", "dikunjungi"],
  invite: ["mengundang", "diundang"], answer: ["menjawab", "dijawab"], ask: ["mengajukan", "diajukan"],
  carry: ["membawa", "dibawa"], choose: ["memilih", "dipilih"], cut: ["memotong", "dipotong"],
  explain: ["menjelaskan", "dijelaskan"], follow: ["mengikuti", "diikuti"], grow: ["menanam", "ditanam"],
  hold: ["memegang", "dipegang"], keep: ["menyimpan", "disimpan"], learn: ["mempelajari", "dipelajari"],
  leave: ["meninggalkan", ""], lead: ["memimpin", "dipimpin"], move: ["memindahkan", "dipindahkan"],
  pay: ["membayar", "dibayar"], plan: ["merencanakan", "direncanakan"], prepare: ["menyiapkan", "disiapkan"],
  produce: ["menghasilkan", "dihasilkan"], protect: ["melindungi", "dilindungi"], push: ["mendorong", "didorong"],
  pull: ["menarik", "ditarik"], raise: ["menggalang", "digalang"], return: ["mengembalikan", "dikembalikan"],
  save: ["menabung", "ditabung"], show: ["menampilkan", "ditampilkan"], sign: ["menandatangani", "ditandatangani"],
  solve: ["memecahkan", "dipecahkan"], speak: ["berbicara dalam", "digunakan untuk berbicara"],
  spend: ["menghabiskan", "dihabiskan"], develop: ["mengembangkan", "dikembangkan"],
  test: ["menguji", "diuji"], use: ["menggunakan", "digunakan"], wait: ["menunggu", ""],
  sleep: ["tidur", ""], run: ["berlari", ""], swim: ["berenang", ""],
  know: ["mengenal", ""], like: ["menyukai", ""],
};

const PHRASES_ID: Record<string, string> = {
  "": "", hard: "dengan giat", football: "sepak bola", English: "bahasa Inggris", "a movie": "sebuah film",
  "the room": "ruangan itu", dinner: "makan malam", "the door": "pintu itu", "the window": "jendela itu",
  "a friend": "seorang teman", "the children": "anak-anak itu", "the project": "proyek itu", "the car": "mobil itu",
  "the house": "rumah itu", "the road": "jalan itu", "a bridge": "sebuah jembatan", "a letter": "sepucuk surat",
  "a book": "sebuah buku", breakfast: "sarapan", coffee: "kopi", "a cake": "sebuah kue", "the bus": "bus itu",
  "a gift": "sebuah hadiah", "a car": "sebuah mobil", "the books": "buku-buku itu", "an email": "sebuah surel",
  "the documents": "dokumen-dokumen itu", mathematics: "matematika", "the ball": "bola itu",
  "a truck": "sebuah truk", "a bike": "sebuah sepeda", "the dishes": "piring-piring itu",
  "the computer": "komputer itu", "a jacket": "sebuah jaket", "a picture": "sebuah gambar", "the game": "permainan itu",
  "the match": "pertandingan itu", "the keys": "kunci-kunci itu", "the manager": "manajer itu",
  "the museum": "museum itu", "the guests": "para tamu itu", "the question": "pertanyaan itu",
  "a question": "sebuah pertanyaan", "the boxes": "kotak-kotak itu", "a color": "sebuah warna",
  "the paper": "kertas itu", "the lesson": "pelajaran itu", "the rules": "aturan-aturan itu",
  vegetables: "sayuran", "the bag": "tas itu", "a diary": "sebuah buku harian", "a language": "sebuah bahasa",
  "the team": "tim itu", "the furniture": "perabotan itu", "the bill": "tagihan itu", "the trip": "perjalanan itu",
  "the meal": "makanan itu", goods: "barang-barang", "the environment": "lingkungan itu",
  "the cart": "gerobak itu", "the rope": "tali itu", money: "uang", "the money": "uang itu",
  "the results": "hasil-hasil itu", "the contract": "kontrak itu", "the problem": "masalah itu",
  "the app": "aplikasi itu", "the software": "perangkat lunak itu", "a computer": "sebuah komputer",
  "for the bus": "bus itu", fast: "dengan cepat", well: "dengan baik", him: "dia laki-laki",
  smoothly: "dengan lancar", "a noise": "suara berisik", heat: "panas",
  "a doctor": "seorang dokter", doctors: "para dokter", "a teacher": "seorang guru", teachers: "para guru",
  "an engineer": "seorang insinyur", engineers: "para insinyur", "a student": "seorang siswa", students: "para siswa",
  "a good leader": "seorang pemimpin yang baik", "good leaders": "para pemimpin yang baik",
  careful: "hati-hati", rude: "kasar", noisy: "berisik", polite: "sopan", nice: "baik",
  silly: "konyol", ready: "siap", happy: "senang", tired: "lelah", busy: "sibuk", sick: "sakit",
  "at home": "di rumah", "in the office": "di kantor", here: "di sini",
};

const TIMES_ID: Record<string, string> = {
  "every day": "setiap hari", "every Sunday": "setiap hari Minggu", "on Mondays": "setiap hari Senin",
  usually: "biasanya", often: "sering", always: "selalu", "right now": "sekarang", "at the moment": "saat ini",
  today: "hari ini", already: "sudah", just: "baru saja", yet: "sampai sekarang", recently: "belakangan ini",
  "this week": "minggu ini", lately: "akhir-akhir ini", "for two weeks": "selama dua minggu",
  "for three days": "selama tiga hari", "since Monday": "sejak hari Senin", "since 2015": "sejak tahun 2015",
  "for two years": "selama dua tahun", "for two hours": "selama dua jam", "since 7 a.m.": "sejak pukul tujuh pagi",
  "all day": "sepanjang hari", yesterday: "kemarin", "last week": "minggu lalu", "two days ago": "dua hari lalu",
  "last year": "tahun lalu", "in 2020": "pada tahun 2020", "at 8 p.m. yesterday": "pukul delapan malam kemarin",
  "at that moment": "pada saat itu", "when I called": "ketika saya menelepon", "before she arrived": "sebelum dia perempuan tiba",
  "before the meeting": "sebelum rapat", "by then": "hingga saat itu", "for a year": "selama setahun",
  "before the test started": "sebelum ujian dimulai", "for a week": "selama seminggu",
  "before she moved": "sebelum dia perempuan pindah", "all morning": "sepanjang pagi",
  "before the bus arrived": "sebelum bus tiba", "before the lights went out": "sebelum lampu-lampu padam",
  tomorrow: "besok", "next week": "minggu depan", soon: "segera", "next year": "tahun depan", "one day": "suatu hari nanti",
  "at 8 p.m. tomorrow": "pukul delapan malam besok", "this time next week": "pada waktu yang sama minggu depan",
  "tomorrow morning": "besok pagi", "by 9 p.m.": "hingga pukul sembilan malam",
  "by next year": "hingga tahun depan", "by tomorrow": "hingga besok", "by December": "hingga bulan Desember",
  "for a week by Friday": "selama seminggu hingga hari Jumat", "by 2030": "hingga tahun 2030",
  "for five years by 2030": "selama lima tahun hingga tahun 2030",
  "for ten years by 2028": "selama sepuluh tahun hingga tahun 2028",
  "for three hours by 5 p.m.": "selama tiga jam hingga pukul lima sore", "by 2028": "hingga tahun 2028",
  "by 5 p.m.": "hingga pukul lima sore", "for years": "selama bertahun-tahun",
  "for five years by next month": "selama lima tahun hingga bulan depan",
};

const ASPECT_ID: Record<Tense, [string, string]> = {
  presentSimple: ["", "tidak"], pastSimple: ["", "tidak"], futureSimple: ["akan", "tidak akan"],
  presentContinuous: ["sedang", "tidak sedang"], pastContinuous: ["sedang", "tidak sedang"],
  futureContinuous: ["akan sedang", "tidak akan sedang"], presentPerfect: ["sudah", "belum"],
  pastPerfect: ["sudah", "belum"], futurePerfect: ["akan sudah", "masih belum"],
  presentPerfectContinuous: ["sudah terus", "tidak terus"],
  pastPerfectContinuous: ["sudah terus", "tidak terus"], futurePerfectContinuous: ["akan terus", "tidak akan terus"],
};

const CONTEXT_ID: Record<Tense, string> = {
  presentSimple: "Kebiasaan atau keadaan umum pada masa sekarang.",
  pastSimple: "Kejadian atau keadaan pada masa yang sudah berlalu.",
  futureSimple: "Rencana, keputusan, atau kemungkinan di masa depan.",
  presentContinuous: "Situasi saat proses berlangsung sekarang.",
  pastContinuous: "Situasi pada suatu momen tertentu di masa lalu.",
  futureContinuous: "Situasi pada suatu momen tertentu di masa depan.",
  presentPerfect: "Hubungan kejadian sebelumnya dengan keadaan sekarang.",
  pastPerfect: "Urutan kejadian sebelum waktu atau kejadian lain di masa lalu.",
  futurePerfect: "Hasil atau keadaan sebelum batas waktu di masa depan.",
  presentPerfectContinuous: "Durasi proses hingga sekarang.",
  pastPerfectContinuous: "Durasi proses hingga suatu patokan di masa lalu.",
  futurePerfectContinuous: "Akumulasi durasi proses hingga suatu patokan di masa depan.",
};

export function sentenceTranslation(q: Question): {text: string; context: string} | null {
  const tense = effectiveTense(q);
  const negative = q.form === "negative";
  let marker = ASPECT_ID[tense][negative ? 1 : 0];
  const subject = q.mode === "passive" ? PHRASES_ID[q.verb!.object] : SUBJECTS_ID[q.subject.text];
  let predicate: string | undefined;
  let object = "";
  if (q.mode === "nominal") {
    const comp = q.complement!;
    predicate = PHRASES_ID[q.subject.number === "plural" && comp.kind === "noun" ? comp.plural! : comp.text];
    if (tense.endsWith("Continuous")) predicate = predicate === undefined ? undefined : `bersikap ${predicate}`;
    if (q.whWord && ["What", "Where", "How"].includes(q.whWord)) predicate = "";
    if (negative && comp.kind === "noun" && tense.endsWith("Simple")) marker = tense === "futureSimple" ? "tidak akan menjadi" : "bukan";
    if (!negative && tense === "futureSimple" && comp.kind === "noun") marker = "akan menjadi";
  } else {
    predicate = VERBS_ID[q.verb!.base]?.[q.mode === "passive" ? 1 : 0];
    if (q.subject.entity === "thing" && q.verb!.base === "run") predicate = "beroperasi";
    object = q.mode === "passive"
      ? `${q.verb!.base === "lose" ? "bagi" : "oleh"} ${SUBJECTS_ID[q.subject.text] ?? ""}`
      : PHRASES_ID[q.verb!.object];
    if (q.whWord === "What" && q.mode === "verbal" || q.whWord === "How" && ["fast", "well", "hard", "smoothly"].includes(q.verb!.object)) object = "";
  }
  if (subject === undefined || predicate === undefined || object === undefined) return null;
  const time = q.timeSignal ? TIMES_ID[q.timeSignal] : "";
  if (time === undefined) return null;
  let adjunct = time;
  if (q.timeSignal === "already") adjunct = "";
  if (q.timeSignal === "just") { marker = negative ? "belum" : "baru saja"; adjunct = ""; }
  if (["usually", "often", "always"].includes(q.timeSignal ?? "")) {
    marker = [time, marker].filter(Boolean).join(" ");
    adjunct = "";
  }
  const wh = {What: "Apa", Where: "Di mana", When: "Kapan", Why: "Mengapa", How: "Bagaimana",
    "How long": tense.startsWith("future") ? "Berapa lama" : "Sudah berapa lama"};
  if (q.whWord === "How long" && !tense.startsWith("future")) marker = "";
  const questionWord = q.form === "yesNoQuestion" ? "Apakah" : q.form === "whQuestion" ? wh[q.whWord!] : "";
  let parts = [questionWord, subject, marker, predicate, object, adjunct].filter(Boolean);
  if (q.form === "whQuestion" && q.whWord === "What") {
    parts = q.mode === "nominal"
      ? ["Apa profesi atau peran", subject, adjunct].filter(Boolean)
      : ["Apa yang", marker, q.verb!.base === "lose" ? "tidak berhasil dimenangkan" : VERBS_ID[q.verb!.base][1], "oleh", subject, adjunct].filter(Boolean);
  }
  const sentence = parts.join(" ");
  return {
    text: sentence.charAt(0).toUpperCase() + sentence.slice(1) + (q.form.endsWith("Question") ? "?" : "."),
    context: CONTEXT_ID[tense],
  };
}

const OBJECT_ALIASES: Record<string, string[]> = {
  "the meal": ["the food"], "a movie": ["a film"], "a bike": ["a bicycle"],
  "a color": ["a colour"], "an email": ["an e-mail"],
};

function equivalentTranslation(q: Question, input: string): string {
  if (q.mode !== "verbal") return input;
  if (q.verb?.base === "prepare" && q.verb.object === "the meal" && q.whWord !== "What") {
    const forms: Record<string, string> = {
      get: "prepare", gets: "prepares", got: "prepared", gotten: "prepared", getting: "preparing",
    };
    return input.replace(/\b(get|gets|got|gotten|getting)\s+(the (?:meal|food))\s+ready\b/gi,
      (_, verb: string, object: string) => forms[verb.toLowerCase()] + " " + object);
  }
  return input;
}

/** Small lexical alternatives retain the exact tense, subject and polarity. */
export function checkTranslationAnswer(q: Question, input: string) {
  const equivalent = equivalentTranslation(q, input);
  const original = checkAnswer(q, equivalent);
  if (original.correct || !q.verb) return original;
  const object = q.verb.object;
  for (const alternative of OBJECT_ALIASES[object] ?? []) {
    const candidate = {...q, verb: {...q.verb, object: alternative},
      answer: q.answer.replace(object, alternative).replace(
        object.charAt(0).toUpperCase() + object.slice(1),
        alternative.charAt(0).toUpperCase() + alternative.slice(1)),
    };
    const result = checkAnswer(candidate, equivalent);
    if (result.correct) return result;
  }
  return original;
}

import { example as ex, token as t, type GuideExample, type GuideToken, type GuideVisual } from "./guideVisuals";

const contextual = (status: GuideExample["status"], context: string, note: string, ...tokens: GuideToken[]): GuideExample => ({ ...ex(status, note, ...tokens), context });

export const PLURAL_GUIDE_VISUALS = {
  agreement: {
    formulaLabel: "Cari kata inti subjek",
    formula: [t("he / she / it", "subject"), t(" + is / V1-s · "), t("we / they", "subject"), t(" + are / V1 (Present Simple)")],
    examples: [ex("correct", "Basket adalah inti subjek tunggal, bukan apples.", t("The "), t("basket", "subject"), t(" of apples "), t("is", "verb"), t(" on the table.")),
      ex("incorrect", "Jumlah apples tidak mengubah inti tunggal basket; gunakan is.", t("The basket of apples "), t("are", "error"), t(" on the table.")),
      ex("correct", "Everyone secara gramatikal tunggal.", t("Everyone", "subject"), t(" "), t("is", "verb"), t(" ready."))],
  },
  regular: {
    formula: [t("book → books · box → boxes · bus → buses", "noun")],
    examples: [ex("correct", "Book umumnya cukup ditambah -s.", t("There are two "), t("books", "noun"), t(" on the desk.")),
      ex("correct", "Box berakhir dengan x dan memakai -es.", t("We need three "), t("boxes", "noun"), t(".")),
      ex("incorrect", "Setelah two, gunakan bentuk jamak books.", t("I bought two "), t("book", "error"), t("."))],
  },
  y: {
    formula: [t("Konsonan + y → -ies · vokal + y → tambah -s", "noun")],
    examples: [ex("correct", "Baby: b sebelum y adalah konsonan; y berubah menjadi ies.", t("Two "), t("babies", "noun"), t(" are sleeping.")),
      ex("correct", "Toy: o sebelum y adalah vokal; y tetap dan ditambah s.", t("The children have many "), t("toys", "noun"), t(".")),
      ex("incorrect", "Bentuk baku jamak baby adalah babies, bukan babys.", t("Two "), t("babys", "error"), t(" are sleeping."))],
  },
  irregular: {
    formulaLabel: "Pelajari bentuknya bersama",
    formula: [t("child → children · person → people · mouse → mice · sheep → sheep", "noun")],
    examples: [ex("correct", "Children sudah berbentuk jamak; gunakan are.", t("The "), t("children", "noun"), t(" are playing.")),
      ex("correct", "Sheep tetap sama bentuknya meskipun jumlahnya lebih dari satu.", t("There are three "), t("sheep", "noun"), t(" in the field.")),
      ex("incorrect", "Jangan tambahkan -s lagi pada children.", t("The "), t("childrens", "error"), t(" are playing."))],
  },
} satisfies Record<string, GuideVisual>;

export const COMPARATIVE_GUIDE_VISUALS = {
  comparative: {
    formula: [t("Adjective-er / more + adjective", "adjective"), t(" + than + pembanding")],
    examples: [contextual("correct", "Membandingkan tinggi Maya dan Rina.", "Tall memakai taller; than memperkenalkan pembanding.", t("Maya is "), t("taller", "adjective"), t(" than Rina.")),
      ex("correct", "Expensive memakai more expensive.", t("This bag is "), t("more expensive", "adjective"), t(" than that one.")),
      ex("incorrect", "Jangan gabungkan more dan akhiran -er untuk perbandingan yang sama.", t("Maya is "), t("more taller", "error"), t(" than Rina."))],
  },
  superlative: {
    formula: [t("the + adjective-est / the most + adjective", "adjective"), t(" + kelompok pembanding")],
    examples: [contextual("correct", "Memilih orang tertinggi di kelas.", "Tallest menyatakan yang paling tinggi dalam kelompok itu.", t("Maya is "), t("the tallest", "adjective"), t(" student in the class.")),
      contextual("correct", "Memilih tas dengan harga tertinggi di toko.", "Expensive memakai the most expensive.", t("This is "), t("the most expensive", "adjective"), t(" bag in the shop.")),
      ex("incorrect", "Gunakan the tallest, bukan the most tallest.", t("Maya is "), t("the most tallest", "error"), t(" student in the class."))],
  },
  irregular: {
    formulaLabel: "Bentuk tidak beraturan",
    formula: [t("good → better → best · bad → worse → worst", "adjective")],
    examples: [ex("correct", "Comparative good adalah better.", t("This version is "), t("better", "adjective"), t(" than the old one.")),
      ex("correct", "Superlative good adalah best.", t("This is "), t("the best", "adjective"), t(" option for us.")),
      ex("incorrect", "Gunakan better, bukan gooder.", t("This version is "), t("gooder", "error"), t(" than the old one."))],
  },
  spelling: {
    formulaLabel: "Perubahan ejaan yang umum",
    formula: [t("big → bigger/biggest · happy → happier/happiest · nice → nicer/nicest", "adjective")],
    examples: [ex("correct", "Big menggandakan g sebelum -er.", t("This room is "), t("bigger", "adjective"), t(" than mine.")),
      ex("correct", "Konsonan + y pada happy menjadi i sebelum -er.", t("She looks "), t("happier", "adjective"), t(" today.")),
      ex("incorrect", "Gunakan happier, bukan happyer.", t("She looks "), t("happyer", "error"), t(" today."))],
  },
} satisfies Record<string, GuideVisual>;

export const DETERMINER_GUIDE_VISUALS = {
  near: {
    formula: [t("this", "determiner"), t(" + tunggal · "), t("these", "determiner"), t(" + jamak (dekat)")],
    examples: [contextual("correct", "Menunjuk satu buku yang dekat.", "This cocok dengan book tunggal dan is.", t("This", "determiner"), t(" "), t("book", "noun"), t(" is mine.")),
      contextual("correct", "Menunjuk beberapa buku yang dekat.", "These cocok dengan books jamak dan are.", t("These", "determiner"), t(" "), t("books", "noun"), t(" are mine.")),
      ex("incorrect", "Gunakan these books atau this book; jangan campurkan this dengan books.", t("This", "error"), t(" books are mine."))],
  },
  far: {
    formula: [t("that", "determiner"), t(" + tunggal · "), t("those", "determiner"), t(" + jamak (jauh)")],
    examples: [contextual("compare", "Menunjuk satu rumah di kejauhan.", "That cocok dengan house tunggal.", t("That", "determiner"), t(" "), t("house", "noun"), t(" is old.")),
      contextual("compare", "Menunjuk beberapa rumah di kejauhan.", "Those cocok dengan houses jamak.", t("Those", "determiner"), t(" "), t("houses", "noun"), t(" are old.")),
      ex("incorrect", "Those menyatakan jamak; gunakan are, bukan is.", t("Those houses "), t("is", "error"), t(" old."))],
  },
  eachEvery: {
    formula: [t("each / every", "determiner"), t(" + benda tunggal + verb tunggal")],
    examples: [contextual("compare", "Menyoroti siswa satu per satu.", "Each diikuti student tunggal dan has.", t("Each student", "determiner"), t(" "), t("has", "verb"), t(" a book.")),
      contextual("compare", "Mencakup seluruh siswa dalam kelompok.", "Every juga diikuti student tunggal dan has.", t("Every student", "determiner"), t(" "), t("has", "verb"), t(" a book.")),
      ex("incorrect", "Setelah every pada pola ini, gunakan student tunggal.", t("Every "), t("students", "error"), t(" has a book."))],
  },
  two: {
    formula: [t("both", "determiner"), t(" + jamak · "), t("either / neither", "determiner"), t(" + tunggal (dua pilihan)")],
    examples: [contextual("compare", "Ada dua jawaban; keduanya benar.", "Both mencakup dua-duanya dan diikuti answers jamak.", t("Both answers", "determiner"), t(" are correct.")),
      contextual("compare", "Ada dua pilihan; masing-masing dapat diterima.", "Either choice berarti pilihan mana pun dari dua itu boleh.", t("Either choice", "determiner"), t(" is fine.")),
      contextual("compare", "Dari dua jawaban, tidak ada yang benar.", "Neither menyatakan tidak satu pun dari keduanya.", t("Neither answer", "determiner"), t(" is correct.")),
      ex("incorrect", "Dalam pola both + noun ini, gunakan students jamak.", t("Both "), t("student", "error"), t(" passed the test."))],
  },
} satisfies Record<string, GuideVisual>;

export const HABIT_GUIDE_VISUALS = {
  past: {
    formula: [t("used to + V1", "verb"), t(" (kebiasaan / keadaan masa lalu)")],
    examples: [contextual("correct", "Dulu tinggal di Bali; sekarang sudah tidak.", "Used to live menyebut keadaan masa lalu.", t("She "), t("used to live", "verb"), t(" in Bali.")),
      ex("incorrect", "Setelah used to untuk kebiasaan lampau, gunakan V1 live.", t("She used to "), t("living", "error"), t(" in Bali."))],
  },
  accustomed: {
    formula: [t("be used "), t("to", "preposition"), t(" + "), t("V-ing", "gerund"), t(" / kata benda (sudah terbiasa)")],
    examples: [contextual("correct", "Bangun pagi sudah menjadi hal biasa bagi saya.", "To adalah preposisi dalam be used to; kegiatan memakai waking.", t("I am used "), t("to", "preposition"), t(" "), t("waking", "gerund"), t(" up early.")),
      ex("correct", "Setelah to dapat pula digunakan frasa benda.", t("He is used "), t("to", "preposition"), t(" "), t("the noise", "noun"), t(".")),
      ex("incorrect", "Untuk makna terbiasa, gunakan waking, bukan wake.", t("I am used to "), t("wake", "error"), t(" up early."))],
  },
  negativeQuestion: {
    formula: [t("did not use to + V1 · Did + subjek + use to + V1?", "verb")],
    examples: [ex("correct", "Dalam pola did not, bentuk baku yang dipelajari adalah use to tanpa -d.", t("I "), t("did not use to like", "verb"), t(" coffee.")),
      ex("correct", "Did membawa penanda lampau, sehingga gunakan use to play.", t("Did", "verb"), t(" you "), t("use to play", "verb"), t(" football?")),
      ex("incorrect", "Untuk penulisan baku pada latihan ini, gunakan didn't use to.", t("I didn’t "), t("used to", "error"), t(" like coffee."))],
  },
  gettingAccustomed: {
    formula: [t("get used "), t("to", "preposition"), t(" + "), t("V-ing", "gerund"), t(" / kata benda (proses menjadi terbiasa)")],
    examples: [contextual("compare", "Masih beradaptasi dengan jadwal bangun pagi.", "Am getting used to menyatakan proses menuju terbiasa.", t("I "), t("am getting used to", "verb"), t(" "), t("waking", "gerund"), t(" up early.")),
      contextual("compare", "Sekarang bangun pagi sudah terasa biasa.", "Am used to menyatakan keadaan sudah terbiasa.", t("I "), t("am used to", "verb"), t(" "), t("waking", "gerund"), t(" up early."))],
  },
} satisfies Record<string, GuideVisual>;

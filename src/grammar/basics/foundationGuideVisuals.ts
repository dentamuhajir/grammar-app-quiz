import { example as ex, token as t, type GuideVisual } from "./guideVisuals";

export const SENTENCE_STRUCTURE_VISUALS = {
  parts: {
    formula: [t("Subjek", "subject"), t(" + "), t("verb", "verb"), t(" + objek / pelengkap (sesuai pola)", "object")],
    examples: [ex("compare", "Maya adalah subjek, reads verb, some books objek, every evening keterangan waktu.", t("Maya", "subject"), t(" "), t("reads", "verb"), t(" "), t("some books", "object"), t(" "), t("every evening", "adverb"), t("."))],
  },
  svSvo: {
    formula: [t("S", "subject"), t(" + "), t("V", "verb"), t(" atau "), t("S", "subject"), t(" + "), t("V", "verb"), t(" + "), t("O", "object")],
    examples: [ex("correct", "Sleep tidak membutuhkan objek pada kalimat ini.", t("The baby", "subject"), t(" "), t("sleeps", "verb"), t(".")),
      ex("correct", "Read di sini diikuti objek some books sebagai satu frasa.", t("Maya", "subject"), t(" "), t("reads", "verb"), t(" "), t("some books", "object"), t("."))],
  },
  svc: {
    formula: [t("Subjek", "subject"), t(" + "), t("linking verb", "verb"), t(" + "), t("pelengkap subjek", "object")],
    examples: [ex("correct", "A teacher menjelaskan identitas Maya; bukan objek tindakan.", t("Maya", "subject"), t(" "), t("is", "verb"), t(" "), t("a teacher", "object"), t(".")),
      ex("incorrect", "Pernyataan nominal ini membutuhkan be: Maya is a teacher.", t("Maya "), t("a teacher", "error"), t("."))],
  },
  svoo: {
    formula: [t("S", "subject"), t(" + "), t("give / send", "verb"), t(" + "), t("penerima + benda", "object")],
    examples: [ex("correct", "Penerima her brother berada sebelum benda some books.", t("Maya", "subject"), t(" "), t("gives", "verb"), t(" "), t("her brother", "object"), t(" "), t("some books", "object"), t(".")),
      ex("correct", "Jika benda lebih dahulu, gunakan to sebelum penerima pada pola give ini.", t("Maya gives "), t("some books", "object"), t(" "), t("to", "preposition"), t(" "), t("her brother", "object"), t("."))],
  },
  svoc: {
    formula: [t("S", "subject"), t(" + "), t("V", "verb"), t(" + "), t("objek + pelengkap objek", "object")],
    examples: [ex("compare", "The door adalah objek; blue menjelaskan hasil warna pada objek tersebut.", t("They", "subject"), t(" "), t("painted", "verb"), t(" "), t("the door", "object"), t(" "), t("blue", "object"), t(".")),
      ex("compare", "A book adalah benda yang diberikan kepada Maya, bukan sifat Maya. Ini pola dua objek.", t("They", "subject"), t(" "), t("gave", "verb"), t(" "), t("Maya", "object"), t(" "), t("a book", "object"), t("."))],
  },
  position: {
    formula: [t("Keterangan waktu", "adverb"), t(" + klausa utama / klausa utama + "), t("keterangan waktu", "adverb")],
    examples: [ex("correct", "Keterangan waktu di awal memberi konteks sebelum kejadian utama.", t("Yesterday", "adverb"), t(", they visited the museum.")),
      ex("correct", "Keterangan waktu juga dapat berada di akhir.", t("They visited the museum "), t("yesterday", "adverb"), t("."))],
  },
  adverbs: {
    formula: [t("Klausa utama + "), t("cara + tempat + waktu", "adverb")],
    examples: [ex("correct", "Urutan umum di akhir: quietly (cara), at home (tempat), every morning (waktu).", t("Maya works "), t("quietly", "adverb"), t(" "), t("at home", "adverb"), t(" "), t("every morning", "adverb"), t("."))],
  },
  timeClause: {
    formula: [t("When + klausa waktu", "clause"), t(", klausa utama / klausa utama + "), t("when + klausa waktu", "clause")],
    examples: [ex("correct", "Klausa waktu di awal dipisahkan koma dari klausa utama.", t("When the film started", "clause"), t(", we stopped talking.")),
      ex("correct", "Klausa waktu yang sama boleh di akhir.", t("We stopped talking "), t("when the film started", "clause"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

export const THERE_IT_VISUALS = {
  existence: {
    formula: [t("There", "subject"), t(" + "), t("is / was", "verb"), t(" + benda tunggal / "), t("are / were", "verb"), t(" + benda jamak")],
    examples: [ex("correct", "A book tunggal memakai is; there memperkenalkan keberadaan.", t("There", "subject"), t(" "), t("is", "verb"), t(" "), t("a book", "object"), t(" on the desk.")),
      ex("incorrect", "Some books jamak, sehingga dalam Present Simple gunakan are.", t("There "), t("is", "error"), t(" some books on the desk."))],
  },
  negativeQuestion: {
    formula: [t("There", "subject"), t(" + "), t("be + not", "verb"), t(" + benda · "), t("Be", "verb"), t(" + "), t("there", "subject"), t(" + benda?")],
    examples: [ex("correct", "Negatif menambahkan not setelah be.", t("There", "subject"), t(" "), t("are not", "verb"), t(" any books on the desk.")),
      ex("correct", "Pertanyaan menempatkan are sebelum there.", t("Are", "verb"), t(" "), t("there", "subject"), t(" any books on the desk?")),
      ex("incorrect", "Dalam pola standar, gunakan Are there …?, tanpa do.", t("Do there are", "error"), t(" any books on the desk?"))],
  },
  weatherTime: {
    formula: [t("It", "subject"), t(" + "), t("be", "verb"), t(" + cuaca / waktu · "), t("It", "subject"), t(" + "), t("be + V-ing", "continuous"), t(" (cuaca berlangsung)")],
    examples: [ex("correct", "It menjadi subjek pengantar untuk cuaca.", t("It", "subject"), t(" "), t("is", "verb"), t(" cold today.")),
      ex("correct", "It digunakan untuk waktu pada jam.", t("It", "subject"), t(" is five o’clock.")),
      ex("correct", "Is raining adalah Present Continuous.", t("It", "subject"), t(" "), t("is raining", "continuous"), t(" outside."))],
  },
  evaluation: {
    formula: [t("It", "subject"), t(" + "), t("be", "verb"), t(" + adjective + "), t("to + V1", "infinitive")],
    examples: [ex("correct", "It mengisi posisi subjek; to practise menyebut kegiatan yang dinilai.", t("It", "subject"), t(" is important "), t("to practise", "infinitive"), t(" every day.")),
      ex("incorrect", "Gunakan to practise, bukan V1 langsung setelah important pada pola ini.", t("It is important "), t("practise", "error"), t(" every day."))],
  },
  reference: {
    formula: [t("It", "subject"), t(" merujuk benda ≠ "), t("it", "subject"), t(" sebagai pengantar")],
    examples: [ex("compare", "It merujuk a book yang telah disebutkan.", t("I bought a book. "), t("It", "subject"), t(" is interesting.")),
      ex("compare", "It pada cuaca tidak merujuk benda tertentu.", t("It", "subject"), t(" is raining."))],
  },
  location: {
    formula: [t("There", "subject"), t(" + be + benda ≠ benda + be + "), t("there", "adverb")],
    examples: [ex("compare", "There memperkenalkan keberadaan: ada sebuah buku.", t("There", "subject"), t(" is a book.")),
      ex("compare", "There berarti di sana; subjeknya the book.", t("The book", "subject"), t(" is "), t("there", "adverb"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

export const QUESTION_GUIDE_VISUALS = {
  tags: {
    collapsible: true,
    formula: [t("Pernyataan positif, "), t("kata bantu negatif", "verb"), t(" + "), t("pronoun", "subject"), t("? (atau sebaliknya)")],
    examples: [ex("correct", "She's ready memakai is; tag standar menjadi isn't she.", t("She’s ready, "), t("isn’t", "verb"), t(" "), t("she", "subject"), t("?")),
      ex("correct", "Don't drive negatif, sehingga tag standar memakai do positif.", t("They don’t drive, "), t("do", "verb"), t(" "), t("they", "subject"), t("?"))],
  },
  direct: {
    formula: [t("(WH +) ", "wh"), t("do / does / did", "verb"), t(" + "), t("subjek", "subject"), t(" + "), t("V1", "verb"), t("?")],
    examples: [ex("correct", "Does sudah menandai kesesuaian subjek; work tetap V1.", t("Where", "wh"), t(" "), t("does", "verb"), t(" "), t("she", "subject"), t(" "), t("work", "verb"), t("?")),
      ex("incorrect", "Jangan tambahkan -s pada verb setelah does.", t("Where does she "), t("works", "error"), t("?"))],
  },
  beModal: {
    formula: [t("(WH +) ", "wh"), t("be / modal", "verb"), t(" + "), t("subjek", "subject"), t(" + pelengkap / V1?")],
    examples: [ex("correct", "Be diletakkan sebelum subjek tanpa do.", t("Are", "verb"), t(" "), t("they", "subject"), t(" ready?")),
      ex("correct", "Modal can berada sebelum subjek you.", t("What", "wh"), t(" "), t("can", "verb"), t(" "), t("you", "subject"), t(" do?")),
      ex("incorrect", "Untuk pola be ini, gunakan Are they ready?, tanpa do.", t("Do they are", "error"), t(" ready?"))],
  },
  who: {
    formula: [t("Who", "subject"), t(" + verb? (subjek) · "), t("Who", "wh"), t(" + did + subjek + V1? (objek)")],
    examples: [ex("compare", "Menanyakan pelaku yang menelepon; who adalah subjek.", t("Who", "subject"), t(" "), t("called", "verb"), t(" you?")),
      ex("compare", "Menanyakan orang yang kamu telepon; you adalah subjek.", t("Who", "wh"), t(" "), t("did", "verb"), t(" "), t("you", "subject"), t(" call?"))],
  },
  prepositions: {
    formula: [t("WH", "wh"), t(" + kata bantu + subjek + verb + "), t("preposisi", "preposition"), t("? · "), t("How many + benda jamak / How much + uncountable", "wh")],
    examples: [ex("correct", "Preposisi for tetap diperlukan pada ungkapan wait for.", t("Who", "wh"), t(" are you waiting "), t("for", "preposition"), t("?")),
      ex("correct", "Books dapat dihitung dan jamak.", t("How many", "wh"), t(" books do you need?")),
      ex("incorrect", "Water tidak dapat dihitung dalam konteks ini; gunakan how much water.", t("How many", "error"), t(" water do you need?"))],
  },
  indirect: {
    collapsible: true,
    formula: [t("Could you tell me + "), t("WH", "wh"), t(" + "), t("subjek", "subject"), t(" + "), t("verb", "verb"), t("?")],
    examples: [ex("correct", "Bagian setelah where memakai urutan pernyataan she works.", t("Could you tell me "), t("where", "wh"), t(" "), t("she", "subject"), t(" "), t("works", "verb"), t("?")),
      ex("incorrect", "Jangan gunakan inversi pertanyaan langsung dalam klausa setelah where.", t("Could you tell me where "), t("does she work", "error"), t("?"))],
  },
} satisfies Record<string, GuideVisual>;

export const MODAL_GUIDE_VISUALS = {
  base: {
    formula: [t("Subjek", "subject"), t(" + "), t("modal + V1", "verb")],
    examples: [ex("correct", "Setelah can, gunakan swim tanpa -s dan tanpa to.", t("She", "subject"), t(" "), t("can swim", "verb"), t(".")),
      ex("incorrect", "Modal can tidak diikuti to dalam pola ini.", t("She can "), t("to swim", "error"), t(".")),
      ex("incorrect", "Verb setelah modal tetap V1 meskipun subjek she.", t("She can "), t("swims", "error"), t("."))],
  },
  past: {
    collapsible: true,
    formula: [t("should / might / must + have + V3", "verb")],
    examples: [ex("compare", "Saran atau penyesalan tentang tindakan yang seharusnya dilakukan.", t("I "), t("should have studied", "verb"), t(" harder.")),
      ex("compare", "Kesimpulan kuat tentang masa lalu; bukan kewajiban masa lalu.", t("She "), t("must have left", "verb"), t(" already.")),
      ex("compare", "Had to menyatakan kewajiban masa lalu.", t("She "), t("had to leave", "verb"), t(" early yesterday."))],
  },
  ability: {
    formula: [t("can + V1 / could + V1", "verb")],
    examples: [ex("compare", "Kemampuan sekarang.", t("Maya "), t("can swim", "verb"), t(".")),
      ex("compare", "Kemampuan umum pada masa lalu.", t("Maya "), t("could swim", "verb"), t(" when she was six.")),
      ex("correct", "Could juga dipakai untuk permintaan sopan sekarang.", t("Could", "verb"), t(" you help me?"))],
  },
  advice: {
    formula: [t("should / should not + V1", "verb")],
    examples: [ex("correct", "Should memberi saran untuk beristirahat.", t("You "), t("should rest", "verb"), t(".")),
      ex("incorrect", "Gunakan should rest, tanpa to.", t("You should "), t("to rest", "error"), t("."))],
  },
  obligation: {
    formula: [t("must + V1", "verb"), t(" (wajib) · "), t("must not + V1", "verb"), t(" (dilarang)")],
    examples: [ex("compare", "Kewajiban memakai sabuk pengaman.", t("You "), t("must wear", "verb"), t(" a seatbelt.")),
      ex("compare", "Larangan merokok, bukan sekadar saran.", t("You "), t("must not smoke", "verb"), t(" here."))],
  },
  noObligation: {
    formula: [t("must not + V1", "verb"), t(" ≠ "), t("do / does not have to + V1", "verb")],
    examples: [ex("compare", "Tidak boleh membayar dengan uang tunai: ada larangan.", t("You "), t("must not pay", "verb"), t(" in cash.")),
      ex("compare", "Tidak wajib membayar dengan uang tunai; cara lain juga boleh.", t("You "), t("do not have to pay", "verb"), t(" in cash."))],
  },
  possibility: {
    formula: [t("may / might + V1", "verb")],
    examples: [ex("correct", "Might menunjukkan kemungkinan, bukan kepastian.", t("It "), t("might rain", "verb"), t(" later.")),
      ex("incorrect", "Setelah might, gunakan V1 rain.", t("It might "), t("rains", "error"), t(" later."))],
  },
} satisfies Record<string, GuideVisual>;

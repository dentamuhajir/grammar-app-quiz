import { example as ex, token as t, type GuideExample, type GuideToken, type GuideVisual } from "./guideVisuals";

const contextual = (status: GuideExample["status"], context: string, note: string, ...tokens: GuideToken[]): GuideExample => ({ ...ex(status, note, ...tokens), context });

export const ARTICLE_GUIDE_VISUALS = {
  a: {
    formulaLabel: "Pilih dari bunyi awal",
    formula: [t("a", "determiner"), t(" + benda tunggal countable dengan bunyi awal konsonan")],
    examples: [contextual("correct", "Menyebut pekerjaan seseorang.", "Doctor diawali bunyi konsonan.", t("She is "), t("a", "determiner"), t(" "), t("doctor", "noun"), t(".")),
      contextual("correct", "Menyebut salah satu universitas, belum spesifik.", "University diawali bunyi /y/, meskipun huruf pertamanya u.", t("She studies at "), t("a", "determiner"), t(" "), t("university", "noun"), t(".")),
      ex("incorrect", "Pilih berdasarkan bunyi, bukan huruf: gunakan a university.", t("She studies at "), t("an", "error"), t(" university."))],
  },
  an: {
    formulaLabel: "Pilih dari bunyi awal",
    formula: [t("an", "determiner"), t(" + benda tunggal countable dengan bunyi awal vokal")],
    examples: [ex("correct", "Engineer diawali bunyi vokal.", t("Maya is "), t("an", "determiner"), t(" "), t("engineer", "noun"), t(".")),
      ex("correct", "Huruf h pada honest tidak dibunyikan; bunyi awalnya vokal.", t("He is "), t("an", "determiner"), t(" "), t("honest person", "noun"), t(".")),
      ex("incorrect", "Gunakan an honest person karena bunyi awalnya vokal.", t("He is "), t("a", "error"), t(" honest person."))],
  },
  the: {
    formulaLabel: "Konteks menentukan pilihan",
    formula: [t("a / an", "determiner"), t(" (belum teridentifikasi) → "), t("the", "determiner"), t(" (sudah dapat dikenali)")],
    examples: [contextual("compare", "Pertama kali memperkenalkan sebuah buku.", "A book belum menunjuk buku yang sudah dikenali pendengar.", t("I bought "), t("a book", "determiner"), t(" yesterday.")),
      contextual("compare", "Melanjutkan pembicaraan tentang buku tadi.", "The book merujuk buku yang sudah disebut.", t("The book", "determiner"), t(" is interesting.")),
      contextual("correct", "Buku yang dimaksud sudah jelas dari penjelasnya.", "The juga dapat dipakai tanpa penyebutan sebelumnya jika referennya jelas.", t("Please return "), t("the book", "determiner"), t(" I lent you."))],
  },
  zero: {
    formulaLabel: "Umum atau spesifik?",
    formula: [t("Tanpa artikel", "determiner"), t(" + jamak / uncountable untuk makna umum")],
    examples: [contextual("compare", "Membicarakan kucing secara umum.", "Cats berarti kucing sebagai jenis, bukan kelompok tertentu.", t("Cats", "noun"), t(" need water.")),
      contextual("compare", "Membicarakan kucing-kucing di rumah saya.", "The cats adalah kelompok tertentu yang dapat dikenali.", t("The cats", "determiner"), t(" in my house are sleeping.")),
      ex("correct", "Advice uncountable dalam makna nasihat; gunakan some advice atau a piece of advice.", t("I need "), t("some advice", "noun"), t(".")),
      ex("incorrect", "Jangan gunakan a/an langsung pada advice dalam makna ini.", t("I need "), t("an advice", "error"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

export const PREPOSITION_GUIDE_VISUALS = {
  time: {
    formula: [t("in", "preposition"), t(" + bulan/tahun · "), t("on", "preposition"), t(" + hari/tanggal · "), t("at", "preposition"), t(" + jam")],
    examples: [ex("correct", "On untuk hari; at untuk jam tertentu.", t("The meeting is "), t("on Monday", "preposition"), t(" "), t("at nine", "preposition"), t(".")),
      ex("correct", "In dipakai sebelum nama bulan.", t("We travel "), t("in July", "preposition"), t(".")),
      ex("incorrect", "Untuk hari Monday gunakan on, bukan in.", t("The meeting is "), t("in Monday", "error"), t("."))],
  },
  place: {
    formulaLabel: "Lihat hubungan tempatnya",
    formula: [t("in", "preposition"), t(" (di dalam) · "), t("on", "preposition"), t(" (permukaan) · "), t("at", "preposition"), t(" (titik lokasi)")],
    examples: [contextual("compare", "Kunci berada di bagian dalam kotak.", "In menunjukkan hubungan di dalam wadah.", t("The keys are "), t("in the box", "preposition"), t(".")),
      contextual("compare", "Kunci diletakkan di permukaan kotak.", "On menunjukkan permukaan; berbeda posisi dari in the box.", t("The keys are "), t("on the box", "preposition"), t(".")),
      ex("correct", "At memandang halte sebagai titik lokasi.", t("We are waiting "), t("at the bus stop", "preposition"), t("."))],
  },
  duration: {
    formula: [t("for", "preposition"), t(" + durasi · "), t("since", "preposition"), t(" + titik awal")],
    examples: [contextual("compare", "Menjawab berapa lama tinggal di sini.", "Three years adalah rentang waktu.", t("She has lived here "), t("for three years", "preposition"), t(".")),
      contextual("compare", "Menjawab sejak kapan tinggal di sini.", "2022 adalah titik awal, bukan jumlah tahun.", t("She has lived here "), t("since 2022", "preposition"), t(".")),
      ex("incorrect", "Gunakan since sebelum titik awal 2022.", t("She has lived here "), t("for 2022", "error"), t("."))],
  },
  pairs: {
    formulaLabel: "Pelajari sebagai pasangan",
    formula: [t("interested in · good at · responsible for · listen to", "preposition")],
    examples: [ex("correct", "Ungkapan interested memakai in. Kegiatan setelah preposisi memakai V-ing.", t("She is interested "), t("in", "preposition"), t(" "), t("learning", "gerund"), t(" English.")),
      ex("correct", "Listen dipasangkan dengan to sebelum objeknya.", t("I listen "), t("to", "preposition"), t(" music.")),
      ex("incorrect", "Gunakan good at untuk kemampuan melakukan kegiatan.", t("She is good "), t("in", "error"), t(" solving problems."))],
  },
  questions: {
    formula: [t("WH + kata bantu + subjek + verb + "), t("preposisi", "preposition"), t("?")],
    examples: [ex("correct", "Preposisi for tetap diperlukan dalam wait for.", t("Who are you waiting "), t("for", "preposition"), t("?")),
      ex("correct", "Bentuk ini juga benar dan lebih formal.", t("For", "preposition"), t(" whom are you waiting?")),
      ex("incorrect", "Wait for memerlukan for ketika yang ditanyakan adalah orang yang ditunggu.", t("Who are you "), t("waiting", "error"), t("?"))],
  },
  noPreposition: {
    formula: [t("Tanpa in/on/at + "), t("next / last / this / every + waktu", "adverb")],
    examples: [ex("correct", "Next Monday tidak memakai on.", t("The meeting is "), t("next Monday", "adverb"), t(".")),
      ex("incorrect", "Hilangkan on sebelum next Monday.", t("The meeting is "), t("on next Monday", "error"), t(".")),
      ex("correct", "Yesterday juga tidak memerlukan in/on/at.", t("We met "), t("yesterday", "adverb"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

export const QUANTIFIER_GUIDE_VISUALS = {
  countability: {
    formulaLabel: "Periksa jenis kata bendanya",
    formula: [t("Countable", "noun"), t(": one book / two books · "), t("Uncountable", "noun"), t(": water / advice")],
    examples: [ex("correct", "Book dapat dihitung langsung dan berubah menjadi books setelah two.", t("I bought "), t("two books", "noun"), t(".")),
      ex("correct", "Advice memakai satuan piece untuk menghitung jumlah nasihat.", t("She gave me "), t("two pieces of advice", "noun"), t(".")),
      ex("incorrect", "Dalam makna nasihat, gunakan advice atau pieces of advice.", t("She gave me "), t("two advices", "error"), t("."))],
  },
  manyMuch: {
    formula: [t("many", "determiner"), t(" + jamak countable · "), t("much", "determiner"), t(" + uncountable")],
    examples: [ex("correct", "Books jamak dan dapat dihitung.", t("How "), t("many", "determiner"), t(" "), t("books", "noun"), t(" do you need?")),
      ex("correct", "Water uncountable dalam konteks ini.", t("How "), t("much", "determiner"), t(" "), t("water", "noun"), t(" do you need?")),
      ex("incorrect", "Gunakan much, bukan many, sebelum water.", t("How "), t("many", "error"), t(" water do you need?"))],
  },
  fewLittle: {
    formula: [t("a few", "determiner"), t(" + jamak countable · "), t("a little", "determiner"), t(" + uncountable")],
    examples: [ex("correct", "Minutes dapat dihitung; a few berarti beberapa.", t("I need "), t("a few", "determiner"), t(" "), t("minutes", "noun"), t(".")),
      ex("correct", "Water uncountable; a little berarti sedikit.", t("I need "), t("a little", "determiner"), t(" "), t("water", "noun"), t(".")),
      ex("incorrect", "Gunakan a few minutes, bukan a little minutes.", t("I need "), t("a little", "error"), t(" minutes."))],
  },
  someAny: {
    formulaLabel: "Pilih dari maksud kalimat",
    formula: [t("some", "determiner"), t(" (umumnya positif/tawaran) · "), t("any", "determiner"), t(" (umumnya negatif/tanya)")],
    examples: [contextual("correct", "Menyatakan persediaan yang ada.", "Some lazim dipakai pada pernyataan positif.", t("We have "), t("some", "determiner"), t(" milk.")),
      contextual("correct", "Menyatakan tidak ada persediaan susu.", "Not any berarti tidak ada dalam konteks ini.", t("We don’t have "), t("any", "determiner"), t(" milk.")),
      contextual("correct", "Menawarkan teh kepada tamu.", "Pertanyaan tawaran lazim memakai some; pertanyaan tidak selalu memakai any.", t("Would you like "), t("some", "determiner"), t(" tea?"))],
  },
  smallAmount: {
    formulaLabel: "Perhatikan penilaian pembicara",
    formula: [t("a few / a little", "determiner"), t(" (ada sejumlah) ≠ "), t("few / little", "determiner"), t(" (sedikit; menekankan kekurangan)")],
    examples: [contextual("compare", "Masih ada waktu, jadi kita dapat mengobrol sebentar.", "A little menekankan adanya sedikit waktu.", t("We have "), t("a little", "determiner"), t(" time.")),
      contextual("compare", "Waktu sangat terbatas; kita harus segera berangkat.", "Little menekankan sedikitnya waktu, sering dirasa kurang.", t("We have "), t("little", "determiner"), t(" time.")),
      contextual("compare", "Ada beberapa teman yang dapat membantu.", "A few menekankan adanya beberapa teman.", t("I have "), t("a few", "determiner"), t(" friends here.")),
      contextual("compare", "Hanya sedikit teman; pembicara merasa kekurangan dukungan.", "Few menekankan sedikitnya teman, bukan tidak ada sama sekali.", t("I have "), t("few", "determiner"), t(" friends here."))],
  },
} satisfies Record<string, GuideVisual>;

export const PRONOUN_GUIDE_VISUALS = {
  owners: {
    formula: [t("Pemilik tunggal + ’s / jamak berakhiran s + ’", "determiner")],
    examples: [contextual("compare", "Buku milik satu siswa.", "Student tunggal memakai ’s.", t("The "), t("student’s", "determiner"), t(" book is here.")),
      contextual("compare", "Ruangan milik beberapa siswa.", "Students jamak berakhiran s memakai apostrof setelah s.", t("The "), t("students’", "determiner"), t(" room is upstairs.")),
      ex("correct", "Children adalah jamak tidak beraturan, sehingga kepemilikannya children’s.", t("The "), t("children’s", "determiner"), t(" toys are here."))],
  },
  subjectObject: {
    formula: [t("I / she / they", "subject"), t(" (subjek) · "), t("me / her / them", "object"), t(" (objek)")],
    examples: [ex("correct", "She melakukan tindakan; me menerima tindakan call.", t("She", "subject"), t(" called "), t("me", "object"), t(".")),
      ex("correct", "Setelah preposisi for, gunakan bentuk objek them.", t("This gift is for "), t("them", "object"), t(".")),
      ex("incorrect", "Her bukan bentuk subjek pada pernyataan ini; gunakan she.", t("Her", "error"), t(" called me."))],
  },
  possessiveAdjective: {
    formula: [t("my / your / his / her / its / our / their", "determiner"), t(" + "), t("kata benda", "noun")],
    examples: [ex("correct", "Her di sini menjadi penentu kepemilikan sebelum laptop.", t("This is "), t("her", "determiner"), t(" "), t("laptop", "noun"), t(".")),
      ex("incorrect", "Mine berdiri sendiri; sebelum bag gunakan my.", t("This is "), t("mine", "error"), t(" bag.")),
      ex("correct", "Its menyatakan kepemilikan tanpa apostrof; it’s berarti it is/has.", t("The cat is licking "), t("its", "determiner"), t(" paw."))],
  },
  possessivePronoun: {
    formula: [t("mine / yours / his / hers / ours / theirs", "object"), t(" berdiri sendiri")],
    examples: [ex("correct", "Hers menggantikan her laptop, tanpa mengulang bendanya.", t("This laptop is "), t("hers", "object"), t(".")),
      ex("incorrect", "Gunakan hers, bukan her’s; possessive pronoun tidak memakai apostrof.", t("This laptop is "), t("her’s", "error"), t(".")),
      ex("incorrect", "Her harus diikuti kata benda; jika berdiri sendiri gunakan hers.", t("This laptop is "), t("her", "error"), t("."))],
  },
  reflexive: {
    formula: [t("Subjek", "subject"), t(" dan "), t("objek -self/-selves", "object"), t(" merujuk orang yang sama")],
    examples: [contextual("compare", "Maya mengajari dirinya sendiri.", "Herself merujuk kembali pada subjek Maya.", t("Maya", "subject"), t(" taught "), t("herself", "object"), t(" English.")),
      contextual("compare", "Maya mengajari seorang perempuan lain.", "Her tidak sama maknanya dengan herself pada contoh ini.", t("Maya", "subject"), t(" taught "), t("her", "object"), t(" English."))],
  },
} satisfies Record<string, GuideVisual>;

export const ADJECTIVE_GUIDE_VISUALS = {
  order: {
    formula: [t("too + adjective / adjective + enough", "adjective"), t(" · opinion + age + noun")],
    examples: [ex("correct", "Too berada sebelum adjective hot.", t("The coffee is "), t("too hot", "adjective"), t(".")),
      ex("correct", "Enough berada setelah adjective light.", t("The bag is "), t("light enough", "adjective"), t(" to carry.")),
      ex("incorrect", "Untuk makna cukup ringan, gunakan light enough.", t("The bag is "), t("enough light", "error"), t(" to carry.")),
      ex("correct", "Beautiful menyatakan pendapat dan biasanya mendahului old yang menyatakan usia.", t("They live in a "), t("beautiful old", "adjective"), t(" house."))],
  },
  frequency: {
    formula: [t("Frekuensi", "adverb"), t(" sebelum verb utama / setelah be / setelah auxiliary pertama")],
    examples: [ex("correct", "Usually berada sebelum verb utama reads.", t("Maya "), t("usually", "adverb"), t(" reads at night.")),
      ex("correct", "Always berada setelah be is.", t("He is "), t("always", "adverb"), t(" late.")),
      ex("correct", "Often berada setelah kata bantu pertama have.", t("They have "), t("often", "adverb"), t(" finished early."))],
  },
  adjectiveAdverb: {
    formula: [t("Adjective", "adjective"), t(" → benda / keadaan subjek · "), t("adverb", "adverb"), t(" → cara tindakan")],
    examples: [contextual("compare", "Menjelaskan sifat Maya.", "Careful adalah adjective yang melengkapi be.", t("Maya is "), t("careful", "adjective"), t(".")),
      contextual("compare", "Menjelaskan cara Maya mengemudi.", "Carefully adalah adverb yang menerangkan drives.", t("Maya drives "), t("carefully", "adverb"), t(".")),
      ex("incorrect", "Untuk cara mengemudi, gunakan carefully.", t("Maya drives "), t("careful", "error"), t("."))],
  },
  irregular: {
    formulaLabel: "Tidak semua adverb berakhiran -ly",
    formula: [t("good → well · fast → fast · hard → hard", "adverb")],
    examples: [ex("correct", "Well menerangkan cara berbicara; good adalah adjective.", t("She speaks English "), t("well", "adverb"), t(".")),
      contextual("compare", "Dia bekerja dengan sungguh-sungguh.", "Hard adalah adverb dengan makna usaha yang besar.", t("He works "), t("hard", "adverb"), t(".")),
      contextual("compare", "Dia hampir tidak bekerja.", "Hardly bukan bentuk lain dari hard; maknanya hampir tidak.", t("He "), t("hardly", "adverb"), t(" works.")),
      ex("incorrect", "Untuk menerangkan speaks, gunakan well pada kalimat ini.", t("She speaks English "), t("good", "error"), t("."))],
  },
  feelings: {
    formula: [t("-ed", "adjective"), t(" (yang merasakan) · "), t("-ing", "adjective"), t(" (yang menimbulkan perasaan)")],
    examples: [contextual("compare", "Maya merasa bosan.", "Bored menyatakan perasaan yang dialami Maya.", t("Maya is "), t("bored", "adjective"), t(".")),
      contextual("compare", "Menurut pembicara, Maya membuat orang lain bosan.", "Boring menyatakan sifat penyebab perasaan; orang juga dapat boring.", t("Maya is "), t("boring", "adjective"), t(".")),
      ex("correct", "Film menimbulkan perasaan tertarik; penontonnya merasa tertarik.", t("The film is "), t("interesting", "adjective"), t(". I am "), t("interested", "adjective"), t("."))],
  },
} satisfies Record<string, GuideVisual>;

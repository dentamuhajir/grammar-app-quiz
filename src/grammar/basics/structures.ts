import type { BasicsQuestion, BasicsTopicGuide } from "./engine";

export const STRUCTURE_GUIDES: Record<"sentenceStructure" | "thereIt", BasicsTopicGuide> = {
  sentenceStructure: {
    summary: "Pahami fungsi bagian kalimat dan susunannya. Kalimat bahasa Inggris memiliki beberapa pola; tidak semuanya membutuhkan objek.",
    rules: [
      { label: "Subjek, verb, objek, pelengkap", detail: "Subjek adalah hal yang dibicarakan. Verb menyatakan tindakan atau keadaan. Objek mengikuti verb tertentu. Pelengkap memberi informasi tentang subjek atau objek; keterangan menambahkan konteks seperti cara, tempat, atau waktu." },
      { label: "S–V dan S–V–O", detail: "The baby sleeps memakai subjek + verb tanpa objek. Maya reads some books memakai subjek + verb + objek. Some books adalah satu frasa objek." },
      { label: "S–V–C: pelengkap subjek", detail: "Maya is a teacher dan They seem tired memakai pelengkap yang menjelaskan subjek. Pelengkap setelah linking verb bukan objek tindakan." },
      { label: "S–V–O–O: dua objek", detail: "Maya gives her brother some books: her brother penerima, some books benda yang diberikan. Untuk give/send, pola benda + to + penerima juga dapat dipakai: gives some books to her brother. Tidak semua verb memakai pola yang sama." },
      { label: "S–V–O–C: pelengkap objek", detail: "They painted the door blue: the door adalah objek dan blue menjelaskan hasil pada objek. Bedakan dengan dua objek pada gave Maya a book." },
      { label: "Posisi keterangan", detail: "Yesterday, they visited the museum dan They visited the museum yesterday sama-sama dapat digunakan. Keterangan pendek di awal tidak selalu memerlukan koma. Posisi dapat mengubah penekanan; tidak semua adverb bebas dipindah." },
      { label: "Cara → tempat → waktu", detail: "Untuk beberapa keterangan di akhir, urutan umumnya adalah cara, tempat, waktu: Maya works quietly at home every morning. Ini pedoman umum; konteks dan penekanan dapat menghasilkan urutan lain." },
      { label: "Klausa waktu", detail: "When the film started, we stopped talking memiliki klausa waktu dan klausa utama. Jika klausa when di awal, gunakan koma. Klausa waktu juga dapat di akhir: We stopped talking when the film started. Ini berbeda dari inversion seperti Never have I seen …, yang dibahas di Inversion & Emphasis." },
    ],
    examples: ["The baby sleeps.", "Maya is a teacher.", "Maya gives her brother some books.", "They painted the door blue.", "Maya works quietly at home every morning.", "When the film started, we stopped talking."],
  },
  thereIt: {
    summary: "There dan it dapat mengisi posisi subjek tanpa menyebut pelaku. Pilih berdasarkan makna: keberadaan, cuaca, waktu, atau penilaian suatu kegiatan.",
    rules: [
      { label: "There: keberadaan", detail: "There is a book on the desk memperkenalkan keberadaan buku. Gunakan is untuk a book dan are untuk some books. Dalam Past Simple gunakan was/were. There pada pola ini adalah subjek pengantar, bukan keterangan tempat 'di sana'." },
      { label: "Negatif dan pertanyaan", detail: "Negatif: There is not a book / There are not any books. Pertanyaan: Is there a book? / Are there any books? Untuk latihan bentuk baku, cocokkan be dengan benda tunggal atau jamak sesudahnya." },
      { label: "It: cuaca dan waktu", detail: "It is cold menyatakan cuaca dan It is five o’clock menyatakan jam. It tidak merujuk benda tertentu. It is raining menggunakan Present Continuous, sedangkan It is cold menggunakan Present Simple dengan be + adjective." },
      { label: "It + be + adjective + to V1", detail: "It is important to practise every day menilai kegiatan berlatih setiap hari. It mengisi posisi subjek; to practise every day menyebut kegiatan yang dinilai. Pelajari bentuk to-infinitive lebih lanjut di Gerund & Infinitive." },
      { label: "Bedakan dari it yang merujuk benda", detail: "I bought a book. It is interesting. Di sini it merujuk a book, sehingga bukan dummy subject. Pada It is raining tidak ada benda yang dirujuk. Jangan menganggap semua it adalah pengantar atau selalu memiliki 'subjek asli' setelah be." },
      { label: "Bedakan dari there sebagai tempat", detail: "The book is there berarti bukunya ada di sana; there menerangkan lokasi. There is a book berarti ada sebuah buku; there memperkenalkan keberadaan." },
    ],
    examples: ["There is a book on the desk.", "There were some books on the desk.", "Are there any books on the desk?", "It is cold.", "It is five o’clock.", "It is important to practise every day."],
  },
};

type Seed = [id: string, rule: string, prompt: string, cue: string, answer: string, explanation: string];
const structureSeeds: Seed[] = [
  ["sv", "Subjek + verb", "The baby ___.", "sleeps / a book", "sleeps", "Sleep dapat berdiri tanpa objek. The baby adalah subjek dan sleeps adalah verb."],
  ["svc", "Pelengkap subjek", "Maya ___ a teacher.", "is / reads", "is", "A teacher menjelaskan identitas Maya. Gunakan be (is), bukan action verb reads."],
  ["svo", "Objek setelah verb", "Maya reads ___.", "some books / happy", "some books", "Some books adalah frasa benda yang menjadi objek reads."],
  ["svoo", "Penerima lalu benda", "Maya gives her brother ___.", "some books / happy", "some books", "Her brother adalah penerima; some books adalah benda yang diberikan."],
  ["to-recipient", "Benda + to + penerima", "Maya gives some books ___ her brother.", "to / at", "to", "Give dapat memakai pola benda + to + penerima: gives some books to her brother."],
  ["svoc", "Pelengkap objek", "They painted the door ___.", "blue / a letter", "blue", "Blue menjelaskan hasil pada objek the door, sehingga menjadi pelengkap objek."],
  ["time", "Keterangan di awal", "Yesterday, they ___ the museum.", "visited / did visited", "visited", "Keterangan waktu di awal tidak mengubah urutan subjek dan verb pada pernyataan ini. Past Simple positif memakai visited."],
  ["adverbs", "Cara, tempat, waktu", "Maya works ___ every morning. Gunakan urutan umum cara → tempat → waktu.", "quietly at home / at home quietly", "quietly at home", "Quietly menyatakan cara, at home tempat, dan every morning waktu. Ini urutan umum untuk keterangan di akhir."],
  ["time-clause", "Klausa waktu", "When the film started, we ___ talking.", "stopped / did stopped", "stopped", "Klausa when berada di awal dan dipisahkan koma. We stopped talking adalah klausa utama dalam Past Simple."],
  ["subject-complement", "Fungsi pelengkap", "Dalam 'Maya is happy', happy adalah ___.", "pelengkap subjek / objek", "pelengkap subjek", "Happy menerangkan keadaan Maya melalui be; bukan benda yang menerima tindakan."],
];
const thereSeeds: Seed[] = [
  ["singular", "There + benda tunggal", "There ___ a book on the desk now.", "is / are", "is", "A book tunggal memakai there is dalam Present Simple."],
  ["plural", "There + benda jamak", "There ___ some books on the desk now.", "is / are", "are", "Some books jamak memakai there are dalam Present Simple."],
  ["past-singular", "Keberadaan masa lalu", "There ___ a book on the desk yesterday.", "was / were", "was", "A book tunggal dan yesterday lampau, sehingga gunakan was."],
  ["past-plural", "Keberadaan jamak masa lalu", "There ___ some books on the desk yesterday.", "was / were", "were", "Some books jamak dan yesterday lampau, sehingga gunakan were."],
  ["question", "Pertanyaan keberadaan", "___ there any books on the desk now?", "Are / Is", "are", "Pertanyaan menempatkan be sebelum there. Books jamak memakai are."],
  ["negative", "Negatif keberadaan", "There are ___ any books on the desk.", "not / no", "not", "Gunakan are not any books. Pola no memakai there are no books tanpa any."],
  ["weather", "It untuk cuaca", "___ is cold today. Kalimat ini menjelaskan cuaca.", "It / There", "it", "Cuaca dapat memakai it sebagai subjek pengantar: It is cold."],
  ["rain", "Cuaca dengan continuous", "It is ___ outside now.", "raining / rain", "raining", "It is raining memakai Present Continuous: is + V-ing untuk hujan yang sedang berlangsung."],
  ["clock", "It untuk jam", "___ is five o'clock.", "It / There", "it", "Gunakan it untuk menyatakan waktu pada jam."],
  ["evaluation", "Penilaian kegiatan", "It is important ___ every day.", "to practise / practise", "to practise", "Pola it + be + adjective + to V1 menilai suatu kegiatan: important to practise."],
  ["reference", "It yang merujuk benda", "Dalam 'I bought a book. It is interesting', it merujuk ___.", "a book / cuaca", "a book", "It merujuk buku yang sudah disebutkan; di sini it bukan subjek pengantar."],
  ["place", "There sebagai tempat", "Dalam 'The book is there', there adalah ___.", "keterangan tempat / subjek pengantar", "keterangan tempat", "There berarti di sana. Subjek kalimat ini adalah the book; bandingkan dengan There is a book."],
];
export const STRUCTURE_QUESTIONS: BasicsQuestion[] = [
  { id: "relative-zero-object", topic: "relatives", rule: "Zero relative pronoun", prompt: "The book ___ I bought is expensive.",
    cue: "Hilangkan pronoun jika boleh: ketik -; jika wajib, tulis pronoun yang tepat.", answer: "∅",
    hint: "I adalah subjek bought. Apa fungsi pronoun yang merujuk the book?", explanation: "Pronoun menjadi objek bought dalam defining clause tanpa koma, sehingga boleh dihilangkan. The book I bought is expensive benar; that/which juga boleh ditulis dalam pemakaian biasa." },
  { id: "relative-required-subject", topic: "relatives", rule: "Pronoun subjek wajib", prompt: "The woman ___ called me lives next door.",
    cue: "who / that / -", answer: "who", acceptedAnswers: ["who", "that"], hint: "Siapa subjek called? Pronoun tersebut tidak dapat dihilangkan.",
    explanation: "Who/that menjadi subjek called dan wajib ditulis. Klausa tanpa koma ini membatasi wanita yang dimaksud." },
  { id: "relative-required-nondefining", topic: "relatives", rule: "Sisipan berkoma wajib pronoun", prompt: "My laptop, ___ I bought last year, still works well.",
    cue: "which / that / -", answer: "which", hint: "Ada koma: klausa ini memberi informasi tambahan tentang laptop.",
    explanation: "Dalam non-defining clause berkoma, pronoun wajib ditulis meskipun menjadi objek. Untuk benda gunakan which, bukan that." },
  { id: "conjunction-before-time", topic: "conjunctions", rule: "Before", prompt: "Maya washed her hands ___ she ate lunch. Mencuci tangan terjadi lebih dulu.",
    cue: "before / after", answer: "before", hint: "Kegiatan pada klausa utama terjadi sebelum makan siang.", explanation: "Before menunjukkan bahwa mencuci tangan terjadi sebelum makan siang. Before she ate lunch, Maya washed her hands memiliki hubungan waktu yang sama." },
  { id: "conjunction-after-time", topic: "conjunctions", rule: "After", prompt: "Maya called her mother ___ she finished work. Menelepon terjadi sesudah bekerja selesai.",
    cue: "before / after", answer: "after", hint: "Menelepon terjadi sesudah kegiatan di anak kalimat selesai.", explanation: "After menempatkan kegiatan menelepon setelah pekerjaan selesai. Klausa after juga dapat ditulis di awal dengan koma." },
  { id: "conjunction-when-time", topic: "conjunctions", rule: "When", prompt: "___ the film started, we stopped talking. Gunakan penghubung bermakna ketika.",
    cue: "when / because", answer: "when", hint: "Bagian pertama menunjukkan kapan kami berhenti mengobrol.", explanation: "When memperkenalkan klausa waktu. Jika klausa when ditulis di awal, gunakan koma sebelum klausa utama." },
  ...structureSeeds.map(([id, rule, prompt, cue, answer, explanation]) => ({ id: `structure-${id}`, topic: "sentenceStructure" as const, rule, prompt, cue, answer, hint: explanation, explanation })),
  ...thereSeeds.map(([id, rule, prompt, cue, answer, explanation]) => ({ id: `there-it-${id}`, topic: "thereIt" as const, rule, prompt, cue, answer,
    ...(id === "evaluation" ? { acceptedAnswers: ["to practise", "to practice"] } : {}), hint: explanation, explanation })),
];

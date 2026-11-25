import type { BasicsQuestion, BasicsTopicGuide } from "./engine";

export const EXTENDED_QUESTIONS: BasicsQuestion[] = [
  { id: "ext-det-this", topic: "determiners", rule: "This / these", prompt: "___ books here are mine.", cue: "this / these", answer: "these", hint: "Books jamak dan berada di dekat pembicara.", explanation: "These digunakan untuk benda jamak yang dekat." },
  { id: "ext-det-that", topic: "determiners", rule: "That / those", prompt: "___ building across the street is a library.", cue: "that / those", answer: "that", hint: "Building tunggal dan berada di seberang jalan.", explanation: "That digunakan untuk benda tunggal yang jauh." },
  { id: "ext-det-every", topic: "determiners", rule: "Every + singular noun", prompt: "Every ___ has a name.", cue: "student / students", answer: "student", hint: "Every diikuti kata benda tunggal.", explanation: "Every diikuti kata benda tunggal, sehingga gunakan student." },
  { id: "ext-det-both", topic: "determiners", rule: "Both", prompt: "___ students passed the test. There were only two students, and each passed.", cue: "both / neither", answer: "both", hint: "Kedua siswa lulus.", explanation: "Both berarti keduanya dan diikuti kata benda jamak students." },
  { id: "ext-report-said", topic: "reportedSpeech", rule: "Reported statement", prompt: "Yesterday Maya said, 'I am tired.' Later I reported: Maya said she ___ tired then.", cue: "was / is", answer: "was", hint: "Gunakan bentuk lampau untuk melaporkan keadaan pada saat Maya berbicara.", explanation: "Dalam laporan ini am menjadi was untuk menggambarkan keadaan pada waktu lampau." },
  { id: "ext-report-told", topic: "reportedSpeech", rule: "Tell + person", prompt: "Rina ___ me that she was busy.", cue: "said / told", answer: "told", hint: "Kata kerja ini langsung diikuti orang yang diberi tahu.", explanation: "Gunakan told sebelum penerima, seperti told me. Said biasanya memakai to sebelum penerima." },
  { id: "ext-report-asked", topic: "reportedSpeech", rule: "Reported questions", prompt: "She asked where I ___.", cue: "lived / did live", answer: "lived", hint: "Pertanyaan tidak langsung memakai urutan subjek lalu kata kerja.", explanation: "Setelah where gunakan urutan pernyataan I lived." },
  { id: "ext-report-request", topic: "reportedSpeech", rule: "Reported requests", prompt: "The teacher asked us ___ quiet.", cue: "to be / be", answer: "to be", hint: "Pola permintaan adalah ask + orang + to infinitive.", explanation: "Gunakan asked us to be untuk melaporkan permintaan." },
  { id: "ext-noun-where", topic: "nounClauses", rule: "Indirect question", prompt: "I don't know where she ___.", cue: "lives / does she live", answer: "lives", hint: "Setelah where, gunakan urutan pernyataan.", explanation: "Noun clause memakai urutan she lives, tanpa inversi pertanyaan langsung." },
  { id: "ext-noun-whether", topic: "nounClauses", rule: "Whether", prompt: "I don't know ___ the shop is open or closed.", cue: "whether / where", answer: "whether", hint: "Bagian ini menyatakan dua kemungkinan.", explanation: "Whether memperkenalkan pilihan apakah toko buka atau tutup." },
  { id: "ext-noun-what", topic: "nounClauses", rule: "What clause", prompt: "I understand ___ you mean.", cue: "what / where", answer: "what", hint: "Klausa ini menyatakan hal yang dimaksud.", explanation: "What you mean berarti hal yang kamu maksud dan menjadi objek understand." },
  { id: "ext-part-passive", topic: "participles", rule: "Reduced passive clause", prompt: "The package ___ yesterday arrived today.", cue: "sent / sending", answer: "sent", hint: "Paket menerima tindakan pengiriman.", explanation: "Sent yesterday menerangkan package dan dapat diperluas menjadi that was sent yesterday." },
  { id: "ext-part-active", topic: "participles", rule: "Reduced active clause", prompt: "The woman ___ near the door is my aunt.", cue: "standing / stood", answer: "standing", hint: "Wanita itu melakukan tindakan berdiri.", explanation: "Standing near the door menerangkan woman dan dapat diperluas menjadi who is standing near the door." },
  { id: "ext-part-meaning", topic: "participles", rule: "Passive meaning", prompt: "The documents ___ by the manager are on the desk.", cue: "signed / signing", answer: "signed", hint: "Dokumen menerima tindakan dari manager.", explanation: "Signed by the manager menyatakan bahwa dokumen ditandatangani oleh manajer." },
  { id: "ext-invert-never", topic: "inversion", rule: "Negative adverbial", prompt: "Never ___ seen such a beautiful view.", cue: "have I / I have", answer: "have I", hint: "Never di awal kalimat diikuti kata bantu sebelum subjek.", explanation: "Setelah never di awal kalimat, gunakan inversi have I." },
  { id: "ext-invert-notonly", topic: "inversion", rule: "Not only", prompt: "Not only ___ call, but she also wrote.", cue: "did she / she did", answer: "did she", hint: "Setelah not only di awal, letakkan kata bantu sebelum subjek.", explanation: "Not only di awal klausa memicu inversi did she call." },
  { id: "ext-invert-only", topic: "inversion", rule: "Only then", prompt: "Only then ___ the mistake.", cue: "did he notice / he noticed", answer: "did he notice", hint: "Setelah only then di awal, gunakan did sebelum subjek.", explanation: "Only then di awal diikuti inversi did he notice." },
  { id: "ext-tag-positive", topic: "questions", rule: "Question tags", prompt: "She's ready, ___?", cue: "isn't she / is she", answer: "isn't she", acceptedAnswers: ["isn't she", "isn’t she"], hint: "Pernyataan positif memakai tag negatif dengan be yang sesuai.", explanation: "She's ready memakai is, sehingga tag negatifnya isn't she." },
  { id: "ext-tag-negative", topic: "questions", rule: "Question tags", prompt: "They don't drive, ___?", cue: "do they / don't they", answer: "do they", hint: "Pernyataan negatif diikuti tag positif.", explanation: "Don't drive adalah bentuk negatif, sehingga tag positifnya do they." },
  { id: "ext-tag-past", topic: "questions", rule: "Question tags", prompt: "Maya arrived yesterday, ___?", cue: "didn't she / doesn't she", answer: "didn't she", acceptedAnswers: ["didn't she", "didn’t she"], hint: "Arrived adalah past simple. Gunakan tag negatif dengan did.", explanation: "Pernyataan past simple positif memakai tag didn't she." },
  { id: "ext-word-enough", topic: "adjectives", rule: "Enough", prompt: "The bag is ___ to carry.", cue: "light enough / enough light", answer: "light enough", hint: "Enough berada setelah adjective light.", explanation: "Letakkan enough setelah adjective: light enough." },
  { id: "ext-word-too", topic: "adjectives", rule: "Too + adjective", prompt: "The coffee is ___ to drink right now.", cue: "too hot / hot too", answer: "too hot", hint: "Too berada sebelum adjective hot.", explanation: "Too mendahului adjective dalam pola too hot to drink." },
  { id: "ext-word-order", topic: "adjectives", rule: "Adjective order", prompt: "They live in a ___ house.", cue: "beautiful old / old beautiful", answer: "beautiful old", hint: "Pendapat biasanya mendahului usia dalam urutan adjective.", explanation: "Beautiful menyatakan pendapat dan biasanya muncul sebelum old yang menyatakan usia." },
  { id: "ext-past-should", topic: "modals", rule: "Should have + V3", prompt: "I regret not studying. I ___ studied harder.", cue: "should have / might have", answer: "should have", hint: "Gunakan bentuk yang menyatakan penyesalan atau saran tentang masa lalu.", explanation: "Should have studied menyatakan bahwa belajar lebih giat seharusnya dilakukan." },
  { id: "ext-past-might", topic: "modals", rule: "Might have + V3", prompt: "I'm unsure where my keys are. I ___ left them at home.", cue: "might have / should have", answer: "might have", hint: "Pembicara menyatakan kemungkinan tentang masa lalu.", explanation: "Might have left menyatakan kemungkinan bahwa kunci tertinggal." },
  { id: "ext-past-must", topic: "modals", rule: "Must have + V3", prompt: "The lights are off and her car is gone. She ___ left already.", cue: "must have / should have", answer: "must have", hint: "Pembicara menarik kesimpulan kuat dari bukti.", explanation: "Must have left menyatakan kesimpulan kuat tentang kejadian lampau." },
];

export const EXTENDED_GUIDES: Record<"determiners" | "reportedSpeech" | "nounClauses" | "participles" | "inversion", BasicsTopicGuide> = {
  determiners: { summary: "Determiners memperjelas benda yang dibicarakan, termasuk jumlah dan jaraknya.", rules: [
    { label: "This / these", detail: "This untuk benda tunggal yang dekat; these untuk benda jamak yang dekat." },
    { label: "That / those", detail: "That untuk benda tunggal yang jauh; those untuk benda jamak yang jauh." },
    { label: "Each / every", detail: "Each dan every biasanya diikuti kata benda tunggal, seperti every student." },
    { label: "Both / either / neither", detail: "Both berarti keduanya. Either berarti salah satu dari dua pilihan; neither berarti tidak satu pun dari keduanya." },
  ], examples: ["These books are mine.", "Every student has a name.", "Both students passed."] },
  reportedSpeech: { summary: "Reported speech melaporkan apa yang dikatakan atau ditanyakan seseorang.", rules: [
    { label: "Pernyataan", detail: "Setelah reporting verb lampau, tense sering bergeser: am menjadi was. Pergeseran tidak selalu diperlukan jika pernyataannya masih berlaku." },
    { label: "Say dan tell", detail: "Gunakan said that atau told someone that. Untuk menyebut penerima setelah said, gunakan said to someone." },
    { label: "Pertanyaan dan permintaan", detail: "Gunakan urutan pernyataan dalam asked where she lived. Permintaan dapat memakai asked someone to + V1." },
  ], examples: ["Maya said she was tired.", "She told me that she was busy.", "He asked me to wait."] },
  nounClauses: { summary: "Noun clause adalah klausa yang dapat berfungsi sebagai subjek, objek, atau pelengkap.", rules: [
    { label: "That clause", detail: "Dalam I know that she is busy, klausa that she is busy adalah objek know." },
    { label: "Pertanyaan tidak langsung", detail: "Gunakan urutan subjek lalu kata kerja: I know where she lives." },
    { label: "Whether dan what", detail: "Whether dapat menyatakan pilihan; what dapat menyatakan hal yang dimaksud: I know what you mean." },
  ], examples: ["That she passed is good news.", "I don't know whether he is home.", "I understand what you mean."] },
  participles: { summary: "Participle dan reduced relative clause dapat menerangkan kata benda dengan bentuk yang lebih ringkas.", rules: [
    { label: "Makna aktif", detail: "The woman standing near the door dapat diperluas menjadi the woman who is standing near the door." },
    { label: "Makna pasif", detail: "The package sent yesterday dapat diperluas menjadi the package that was sent yesterday." },
    { label: "Periksa makna", detail: "Past participle seperti signed dapat menunjukkan benda menerima tindakan; -ing dapat menunjukkan pelaku melakukan tindakan." },
  ], examples: ["The woman standing there is my aunt.", "The package sent yesterday arrived today.", "The documents signed by the manager are here."] },
  inversion: { summary: "Inversion menempatkan kata bantu sebelum subjek dalam beberapa pola penekanan formal.", rules: [
    { label: "Never di awal", detail: "Never have I seen it memakai kata bantu have sebelum subjek." },
    { label: "Not only", detail: "Not only did she call memakai did sebelum subjek dan kata kerja dasar call." },
    { label: "Only then", detail: "Only then did he notice memakai inversi pada klausa utama setelah only then." },
  ], examples: ["Never have I seen that.", "Not only did she call, but she also wrote.", "Only then did he notice the mistake."] },
};

# Catatan: fokus fleksibel di Sentence Practice dan peran Grammar Topics

Catatan rancangan sebelum implementasi lanjutan. Dokumen ini membedakan kondisi
kode saat ini, kelayakan pengembangan, dan prioritas pengerjaan. Usulan di sini
belum berarti generator atau checker sudah mendukungnya.

## Apa arti "fleksibel" di sini

Yang dituju: soal **tidak itu-itu saja**, dengan variasi bahan dan minimal satu
pilihan yang bermakna bagi tujuan latihan. Pilihan itu bisa berupa tense, bentuk,
jenis conditional, fungsi modal, atau pola grammar lain yang relevan.

Fleksibel tidak harus mendukung seluruh kombinasi tense/jenis/bentuk. Pola dan
pasangan bahan terkurasi boleh dipakai bersama engine. Yang perlu dijamin adalah
setiap kombinasi yang ditawarkan menghasilkan soal yang valid dan wajar.

## Kondisi kode saat ini

| Fokus | Cara menghasilkan soal | Batas saat ini |
|---|---|---|
| **Preposisi waktu** | Merangkai subjek, kegiatan, dan bahan waktu tanpa preposisi; engine membentuk verb dan checker memeriksa at/on/in atau tanpa preposisi. | 24 bahan waktu sesuai tense. Present/Past/Future Simple verbal, positif/negatif/Yes-No; waktu di awal atau akhir. Preposisi tempat, for/since dan by/until belum dicakup. |
| **Comparatives & Superlatives** | Merangkai adjective, subjek dan pembanding dari data ukuran/harga/skor/jarak; be dibentuk oleh engine. | Present/Past/Future Simple nominal, positif/negatif/Yes-No. Comparative dan superlative, tujuh adjective dasar termasuk good/bad/far. Subjek target dan data menentukan arah; less/as ... as belum dicakup. |
| **Gerund & Infinitive** | Merangkai subjek, verb utama enjoy/avoid/want, dan kegiatan terkurasi melalui engine. | Present/Past/Future Simple verbal, positif/negatif/Yes-No. Enjoy/avoid + V-ing, want + to V1. Verb kegiatan disajikan sebagai V1; stop/remember/try dan gerund sebagai subjek belum dicakup. |
| **Modals** | Menyaring pola menurut fungsi dan waktu/konteks, lalu merangkai tindakan dengan modal, have to, be able to, atau be allowed to. | Enam fungsi, 30 pola, konteks sekarang/masa lalu/masa depan sesuai dukungan. Positif/negatif/tanya dibatasi per pola. Verbal; belum mencakup nominal/passive, modal continuous, atau would hipotetis. |
| **Adverbs of Frequency** | Memilih usually/often/always, subjek orang, verb atau pelengkap terkurasi, lalu merangkai dengan `conjugate*` dan slot `mid`. | Simple dan Perfect Simple; verbal/nominal; positif, negatif, Yes/No Question. Negatif menargetkan posisi setelah not. Checker mendukung usually/often di awal kalimat positif dan often di akhir. |
| **Relative clause** | Klausa utama memakai `conjugate*`; sisipan memakai daftar deskripsi dan pola peristiwa terkurasi. | Beberapa kombinasi dikecualikan oleh `quizCombinations`, termasuk nominal perfect continuous dan `which` + nominal continuous. Tense pilihan berlaku untuk klausa utama. |
| **Penghubung antarklausa** | UI memakai bank because/when/before/after/although; engine membentuk negatif dan pertanyaan klausa utama. | Present/Past Simple, verbal, positif/negatif/Yes-No. Klausa penghubung tetap positif. Jalur lama tanpa pola tetap because positif. |
| **Quantifiers** | Merangkai frasa kuantitas dengan engine dari subjek orang dan empat benda per kelas. | Tiga simple tense; need/available/use sesuai jenis kalimat. Some/any negatif hanya verbal. |
| **Conditionals** | Merangkai pasangan klausa terkurasi dengan engine menurut Zero/First/Second/Third. | Syarat positif; hasil positif/negatif/Yes-No. Kedua urutan diterima. Mixed conditional belum tersedia. |

Rujukan kode: [generator](../src/grammar/generator.ts),
[relative clause](../src/grammar/relativeSentences.ts),
[sebab & alasan](../src/grammar/reasonSentences.ts), dan
[quantifiers/conditionals](../src/grammar/focusedSentences.ts).
Fokus frekuensi: [frequencySentences](../src/grammar/frequencySentences.ts).
Fokus modal: [modalSentences](../src/grammar/modalSentences.ts).

### Cakupan Modals yang sudah diterapkan

UI menyediakan **Fungsi modal**, **Waktu / konteks**, **Pola latihan**, dan
**Bentuk kalimat**. Pilihan waktu menunjukkan rujukan makna, bukan pemetaan modal
ke 12 tense secara bebas. Pola dan bentuk yang ditawarkan mengikuti fungsi/waktu;
setiap kombinasi pola–bentuk yang didukung mendapat giliran dalam siklus soal.

| Fungsi | Sekarang | Masa lalu | Masa depan |
|---|---|---|---|
| Kemampuan | can, be able to | could untuk kemampuan umum; was/were able to untuk satu kesempatan | will be able to |
| Izin | can/may; could khusus permintaan sopan | was/were allowed to | will be allowed to |
| Saran | should | should have + V3 | should + V1 dengan penanda waktu masa depan |
| Kewajiban | must, have/has to | had to | will have to |
| Kemungkinan | may/might/could + V1 | may/might/could have + V3 | may/might/could + V1 dengan penanda waktu masa depan |
| Kesimpulan kuat | must untuk kesimpulan positif; cannot untuk ketidakmungkinan | must have / cannot have + V3 | Belum ditawarkan pada cakupan ini |

- **Must not** menyatakan larangan; **do/does/did not have to** menyatakan tidak
  adanya kewajiban. Petunjuk membedakan kedua makna ini.
- **Must have + V3** menyatakan kesimpulan tentang masa lalu, bukan kewajiban
  masa lalu. **Could** untuk izin sopan merujuk sekarang, bukan otomatis masa lalu.
- Latihan kemungkinan memakai pernyataan. Could untuk kemungkinan hanya positif
  pada cakupan ini agar bentuk negatif tidak beralih ke ketidakmungkinan atau
  ketidakmampuan. Kesimpulan kuat memakai must positif atau cannot negatif.
- Bentuk tanya permintaan izin can/may/could menggunakan I/we. Bentuk pertanyaan
  izin masa lalu menanyakan apakah izin pernah diberikan.
- Bahan menampilkan subjek, pola modal, V1, pelengkap, dan penanda waktu; informasi
  fungsi, waktu, dan bentuk terlihat pada label/petunjuk. Pengguna mengubah V1 ke
  V3 pada perfect infinitive dan menyesuaikan have/be saat pola memerlukannya.
- Checker mempertahankan target pola, menerima kontraksi yang didukung serta
  pemindahan penanda waktu utuh untuk pernyataan. Sinonim modal dengan makna
  berbeda tidak dianggap otomatis setara.

Rujukan perbedaan makna: British Council tentang
[izin dan kewajiban](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-permission-obligation),
[kemampuan masa lalu](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/past-ability), dan
[kesimpulan tentang masa lalu](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/modals-deductions-about-past).

Conditionals kini dirangkai dari bahan terkurasi. Relative clause juga menunjukkan
bahwa bahan terkurasi dapat menjadi bagian dari fokus dinamis.

## Syarat kelayakan jadi fokus fleksibel

1. **Variasi bahan cukup dan bermakna.** Gunakan kembali `SUBJECTS`, `VERBS`,
   `COMPLEMENTS`, dan `TIME_SIGNALS` bila cocok. Tambahkan data terkurasi bila
   diperlukan; jangan mengacak pasangan yang tidak sesuai makna.
2. **Pilihan relevan dengan tujuan latihan.** Pilihan harus mengubah tugas atau
   jawaban secara nyata. Tawarkan hanya dimensi yang didukung; conditional dapat
   memakai pilihan jenis, modal dapat memakai pilihan fungsi/modal.
3. **Kombinasi valid dan petunjuk cukup.** Tentukan kecocokan subjek, predikat,
   pelengkap, waktu, dan bentuk. Konteks harus cukup untuk menentukan target
   jawaban, terutama bila ada perbedaan makna.
4. **Cakupan checker jelas.** Terima variasi yang didukung melalui `alternatives`
   atau aturan yang sesuai. Jika cakupannya terlalu luas, persempit pola dan
   petunjuk terlebih dahulu, lalu nilai biaya pengembangannya.

Kekurangan data atau aturan saat ini berarti perlu pengembangan atau penundaan.
Itu tidak otomatis membuat topik hanya cocok di Grammar Topics.

## Kelayakan dan batas per topik

### A. Kandidat awal dengan pemakaian ulang engine

| Topik | Pilihan dan bahan yang mungkin | Batas rancangan |
|---|---|---|
| **Frequency adverbs** | Adverb seperti usually/often, tense dan bentuk yang sesuai; gunakan slot `mid`. | Mulai dari daftar dan kombinasi terbatas. Posisi kata yang benar belum menjamin makna dan cakupan negasi yang sesuai. |
| **Manner/place adverbs** | Pasangan verb–adverb atau pola lokasi terkurasi; gunakan `mid`/`tail` sesuai aturan. | Perlu aturan tersendiri. Carefully cocok pada “She cooks carefully”, tetapi tidak bisa ditempel bebas pada “She is happy”. Hindari pelengkap lokasi ganda. |
| **Time expressions** | Bahan waktu sesuai tense, jenis predikat, dan bentuk; gunakan `TIME_SIGNALS`. | Data membedakan action/state/role, membatasi bentuk tertentu, dan memiliki beberapa daftar kosong. Bukan dukungan universal untuk semua klausa. |

Slot `mid`/`tail` di [engine](../src/grammar/engine.ts) membantu perakitan kalimat,
tetapi pemilihan bahan tetap perlu aturan kecocokan.
[TIME_SIGNALS](../src/grammar/data/timeSignals.ts) sudah menyediakan sebagian
aturan itu. Pemindahan waktu ke depan di
[variants.ts](../src/grammar/check/variants.ts) hanya berlaku untuk ekspresi
tertentu pada kalimat positif/negatif yang memiliki `timeSignal` di akhir.

**Pemilihan preposisi perlu tujuan tersendiri.** Jika “on Monday” diberikan utuh,
yang dilatih terutama penyusunan kalimat. Untuk melatih pilihan at/on/in, berikan
bahan seperti “Monday” dan petunjuk yang cukup agar pengguna menentukan
preposisinya. Kebutuhan ini perlu dinilai terpisah dari penggunaan ulang sinyal
waktu yang sudah lengkap.

### B. Layak dikembangkan dengan cakupan terbatas

| Topik | Pilihan yang bermakna | Data/aturan yang diperlukan |
|---|---|---|
| **Modals** | Fungsi/modal + positif/negatif/tanya, dengan subjek dan verb yang cocok. | Konteks kemampuan, izin, saran, atau kewajiban. Can/could dan will/would tidak boleh dianggap sekadar pasangan present/past; could juga dapat menyatakan kesopanan atau kemungkinan, would dapat menyatakan situasi hipotetis. |
| **Conditionals** | Zero/first/second/third dan bentuk yang didukung, dengan pasangan klausa bervariasi. | Pasangan situasi terkurasi, aturan tense syarat–hasil per pola, dan penentuan klausa yang dinegasikan/ditanyakan. Mulai dari pola standar; mixed conditionals di luar cakupan awal. |
| **Comparatives & superlatives** | Pola perbandingan, adjective, bentuk, dan tense yang sesuai. | Bentuk adjective, pasangan atau kelompok pembanding, serta konteks yang cukup. Contoh variasi: “This room is larger than that room” → “Is this room larger than that room?” |
| **Causative (have/get sth done)** | Have/get, tense dan bentuk yang didukung. | Pasangan objek–tindakan dan pola causative tersendiri. Variasi tense bermakna: “She has her car repaired” → “She had her car repaired” → “She will have her car repaired”. |
| **Pronoun & possessive** | Posisi/fungsi pronoun atau pola kepemilikan, dengan tense/bentuk secukupnya. | `objectForm` tersedia untuk sebagian subjek, tetapi belum merupakan peta possessive. Perlu rujukan orang/benda yang jelas dan aturan reflexive bila relevan. |
| **Singular & plural + agreement** | Jumlah, kata benda, dan bentuk yang menunjukkan agreement. | Peta singular/plural, termasuk irregular nouns, serta pemilihan tense yang membuat agreement terlihat. |

Pasangan tense conditional membatasi kombinasi bebas, tetapi tidak menghalangi
generator berpola. Conditionals tetap menjadi kandidat pengembangan di Sentence
Practice; tidak ada alasan untuk memindahkannya hanya karena sekarang memakai
lookup.

### C. Perlu kajian data dan checker lebih besar

| Topik | Peluang pengembangan | Alasan ditunda |
|---|---|---|
| **Collocations & chunks** | Pilih pasangan lazim dari data terkurasi, lalu variasikan konteks atau bentuk yang sesuai. | Perlu data pasangan dan batas pola; unsur idiomatik tidak dapat dikombinasikan bebas. |
| **Phrasal verbs** | Mulai dari sedikit ungkapan dengan aturan objek yang jelas. | Perlu metadata transitive/intransitive, separable/inseparable, makna, dan posisi pronoun; alternatif bisa dibangkitkan dari aturan itu. |
| **Reported speech** | Transformasi berpola dengan kalimat sumber dan konteks pelaporan yang ditentukan. | Perlu aturan pronoun, waktu/tempat, dan backshift yang sesuai konteks. Transformasi tetap bisa dinamis, tetapi cakupan awal harus sempit. |

Penundaan di kelompok ini adalah pertimbangan biaya data, aturan, dan verifikasi,
bukan kesimpulan bahwa topiknya tidak bisa dibuat dinamis.

## Peran Grammar Topics dan Sentence Practice

Topik yang sama boleh hadir di keduanya. Grammar Topics dapat melatih pengenalan
aturan dan pilihan unsur melalui soal terarah; Sentence Practice dapat melatih
penerapan aturan saat merangkai kalimat lengkap.

Penempatan mengikuti tujuan dan bentuk tugas. Penggunaan lookup, data terkurasi,
atau generator tidak cukup sebagai alasan tunggal untuk memindahkan suatu topik.

## Urutan yang disarankan

1. **Frequency adverbs** — cakupan awal sudah ditambahkan sesuai tabel kondisi
   kode di atas; manner/place dievaluasi sebagai perluasan terpisah.
2. **Modals** — enam fungsi dan pilihan waktu sudah ditambahkan sesuai tabel
   kondisi kode; would hipotetis dan struktur lanjutan memerlukan rancangan berikutnya.
3. **Conditionals** — perluas variasi bahan dari fokus yang sudah ada dengan
   generator berpola dan pasangan klausa terkurasi.

Time expressions dapat dikembangkan setelah tujuan penyusunan kalimat atau
pemilihan preposisinya diputuskan. Comparatives, causative, pronouns, dan agreement
tetap layak masuk antrean; urutannya bergantung kesiapan data dan tujuan belajar.
Ini usulan prioritas, bukan penilaian bahwa topik lain tidak layak.

## Catatan konsistensi dan verifikasi (mengikuti AGENTS.md)

- Pakai komponen yang sudah ada: `focused`/`ClausePrompt` untuk menyajikan bahan
  sebagai baris berlabel, dengan warna chip dan pemisah yang sama.
- Sajikan bahan sebagai unsur bermakna (subjek, verb, pelengkap, keterangan waktu)
  dan jaga frasa seperti “some books” tetap utuh.
- Untuk beberapa klausa, tampilkan kelompok berlabel seperti “Syarat” dan “Hasil”.
- Pastikan petunjuk menampilkan tense/jenis/bentuk ketika relevan, termasuk target
  klausa dan konteks makna jika diperlukan.
- Saat implementasi, periksa bahwa soal mengikuti setiap filter yang ditawarkan,
  bahan sesuai makna, serta checker menerima variasi yang didukung dan menolak
  perubahan yang melanggar target latihan.

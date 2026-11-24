# Fokus latihan dari Grammar Basics untuk Sentence Practice

Catatan desain untuk mode Susun. Grammar Basics memiliki 16 topik. Semuanya bisa dipraktikkan dalam kalimat utuh. Pemilihan fokus di layar sebaiknya mengikuti keputusan yang perlu dibuat pelajar. Satu soal bisa mengandung beberapa unsur grammar sekaligus.

## Peran masing-masing latihan

Grammar Basics menyediakan aturan, contoh dan soal isian. Sejumlah soal juga sudah terhubung ke latihan menulis berdasarkan situasi dengan variasi jawaban yang diterima. Sentence Practice menghasilkan soal dari kombinasi tense, jenis dan bentuk kalimat. Fokus khusus yang tersedia saat ini adalah relative clause dengan sisipan berkoma tentang orang atau benda.

Usulan label di mode Susun adalah **Fokus latihan**, dengan pilihan awal **Latihan umum** dan **Relative clause**. Tambahkan pilihan saat sudah ada latihan dengan target yang jelas. Label *simple sentence* atau *complex sentence* bisa muncul dalam analisis jawaban jika membantu menjelaskan hubungan antarklausa.

## Pemetaan 16 topik

| Topik Grammar Basics | Apa yang bisa dilatih dalam Susun | Pertimbangan untuk soal dan pemeriksaan |
|---|---|---|
| Articles | Memperkenalkan satu benda, lalu merujuk kembali dengan *the*. | Berikan konteks sebelumnya untuk membedakan *a book* dan *the book*. Paket menulis artikel sudah memakai dua kalimat. |
| Prepositions | Memilih *at*, *on*, *in* atau tanpa preposisi untuk waktu. Lokasi dan durasi bisa menyusul. | Hari, jam dan bulan bisa dijadikan bahan soal. Untuk lokasi, tunjukkan hubungan ruang. *The keys* dan *the box* saja memungkinkan beberapa jawaban. |
| Question Formation | Memilih urutan subjek dan kata bantu saat bertanya. | Gunakan filter pertanyaan yes/no dan WH yang sudah ada. Pertanyaan subjek dan pertanyaan tidak langsung layak menjadi perluasan tersendiri. |
| Singular & Plural | Mengubah *child* menjadi *children* dan menyesuaikan verb dengan jumlah subjek. | Beri jumlah dan kata benda dasar. Kalau chip sudah berbunyi *two children*, yang dilatih tinggal kesesuaian verb atau urutan kata. |
| Pronouns & Possessives | Mengganti nama dengan *her*, *hers* atau bentuk objek yang sesuai. | Sebutkan pemilik dan benda yang dirujuk. Bentuk yang diperlukan bergantung pada posisi dalam kalimat. |
| Quantifiers | Membentuk *How much water …?* atau *How many books …?* | Jenis kata benda cukup untuk latihan ini. *Few* dan *a few* juga perlu situasi yang menjelaskan apakah jumlahnya dirasa cukup. |
| Comparatives & Superlatives | Membandingkan dua benda atau memilih satu dari suatu kelompok. | Dua ukuran atau harga membuat arah perbandingan jelas. Beri target benda jika urutan perbandingan dinilai. |
| Adjectives & Adverbs | Membentuk *She drives carefully* dan *She is careful* dari *careful*. | Fungsi kata dalam kalimat menentukan bentuk. Terima posisi adverb lain jika wajar dan maknanya sama. |
| Gerund & Infinitive | Merangkai *enjoy reading* atau *want to read* dari verb dasar. | Mulai dengan verba yang polanya jelas. Untuk *like*, kedua bentuk dapat benar. |
| Relative Pronouns | Fokus saat ini mencakup *who* dan *which* dalam sisipan berkoma. | Klausa pembatas perlu aturan tersendiri, misalnya *the book I bought*. Penghilangan kata penghubung sah jika berfungsi sebagai objek dalam pola tersebut. |
| Modals | Menyatakan kemampuan, saran, atau kewajiban dalam satu kalimat. | Berikan maksud pembicara. Pilihan modal dan bentuk verb sesudahnya perlu diperiksa, termasuk alternatif yang sesuai situasi. |
| Conjunctions | Menghubungkan dua gagasan sebagai sebab, akibat atau pertentangan. | Nyatakan hubungan yang ingin diungkapkan. Untuk hubungan sebab, klausa dengan *because* dapat muncul di awal atau di akhir. |
| Conditionals (If) | Merangkai syarat dan hasil. | Mulai dari kemungkinan nyata di masa depan. Pasangan bentuk verb mengikuti makna kondisi dan hasil. Kedua urutan klausa perlu diterima. |
| Collocations & Chunks | Memilih pasangan yang lazim, seperti *make a decision*. | Gunakan pasangan terkurasi dan konteks yang membedakan makna. |
| Phrasal Verbs & Everyday Expressions | Menggunakan ungkapan sesuai situasi dan menempatkan objek. | Catat aturan per ungkapan, misalnya *turn the light off*, *turn off the light* dan *turn it off*. |
| Causative Verbs | Membedakan orang yang mengatur tindakan, pelaksana dan benda yang dikenai tindakan. | Mulai dengan satu pola seperti *I had my bike repaired*. *I repaired my bike* mengubah siapa yang melakukan perbaikan. |

## Urutan yang diusulkan

1. **Preposisi waktu** untuk mencoba fokus satu klausa. Contoh bahan adalah *the meeting · start · Monday* dengan label *Present Simple · Positive*. Jawaban *The meeting starts on Monday* menuntut pelajar memilih *on*. Sertakan kontras seperti *at noon* dan *next Monday*, serta terima posisi keterangan waktu yang wajar.
2. **Gerund & infinitive** untuk mencoba perubahan bentuk kata. Bahan *Maya · enjoy · read · comics* menghasilkan *Maya enjoys reading comics*. Mesin bisa membedakan kesalahan pada *enjoys* dan pada *reading*.
3. **Conjunctions** untuk memperluas latihan dua gagasan. Misalnya, tampilkan bahan *I · stay home* dan *I · feel sick*, dengan hubungan *alasan* dan tense *Past Simple*. Terima *I stayed home because I felt sick* dan *Because I felt sick, I stayed home*.

Ketiga usulan memiliki bahan yang menentukan jawaban, bisa menghasilkan variasi lokal, dan melatih keputusan yang berbeda. Gunakan kembali aturan, kosakata, contoh dan alternatif yang sudah ada di Grammar Basics. Batasi kombinasi filter sesuai makna tiap pola. Misalnya, bentuk *if + Present Simple, will + verb* sudah menentukan hubungan waktu antara syarat dan hasil.

## Acuan implementasi yang ada

- [Daftar topik Grammar Basics](../src/grammar/labels.ts)
- [Bank soal dan panduan Grammar Basics](../src/grammar/basics/engine.ts)
- [Paket latihan menulis per topik](../src/grammar/writingPacks.ts)
- [Generator dan filter Sentence Practice](../src/grammar/generator.ts)
- [Generator relative clause](../src/grammar/relativeSentences.ts)
- [Pemeriksaan jawaban Sentence Practice](../src/grammar/check/index.ts)

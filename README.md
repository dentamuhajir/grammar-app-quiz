# Grammar Drill

Aplikasi latihan grammar bahasa Inggris dengan penjelasan bahasa Indonesia.
Latihan dimulai dari menyusun kalimat, lalu dapat dilanjutkan ke konteks, terjemahan,
dan menulis kalimat berdasarkan situasi baru.

[Buka aplikasi](https://grammar-app-quiz.vercel.app/) · [Riwayat perubahan](CHANGELOG.md)

## Fitur utama

### Sentence Practice

Halaman awal untuk berlatih menulis kalimat lengkap. Generator mencakup 12 tense,
jenis verbal/nominal/passive, serta bentuk positif, negatif, Yes/No, dan WH-question.
Tersedia 32 subjek dan 80 kata kerja dengan bentuk V1/V2/V3 yang dicatat secara eksplisit.
Subjek mencakup kata ganti, nama orang, pasangan nama, dan frasa dengan keterangan.

Pengguna dapat memilih tingkat bantuan melalui tiga mode latihan.

| Mode | Yang ditampilkan |
| --- | --- |
| **Susun** | Badge tense dan potongan kata Inggris, misalnya `He + prepare + the meal` |
| **Konteks** | Situasi waktu dan potongan kata Inggris, dengan badge disembunyikan saat mengerjakan |
| **Terjemahkan** | Kalimat Indonesia beserta konteks waktunya, dengan petunjuk kata yang tersedia setelah mencoba |

Sebagai contoh, soal terjemahan **“Apakah dia laki-laki akan menyiapkan makanan itu?”**
dengan konteks masa depan dapat dijawab **“Will he prepare the meal?”**.
Susun menjadi mode awal dan pilihan mode terakhir tersimpan di perangkat.

Filter mendukung beberapa pilihan sekaligus. Pengguna dapat memilih
**Present Simple + Past Simple**, **Verbal**, dan **Yes/No + WH** untuk satu sesi.
Soal bergiliran melalui kombinasi yang didukung, lalu memulai siklus berikutnya.
Pilihan diterapkan setelah menekan **Terapkan Filter**.

Jawaban diperiksa kata demi kata dengan toleransi terhadap kapitalisasi, spasi,
tanda baca, dan singkatan yang didukung. Contohnya, `doesn't` dapat dikenali
sebagai `does not`. Umpan balik menunjukkan kata yang salah, kurang, atau berlebih.
Setelah jawaban yang belum tepat, pengguna dapat membuka petunjuk atau contoh jawaban.
Jawaban yang benar atau dibuka contohnya dapat ditelaah melalui pembahasan pola
dan fungsi bagian kalimat, lalu dilanjutkan dengan **Soal berikutnya**.

### Grammar Basics

Latihan isian untuk mengenali aturan sebelum menerapkannya dalam kalimat.
Tersedia **371 soal pada 13 topik**, yang dapat dikerjakan per topik atau dalam
mode Campuran.

Topiknya meliputi Articles, Prepositions, Singular & Plural, Pronouns & Possessives,
Quantifiers, Comparatives & Superlatives, Adjectives & Adverbs, Gerund & Infinitive,
Relative Pronouns, Modals, Conjunctions, Conditionals, dan Collocations.

| Contoh soal | Jawaban | Yang dipelajari |
| --- | --- | --- |
| `We need to ___ a decision.` | `make` | Pasangan kata `make a decision` |
| `This book is ___ interesting than that one.` | `more` | Perbandingan dengan `more ... than` |
| `I have two ___.` dengan kata dasar `book` | `books` | Bentuk jamak kata benda |

Pengguna mengetik kata atau frasa, menekan **Periksa jawaban**, lalu membaca
penjelasan bahasa Indonesia. Petunjuk soal tersedia setelah percobaan yang belum
tepat. Badge topik membuka panduan aturan dan contoh materi.

### Pakai dalam kalimat

Sebanyak **78 soal terkait** menyediakan tombol **Pakai dalam kalimat** setelah
soal isian diselesaikan. Pengguna mendapat situasi baru untuk menerapkan pola
yang baru dipelajari.

Contohnya, setelah menyelesaikan `We need to make a decision.`, pengguna diminta
menulis tentang Olivia yang harus memilih antara dua tawaran pekerjaan sebelum Jumat.
Salah satu jawaban yang diterima adalah **“Olivia needs to make a decision before Friday.”**
Latihan ini juga memperlihatkan perubahan `need` menjadi `needs` untuk subjek tunggal.

Jawaban ditulis di textarea yang mengikuti panjang teks, atau dimasukkan melalui
Dikte. Setelah percobaan yang belum tepat, pengguna dapat membuka kata panduan,
petunjuk, dan contoh jawaban. Pemeriksa memakai variasi kalimat terkurasi sesuai
situasi. Sejumlah latihan Articles meminta dua kalimat untuk memperkenalkan benda
dan merujuk kembali pada benda tersebut.

Percobaan dan penggunaan bantuan dicatat secara lokal. Latihan yang membutuhkan
bantuan dapat dijadwalkan untuk diulang setelah tiga hari dengan situasi terkait.

### Tenses Explorer

Halaman untuk membandingkan perubahan kalimat tanpa harus mengerjakan soal.
Pengguna memilih subjek, jenis kalimat, kata kerja atau pelengkap, waktu, aspek,
dan bentuk kalimat.

Lima kata kerja awal adalah **write, eat, take, go, work**. Perubahan bentuk
ditampilkan bersama contoh kalimat dan penjelasan pemakaiannya.

| Pilihan | Contoh hasil |
| --- | --- |
| Past Simple positif | `Emma wrote a letter yesterday.` |
| Past Simple negatif | `Emma did not write a letter yesterday.` |
| Past Simple Yes/No | `Did Emma write a letter yesterday?` |
| Present Perfect | `Emma has written a letter today.` |

Pada contoh tersebut, bentuk `wrote` berubah kembali menjadi `write` setelah
`did`, sedangkan Present Perfect memakai `has + written`.

Mode nominal menggunakan pelengkap seperti `tired`, `careful`, `a teacher`,
dan `at home`. Contohnya **“Emma is tired.”** dan **“Is Emma tired?”**.
Pilihan Continuous tersedia dengan pelengkap perilaku, misalnya
**“Emma is being careful.”**, untuk menjelaskan sikap sementara.
Pola nominal yang membutuhkan konteks khusus dibatasi dan diberi keterangan.

Explorer dapat dibuka dari menu atau dengan menekan label tense pada soal.
Saat dibuka dari soal, konteks kalimat ikut terbawa dan draft jawaban tetap
tersedia saat kembali. Garis waktu, pembagian fungsi kata, dan perbandingan
tense dapat dibuka sesuai kebutuhan.

### Question & Answer

Fitur ini melatih pemahaman pertanyaan dan kemampuan memberi respons.
Tersedia **Latihan singkat** serta **Roleplay percakapan**.

Dalam latihan singkat, pengguna mengenali informasi yang ditanyakan lalu
menulis jawaban. Pemeriksa mempertimbangkan pola grammar dan kesesuaian respons.

| Pertanyaan | Contoh respons |
| --- | --- |
| `Where did she work?` | `She worked at a restaurant.` |

Contoh tersebut melatih bentuk lampau dan informasi tempat. Jawaban dengan
keterangan waktu saja belum memenuhi informasi tempat yang diminta.

Roleplay memakai skenario kehidupan sehari-hari, pekerjaan, perjalanan, atau
belajar. Misalnya, skenario kelompok belajar dimulai dengan
**“Which topic should we study together first?”**. Pengguna dapat menjawab
**“We should study past simple first.”** lalu melanjutkan percakapan.
Tutor Gemini dapat memberi koreksi dan pertanyaan lanjutan berdasarkan respons.

### Article Lab

Latihan mengenali grammar di dalam paragraf. Tersedia dua bentuk aktivitas.

- **Bedah Kalimat** — memilih tag struktur grammar berdasarkan kalimat dan
  menemukan frasa yang menjadi buktinya.
- **Cari & Perbaiki** — menemukan bagian yang bermasalah lalu mengetik koreksinya.

Sebagai ilustrasi, frasa `has finished` dapat dikenali sebagai Present Perfect.
Contoh jenis koreksi yang dilatih adalah perubahan berikut.

| Teks dengan kesalahan | Perbaikan |
| --- | --- |
| `She has went home.` | `She has gone home.` |

Pengguna berlatih membaca konteks dan menjelaskan pilihan bentuk kata.
Materi artikel kustom dapat ditambahkan melalui dataset dan perintah pengelolaan
artikel yang tersedia dalam proyek.

### Story Challenge

Latihan menulis cerita berdasarkan situasi dengan tiga misi grammar.
Pengguna dapat memilih tingkat Starter, Intermediate, atau Master, lalu memakai
ide kata konteks serta bantuan bentuk kata kerja saat menyusun cerita.

Contoh skenario **Terlambat ke Acara Penting** meminta pengguna menceritakan
kejadian saat terlambat atau ketinggalan kendaraan. Tiga misi pada skenario ini
dapat dipenuhi dengan kalimat berikut.

| Misi | Contoh kalimat |
| --- | --- |
| Past Perfect | `The train had left before I arrived.` |
| Passive Voice lampau | `My ticket was left on my desk at home.` |
| Penyesalan dengan modal | `I should have prepared everything last night.` |

Pemeriksaan lokal menandai pola yang ditemukan, memeriksa syarat penulisan,
dan memberikan saran untuk misi yang belum terpenuhi. MiniLM membantu
memperkirakan kesesuaian topik. Tutor Gemini dapat digunakan untuk umpan balik
berdasarkan cerita dan misi yang dipilih.

### Input suara, audio, dan cara baca

Tombol **Dikte** memasukkan ucapan bahasa Inggris ke dalam kotak jawaban.
Teks dapat diedit sebelum diperiksa. Tombol **Ucapkan** dan **Lambat** membantu
mendengarkan contoh, sedangkan **Cara baca** menyediakan panduan pelafalan
bergaya ejaan Indonesia untuk kosakata yang tercakup.

## Menjalankan proyek

Dibangun dengan React, TypeScript, dan Vite. CI menggunakan Node.js 20.

```bash
npm ci
npm run dev
```

Buka alamat lokal yang ditampilkan Vite.

| Perintah | Kegunaan |
| --- | --- |
| `npm test` | Menjalankan tes grammar, pemeriksaan jawaban, dan generator soal |
| `npm run build` | Memeriksa TypeScript dan membuat build produksi di `dist/` |
| `npm run preview` | Membuka build produksi secara lokal |

## Offline, suara, dan tutor Gemini

Pemeriksaan Sentence Practice dan Grammar Basics serta materi Tenses Explorer
berjalan di browser. Aplikasi mendukung instalasi PWA dan cache aset untuk
penggunaan offline setelah dimuat melalui jaringan.

Input suara bergantung pada dukungan browser dan perangkat, serta dapat
memerlukan jaringan. Story Challenge dapat mengunduh model MiniLM saat pertama
digunakan untuk membantu memperkirakan kesesuaian topik cerita.

Tutor Gemini pada roleplay dan Story Challenge memerlukan koneksi serta API key
di server. Untuk development, buat file `.env.local` yang diabaikan Git.

```dotenv
GEMINI_API_KEY=isi_api_key_anda
```

Jalankan ulang `npm run dev` setelah mengubah environment. Pada Vercel, tambahkan
`GEMINI_API_KEY` di Environment Variables untuk deployment yang digunakan, lalu
redeploy. GitHub Pages menjalankan fitur lokal.

## Pengembangan materi

Logika grammar dan materi berada di `src/grammar/`, komponen tampilan di
`src/ui/`, dan endpoint tutor di `api/`.

Panduan menambah artikel tersedia di [Panduan Article Lab](PANDUAN_ARTICLE_LAB.md).
Riwayat pengembangan sejak versi pertama tersedia di [CHANGELOG.md](CHANGELOG.md).

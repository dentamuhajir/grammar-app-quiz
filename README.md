# Grammar Drill

Aplikasi latihan grammar bahasa Inggris dengan penjelasan bahasa Indonesia.
Latihan dimulai dari menyusun kalimat, lalu dapat dilanjutkan ke konteks, terjemahan,
dan menulis kalimat berdasarkan situasi baru.

[Buka aplikasi](https://grammar-app-quiz.vercel.app/) · [Riwayat perubahan](CHANGELOG.md)

## Fitur utama

### Tema tampilan

Ikon di kanan logo menyediakan pilihan **Ikuti perangkat**, **Terang**, dan
**Gelap**. Tema awal mengikuti perangkat dan pilihan terakhir disimpan secara lokal.
Tema berlaku pada seluruh fitur, kartu soal, kotak jawaban, modal, dan navigasi.

### Sentence Practice

Halaman awal untuk berlatih menulis kalimat lengkap. Generator mencakup 12 tense,
jenis verbal/nominal/passive, serta bentuk positif, negatif, Yes/No, dan WH-question.
Tersedia 32 subjek dan 80 kata kerja dengan bentuk V1/V2/V3 yang dicatat secara eksplisit.
Subjek mencakup kata ganti, nama orang, pasangan nama, dan frasa dengan keterangan.

Pengaturan dibuka melalui ringkasan di atas soal. Fokus dikelompokkan menjadi
Kalimat dasar, Pola kata, dan Hubungan antarklausa. Pilihan paket berada di dalam
pengaturan Latihan umum: Dasar, Sehari-hari, Lebih lengkap, dan Semua tense.
Paket Dasar menjadi awal dengan Present Simple verbal/nominal positif.
Paket Sehari-hari memilih Present Simple, Past Simple, Present Continuous,
dan Future Simple; Lebih lengkap menambahkan Present Perfect dan Past Continuous.

Susun menjadi cara latihan utama. Pilihan berikut tersedia melalui
**Bantuan & latihan lainnya** khusus Latihan umum.

| Mode | Yang ditampilkan |
| --- | --- |
| **Susun** | Badge tense dan potongan kata Inggris, misalnya `He + prepare + the meal` |
| **Sembunyikan nama tense** | Situasi waktu dan bahan kata; jenis dan bentuk kalimat tetap terlihat agar jawaban dapat ditentukan |
| **Terjemahkan** | Kalimat Indonesia beserta konteks waktunya, dengan petunjuk kata yang tersedia setelah mencoba |

Sebagai contoh, soal terjemahan **“Apakah dia laki-laki akan menyiapkan makanan itu?”**
dengan konteks masa depan dapat dijawab **“Will he prepare the meal?”**.
Susun menjadi mode awal dan pilihan mode terakhir tersimpan di perangkat.

Filter mendukung beberapa pilihan sekaligus. Pengguna dapat memilih
**Present Simple + Past Simple**, **Verbal**, dan **Yes/No + WH** untuk satu sesi.
Soal bergiliran melalui kombinasi yang didukung, lalu memulai siklus berikutnya.
Pilihan diterapkan setelah menekan **Terapkan pengaturan**. Perpindahan fokus
mempertahankan pengaturan Latihan umum selama sesi; fokus khusus tetap memakai
pola dan kombinasi yang didukungnya.

Di mode **Susun**, **Fokus latihan → Relative clause** menghasilkan soal dengan
dua kelompok bahan kata. Kalimat utama mengikuti filter latihan dan sisipan
memiliki label tense tersendiri. Pengguna memilih kata penghubung saat merangkai
jawaban. Untuk sisipan seperti
*which Dad repaired yesterday*, jawaban *which was repaired by Dad yesterday*
juga diterima.

**Penghubung antarklausa** menyediakan because, when, before, after, dan although
dalam Present Simple atau Past Simple. Bentuk positif, negatif, atau Yes/No
berlaku pada klausa utama; klausa penghubung tetap positif. Kedua urutan diterima,
misalnya *Did Maya stay home because she felt sick?* dan
*Because she felt sick, did Maya stay home?*.

**Gerund & Infinitive** melatih enjoy/avoid + V-ing dan want + to V1.
Bahan menampilkan verb kegiatan dalam bentuk dasar, misalnya
`she + enjoy + read + some books`. Pengguna membentuk
*She enjoys reading some books.* Tersedia Present/Past/Future Simple verbal,
positif, negatif, dan Yes/No; tense dan bentuk berlaku pada verb utama.
Pola dengan perubahan makna seperti stop/remember/try belum dicakup.

**Preposisi waktu** melatih pemilihan at/on/in atau tanpa preposisi dari 24 bahan
waktu terkurasi. Chip menampilkan `Monday`, bukan `on Monday`, sehingga pengguna
menentukan preposisinya sendiri. Kategori meliputi jam/titik waktu, hari/tanggal,
bulan/tahun/bagian hari, dan tanpa preposisi seperti yesterday atau next Monday.
Tersedia Present/Past/Future Simple verbal, positif, negatif, dan Yes/No.
Bahan waktu mengikuti tense; keterangan waktu boleh di awal atau akhir kalimat.
Latihan preposisi tempat, durasi for/since, dan batas waktu by/until belum dicakup.

**Comparatives & Superlatives** menyediakan data ukuran, harga, skor, atau jarak
untuk menentukan arah perbandingan. Bahan adjective tetap berupa kata dasar,
misalnya `Room B + be + big + Room A`, sehingga pengguna membentuk
*Room B is bigger than Room A.* Pola superlative membandingkan anggota dalam
kelompok berisi tiga pembanding. Tersedia Present/Past/Future Simple nominal,
positif, negatif, dan Yes/No; data negatif mendukung pernyataan yang disangkal.
Bentuk tidak beraturan good/bad/far dicakup, termasuk farther/further dan
farthest/furthest. Pola less/as ... as belum dicakup.

**If / Conditionals** merangkai pasangan bahan terkurasi untuk Zero, First,
Second, dan Third. Syarat tetap positif, sementara hasil mengikuti bentuk
positif, negatif, atau Yes/No yang dipilih. Kedua urutan klausa diterima.

**Quantifiers** mencakup empat benda countable dan empat uncountable dengan
subjek yang bervariasi. Frasa seperti *a few chairs* tetap menjadi satu bahan.
Some/any mengikuti bentuk kalimat; latihan negatif some/any memakai jenis verbal.

Pada Sentence Practice dan Grammar Topics, geser kartu ke kiri untuk **Skip Soal**
dan ke kanan untuk **Materi**. Swipe kiri dibatasi saat ada draft yang belum selesai.
Badge tetap dapat diketuk untuk membuka materi.

Jawaban benar ditandai ikon piala, animasi singkat, dan confetti. Kalimat jawaban,
kontrol pelafalan, dan tombol analisis ditampilkan langsung pada kartu hasil;
tombol Soal berikutnya berada di bawah kartu. Animasi dekoratif mengikuti
preferensi reduced motion perangkat.

Jawaban diperiksa kata demi kata dengan toleransi terhadap kapitalisasi, spasi,
tanda baca, dan singkatan yang didukung. Contohnya, `doesn't` dapat dikenali
sebagai `does not`. Umpan balik langsung menampilkan baris Jawabanmu dan Acuan,
dengan penanda kata yang salah, kurang, atau berlebih. Petunjuk perbaikan ditandai
ikon catatan kecil. Tombol Lihat contoh jawaban membuka pelafalan dan pembahasan.
Setelah jawaban yang belum tepat, pengguna dapat membuka petunjuk atau contoh jawaban.
Jawaban yang benar atau dibuka contohnya dapat ditelaah melalui pembahasan pola
dan fungsi bagian kalimat, lalu dilanjutkan dengan **Soal berikutnya**.

### Grammar Topics

Latihan isian untuk mengenali aturan sebelum menerapkannya dalam kalimat.
Tersedia **403 soal pada 15 topik**, yang dapat dikerjakan per topik atau dalam
mode Campuran.

Topiknya meliputi Articles, Prepositions, Singular & Plural, Pronouns & Possessives,
Quantifiers, Comparatives & Superlatives, Adjectives & Adverbs, Gerund & Infinitive,
Relative Pronouns, Modals, Conjunctions, Conditionals, Collocations & Chunks,
Phrasal Verbs & Everyday Expressions, dan Causative Verbs. Di Collocations & Chunks,
latihan *Common Verbs in Context* membahas makna get, have, take, dan go.

| Contoh soal | Jawaban | Yang dipelajari |
| --- | --- | --- |
| `We need to ___ a decision.` | `make` | Pasangan kata `make a decision` |
| `This book is ___ interesting than that one.` | `more` | Perbandingan dengan `more ... than` |
| `I have two ___.` dengan kata dasar `book` | `books` | Bentuk jamak kata benda |

Pengguna mengetik kata atau frasa, menekan **Periksa jawaban**, lalu membaca
penjelasan bahasa Indonesia. Petunjuk soal tersedia setelah percobaan yang belum
tepat. Badge topik membuka panduan aturan dan contoh materi.

### Pakai dalam kalimat

Sebanyak **110 soal terkait** menyediakan tombol **Pakai dalam kalimat** setelah
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

Explorer dapat dibuka dari menu atau melalui tombol di panel materi soal.
Panel materi dapat dibuka dengan menekan badge atau menggeser kartu ke kanan.
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
Tutor AI menggunakan Groq untuk memberi koreksi dan pertanyaan lanjutan. Jika
Groq tidak tersedia, server mencoba Gemini dengan konteks percakapan yang sama.

### Article Lab

**Bedah teks sendiri** membuka Article Lab. Tempel artikel bahasa Inggris, pilih
kalimat, lalu ketuk frasa yang disorot untuk membaca penjelasannya dalam bahasa
Indonesia. Analisis memakai endpoint `/api/article` dan `GROQ_API_KEY` di server.
Teks contoh memiliki penjelasan bawaan dan bisa dicoba secara offline.

Dua kuis tetap tersedia melalui **Latihan artikel**.

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

## Offline, suara, dan tutor AI

Pemeriksaan Sentence Practice dan Grammar Topics serta materi Tenses Explorer
berjalan di browser. Aplikasi mendukung instalasi PWA dan cache aset untuk
penggunaan offline setelah dimuat melalui jaringan.

Input suara bergantung pada dukungan browser dan perangkat, serta dapat
memerlukan jaringan. Story Challenge dapat mengunduh model MiniLM saat pertama
digunakan untuk membantu memperkirakan kesesuaian topik cerita.

Roleplay memakai Groq (`openai/gpt-oss-20b`) sebagai penyedia utama dan Gemini
sebagai cadangan. Jika hanya satu kunci tersedia, roleplay memakai penyedia
tersebut. Jika tutor tidak tersedia, latihan berlanjut dalam mode lokal dan
jawaban terakhir tetap berada di kotak isian. Story Challenge memakai Gemini.
Untuk development, simpan kunci di file `.env.local` yang diabaikan Git.

```dotenv
GROQ_API_KEY=isi_kunci_groq
GEMINI_API_KEY=isi_kunci_gemini
```

Jalankan ulang `npm run dev` setelah mengubah environment. Pada Vercel, tambahkan
kunci yang digunakan di Environment Variables untuk deployment tujuan, lalu
redeploy. GitHub Pages menjalankan fitur lokal.

## Pengembangan materi

Logika grammar dan materi berada di `src/grammar/`, komponen tampilan di
`src/ui/`, dan endpoint tutor di `api/`.

Panduan menambah artikel tersedia di [Panduan Article Lab](PANDUAN_ARTICLE_LAB.md).
Riwayat pengembangan sejak versi pertama tersedia di [CHANGELOG.md](CHANGELOG.md).

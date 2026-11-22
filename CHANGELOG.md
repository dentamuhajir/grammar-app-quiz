# Riwayat Perubahan Grammar Drill

Catatan ini merangkum perkembangan berdasarkan tanggal commit Git.
Versi pada `package.json` saat ini adalah `0.1.0`.

## 2026-11-22

### Latihan dan materi

- Memperluas Grammar Basics menjadi 371 soal isian pada 13 topik dan 78 situasi menulis.
- Menghubungkan soal terkait ke latihan **Pakai dalam kalimat**.
- Memperbarui 60 situasi menulis agar pengguna menerapkan pola dalam kalimat baru.
- Memisahkan pembahasan soal isian dan pembahasan situasi menulis.
- Menambah subjek hingga 32, termasuk Emma, James, Olivia, Daniel, pasangan nama,
  dan subjek dengan keterangan.
- Memperluas penggunaan **it** dan subjek benda dengan kata kerja yang sesuai.
- Menjelaskan kata inti yang menentukan agreement pada subjek panjang.

### Sentence Practice

- Menjadikan Sentence Practice halaman awal saat aplikasi dibuka.
- Menyediakan mode **Susun**, **Konteks**, dan **Terjemahkan** melalui tombol mode
  serta filter. Pilihan terakhir disimpan di perangkat.
- Menambah soal terjemahan Indonesia dengan konteks waktu dan petunjuk kata.
- Mendukung pemilihan beberapa tense, jenis, dan bentuk kalimat sekaligus.
- Menerapkan filter setelah pengguna menekan **Terapkan Filter**.
- Mengatur giliran kombinasi yang didukung dalam satu siklus latihan.
- Menampilkan pesan saat pilihan kosong atau seluruh kombinasi belum didukung.

### Tenses Explorer dan tampilan

- Memindahkan Tenses Explorer ke halaman tersendiri, diakses dari menu atau label tense.
- Membawa subjek, tense, jenis, dan bentuk kalimat dari soal aktif.
- Mempertahankan soal serta draft jawaban saat pengguna kembali dari Explorer.
- Menambah contoh **write, eat, take, go, work** beserta perubahan bentuknya.
- Mendukung kalimat verbal/nominal dan empat bentuk kalimat. Konteks soal passive
  juga dapat dibawa ke Explorer.
- Membatasi pilihan nominal sesuai pelengkap dan penggunaan yang didukung.
- Menempatkan garis waktu dan perbandingan tense dalam bagian yang dapat dibuka.
- Menyatukan textarea, Dikte, dan Periksa jawaban pada Sentence Practice serta
  latihan menulis. Textarea menyesuaikan panjang isi.
- Menyatukan textbox pendek dan tombol Periksa pada Grammar Basics.
- Menampilkan petunjuk dan akses contoh jawaban setelah percobaan yang belum tepat.
- Merapikan jarak label, kotak jawaban, umpan balik, dan tombol bantuan.

## 2026-11-21

- Menambahkan tutor Gemini untuk Story Challenge dan memperluas integrasi roleplay.
- Menambahkan latihan menulis **for/since**, **interested in + -ing**, dan **a/an/the**.
- Menambahkan pencatatan percobaan, penggunaan bantuan, dan latihan ulang terjadwal.
- Menambahkan panduan cara baca serta pemutaran audio pada latihan kalimat.
- Memperluas penjelasan bahasa Indonesia, pembagian fungsi kata, dan petunjuk grammar.
- Memperbaiki penutupan modal pembahasan agar guliran di HP tetap mempertahankan modal.

## 2026-11-20

- Mengintegrasikan tutor Gemini pada Q&A roleplay.
- Mengembangkan dialog berdasarkan jawaban dan konteks percakapan pengguna.
- Merapikan antarmuka percakapan serta skenario roleplay.

## 2026-11-17

- Menambahkan roleplay bercabang pada Question & Answer.
- Menambahkan dukungan pencocokan intent opsional untuk memilih respons lanjutan.

## 2026-11-16

- Mengembangkan pemeriksaan Story Challenge dengan estimasi relevansi MiniLM.
- Memisahkan pemeriksaan aturan eksplisit, kesesuaian topik, dan saran pengembangan.
- Menambahkan tes parafrasa dan contoh penilaian relevansi.

## 2026-11-15

- Menambahkan materi Conditionals, Collocations, dan perluasan Prepositions.
- Menambahkan Mode Konteks untuk berlatih memilih tense melalui situasi.
- Menambahkan input suara dengan transkrip langsung dan penyambungan teks.
- Menambahkan panduan topik Grammar Basics yang dapat dibuka dari badge.
- Mengurangi petunjuk konteks yang membocorkan jawaban soal.
- Memperkenalkan Tenses Explorer interaktif di dalam modal pembahasan.

## 2026-11-14

- Mengembangkan tampilan kartu dengan warna, garis tegas, dan navigasi mobile.
- Menambahkan ikon aplikasi dan proses pembuatan aset PWA.
- Memperluas mesin Grammar Basics dan tesnya.
- Menambahkan Article Lab, materi artikel kustom, dan perintah pengelolaan artikel.
- Menambahkan Story Challenge dengan penulisan cerita dan validasi misi grammar.

## 2026-11-12

- Menambahkan Grammar Basics dan Question & Answer.
- Menambahkan penjelasan grammar dalam bahasa Indonesia.
- Mengembangkan dukungan PWA dan penggunaan offline.
- Memperluas topik Grammar Basics dan latihan Q&A.
- Memperbaiki fokus input saat keyboard mobile digunakan.
- Menambahkan navigasi bawah, bottom sheet, dan gestur geser kartu.

## 2026-11-01

- Memperbaiki passive voice, WH-question, dan subject–verb agreement.
- Menambahkan pemeriksaan jawaban, perbandingan kata, dan petunjuk kesalahan.
- Mengubah identitas tampilan menjadi **Grammar Drill** dengan tema warna kertas.
- Menambahkan filter yang dapat dilipat pada mobile.
- Memperbaiki posisi kata keterangan di tengah kalimat dan aturan waktu pada pertanyaan.
- Mengonfigurasi deployment GitHub Pages melalui branch `master` serta deployment Vercel.

## 2026-10-31

- Mencatat versi awal proyek dengan nama **Grammar App Quiz**.
- Menyediakan generator latihan tense, data subjek/kata kerja/pelengkap, dan mesin
  pembentukan kalimat bahasa Inggris.
- Menyiapkan aplikasi React, TypeScript, Vite, dan workflow deployment awal.

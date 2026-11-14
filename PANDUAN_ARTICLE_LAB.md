# Panduan Penggunaan & Penambahan Artikel (`Article Lab`)

Dokumen ini menjelaskan cara kerja fitur **Article Lab** serta cara menambahkan artikel baru ke dalam aplikasi **tanpa perlu mengubah kode TypeScript/React (`.ts` / `.tsx`)**.

Seluruh data artikel dibundel secara statis saat proses *build*, sehingga aplikasi tetap berjalan **100% offline** di perangkat pengguna (PWA).

---

## 1. Struktur Mode di Article Lab

Setiap artikel di **Article Lab** mendukung dua mode latihan utama:

1. **Bedah Kalimat (Tag) (`breakdowns`)**
   - Menampilkan paragraf yang dipecah menjadi 2–3 kalimat bernomor (**Kalimat 1**, **Kalimat 2**, dst.) tanpa *highlight* bocoran di awal.
   - Pengguna memilih tag struktur grammar dari **Bank Tag Struktur** (`tagBank`) untuk setiap kalimat.
   - Urutan tombol di `tagBank` diacak otomatis setiap kali siklus soal baru dimulai.
   - Mendukung `trapHints` untuk memberikan umpan balik spesifik jika pengguna memilih tag pengecoh tertentu.

2. **Cari & Perbaiki (`findFixParagraphs`)**
   - Menampilkan paragraf dengan 3–4 frasa yang dapat diketuk (`spanId`).
   - **Rotasi Error Dinamis:** Jika dalam satu paragraf Anda mendefinisikan 2 atau 3 `mutation` pada `spanId` yang berbeda, mesin di `src/grammar/articles/engine.ts` otomatis memecahnya menjadi beberapa kartu soal terpisah. Pada satu kartu, hanya 1 frasa yang dirusak (`wrongText`) sementara frasa lainnya tampil dalam bentuk yang benar (`text`).

---

## 2. Lokasi File Dataset

Seluruh artikel tambahan disimpan di dalam file:

```text
src/grammar/articles/custom-articles.json
```

Begitu Anda menambahkan objek artikel baru ke dalam array di `custom-articles.json`:
- Judul artikel (`articleTitle`) **otomatis muncul** di dropdown filter **Pilih Artikel**.
- Seluruh soal `breakdowns` dan `findFixParagraphs` **otomatis masuk** ke putaran kuis.
- Unit test (`npm test`) **otomatis memeriksa** kelengkapan struktur artikel tersebut.

---

## 3. Cara Menambah Artikel Baru

### Cara A: Menggunakan Generator Prompt LLM + Auto-Import (Direkomendasikan)

1. **Cetak prompt siap pakai sesuai topik yang Anda inginkan:**
   ```powershell
   npm run article:prompt -- "Sejarah Kopi di Indonesia"
   ```
   *(Anda bisa mengganti `"Sejarah Kopi di Indonesia"` dengan topik apa saja, misalnya `"Artificial Intelligence at Work"`, `"Traveling by Train in Java"`, dll.)*

2. **Salin (Copy) output prompt dari terminal**, lalu tempelkan ke ChatGPT, Gemini, atau Claude.

3. **Simpan balasan JSON dari LLM** ke sebuah file sementara (misalnya `draft.txt` atau `draft.json`).

4. **Jalankan perintah import & validasi otomatis:**
   ```powershell
   npm run article:import -- draft.txt
   ```
   Script `scripts/add-article.mjs` akan otomatis:
   - Mengekstrak blok JSON dari file tersebut,
   - Memvalidasi kelengkapan `expectedTags`, `evidence`, `tagBank`, dan `findFixParagraphs`,
   - Menambahkan (atau memperbarui jika `articleId` sama) ke dalam `src/grammar/articles/custom-articles.json`.

5. **Hapus file sementara `draft.txt` jika sudah selesai.**

---

### Cara B: Mengedit Langsung `src/grammar/articles/custom-articles.json`

Buka `src/grammar/articles/custom-articles.json` dan tambahkan objek baru ke dalam array JSON dengan format berikut:

```json
{
  "articleId": "coffee",
  "articleTitle": "Indonesian Coffee Culture",
  "category": "Kuliner & Gaya Hidup",
  "breakdowns": [
    {
      "id": "coffee-bd-1",
      "sentences": [
        {
          "id": "s1",
          "text": "Coffee beans are grown across many volcanic islands in Indonesia.",
          "expectedTags": ["Present Simple Passive"],
          "evidence": [
            { "phrase": "are grown", "tag": "Present Simple Passive" }
          ],
          "trapHints": {
            "Past Simple Passive": "Kalimat 1 memakai to be masa kini “are + V3”, bukan “were + V3”."
          }
        },
        {
          "id": "s2",
          "text": "Drinking a cup of black coffee in the morning helps many workers stay alert.",
          "expectedTags": ["Gerund (Subjek)", "Present Simple Active"],
          "evidence": [
            { "phrase": "Drinking", "tag": "Gerund (Subjek)" },
            { "phrase": "helps", "tag": "Present Simple Active" }
          ]
        }
      ],
      "tagBank": [
        "Present Simple Passive",
        "Gerund (Subjek)",
        "Present Simple Active",
        "Past Simple Passive",
        "Present Continuous",
        "Verb + To-Infinitive"
      ],
      "spokenSentence": "Coffee beans are grown across many volcanic islands in Indonesia. Drinking a cup of black coffee in the morning helps many workers stay alert.",
      "hint": "Perhatikan pola pasif “are + V3” di Kalimat 1 serta subjek V-ing “Drinking” di Kalimat 2.",
      "explanation": "Kalimat 1 memakai Present Simple Passive (“are grown”). Kalimat 2 memakai Gerund sebagai subjek (“Drinking”) dan Present Simple Active (“helps”)."
    }
  ],
  "findFixParagraphs": [
    {
      "parts": [
        { "text": "Fresh coffee beans " },
        {
          "text": "can be found",
          "spanId": "s1",
          "structure": "Modal + Passive",
          "mutation": {
            "id": "coffee-ff-1",
            "rule": "Modal + Passive (can + be + V3)",
            "wrongText": "can be find",
            "correction": "can be found",
            "spokenSentence": "Fresh coffee beans can be found in almost every traditional market.",
            "hint": "Setelah “can be” pada kalimat pasif, gunakan kata kerja bentuk ke-3 (V3).",
            "explanation": "Pola Modal + Passive adalah “can + be + V3”: ubah “can be find” menjadi “can be found”."
          }
        },
        { "text": " in traditional markets. Many young people enjoy " },
        {
          "text": "visiting",
          "spanId": "s2",
          "structure": "Verb + Gerund",
          "mutation": {
            "id": "coffee-ff-2",
            "rule": "Verb + Gerund (enjoy + V-ing)",
            "wrongText": "to visit",
            "correction": "visiting",
            "spokenSentence": "Many young people enjoy visiting local coffee shops on weekends.",
            "hint": "Kata kerja “enjoy” wajib diikuti oleh gerund (V-ing), bukan to + V1.",
            "explanation": "Setelah “enjoy”, selalu gunakan bentuk V-ing: “enjoy visiting”."
          }
        },
        { "text": " local coffee shops " },
        { "text": "on weekends", "spanId": "s3", "structure": "Preposition + Time" },
        { "text": "." }
      ]
    }
  ]
}
```

---

## 4. Aturan Validasi Penting

Agar artikel baru lolos pemeriksaan `npm run article:validate` dan `npm test`, pastikan:

1. **ID Unik:** Setiap `id` pada `breakdowns` dan `mutation` harus unik di seluruh aplikasi.
2. **Kesesuaian `expectedTags` & `evidence`:**
   - Jumlah item di `evidence` pada setiap kalimat harus **sama persis** dengan jumlah `expectedTags` pada kalimat tersebut.
   - Semua string di dalam `expectedTags` **wajib terdaftar** di dalam `tagBank` (tambahkan juga 2–3 tag pengecoh ke `tagBank` hingga total minimal 6 tag).
3. **Kesesuaian `findFixParagraphs`:**
   - Setiap paragraf minimal memiliki **3 bagian (`parts`) yang memiliki `spanId`**.
   - Field `"text"` pada `parts` selalu ditulis dalam **bahasa Inggris yang benar (clean)**.
   - Field `"wrongText"` di dalam `"mutation"` berisi bentuk yang salah, dan `"correction"` berisi bentuk perbaikannya (boleh menambahkan `"acceptedCorrections": ["...", "..."]` jika ada lebih dari satu variasi jawaban benar).

---

## 5. Daftar Perintah Terminal (CLI)

| Perintah | Fungsi |
| :--- | :--- |
| `npm run article:prompt -- "Topik"` | Mencetak prompt LLM siap pakai untuk membuat artikel baru. |
| `npm run article:import -- <file>` | Memvalidasi dan memasukkan artikel dari file `.json`/`.txt` ke `custom-articles.json`. |
| `npm run article:validate` | Memeriksa apakah isi `src/grammar/articles/custom-articles.json` valid. |
| `npm test` | Menjalankan seluruh *unit test* (`articles`, `basics`, `qa`, `sentence`). |
| `npm run build` | Memvalidasi TypeScript dan membangun bundel PWA offline di folder `dist/`. |


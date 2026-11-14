import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const CUSTOM_JSON_PATH = resolve("src/grammar/articles/custom-articles.json");

function buildPrompt(topic) {
  return `Buatkan 1 entri artikel latihan grammar bahasa Inggris bertema "${topic}" dalam format JSON murni (tanpa teks pengantar) untuk dimasukkan ke dalam array custom-articles.json.

Aturan wajib:
1. "articleId": slug huruf kecil unik (mis. "coffee", "ai-work").
2. "articleTitle": judul bahasa Inggris yang menarik.
3. "category": kategori singkat bahasa Indonesia (mis. "Kuliner & Budaya", "Teknologi & Karier").
4. "breakdowns": minimal 1 objek Bedah Kalimat dengan 2–3 kalimat bahasa Inggris yang 100% grammatically correct:
   - Setiap kalimat ("s1", "s2", ...) punya "expectedTags" (1–2 tag struktur utama) dan "evidence" dengan jumlah yang SAMA PERSIS dengan expectedTags.
   - Semua tag di "expectedTags" WAJIB ada di dalam "tagBank" (tambahkan 2–3 tag pengecoh di "tagBank" sehingga total 6–8 tag).
   - "spokenSentence" berisi gabungan seluruh kalimat di paragraf tersebut.
   - "hint" (>20 karakter) dan "explanation" (>25 karakter) dalam bahasa Indonesia.
5. "findFixParagraphs": minimal 1 objek paragraf Cari & Perbaiki:
   - "parts" berisi potongan kalimat di mana 3–4 bagian memiliki "spanId" ("s1", "s2", "s3", "s4") dan "structure".
   - Field "text" pada setiap part WAJIB berisi teks bahasa Inggris yang BENAR (clean).
   - Pada 2 atau 3 part yang memiliki "spanId", tambahkan objek "mutation" berisi:
     - "id": ID unik (mis. "<articleId>-ff-1")
     - "rule": nama aturan grammar
     - "wrongText": bentuk yang SALAH (jebakan kesalahan umum pembelajar Indonesia)
     - "correction": bentuk yang BENAR (sama dengan "text" pada part tersebut)
     - "spokenSentence": kalimat lengkap yang benar
     - "hint" (>20 karakter) & "explanation" (>25 karakter) dalam bahasa Indonesia.

Contoh struktur JSON yang harus dihasilkan:
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
            "Past Simple Passive": "Kalimat 1 memakai to be masa kini “are + V3 (grown)”, bukan “were grown”."
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
}`;
}

function validateEntry(entry, indexLabel = "entry") {
  const errors = [];
  if (!entry || typeof entry !== "object") {
    return [`${indexLabel}: harus berupa object JSON.`];
  }
  if (!entry.articleId || typeof entry.articleId !== "string") {
    errors.push(`${indexLabel}: "articleId" wajib berupa string.`);
  }
  if (!entry.articleTitle || typeof entry.articleTitle !== "string") {
    errors.push(`${indexLabel}: "articleTitle" wajib berupa string.`);
  }
  if (!entry.category || typeof entry.category !== "string") {
    errors.push(`${indexLabel}: "category" wajib berupa string.`);
  }

  for (const bd of entry.breakdowns ?? []) {
    if (!bd.id) errors.push(`${entry.articleId}: breakdown kehilangan "id".`);
    if (!Array.isArray(bd.sentences) || bd.sentences.length < 2) {
      errors.push(`${bd.id}: "sentences" minimal harus berisi 2 kalimat.`);
    }
    if (!Array.isArray(bd.tagBank) || bd.tagBank.length < 6) {
      errors.push(`${bd.id}: "tagBank" minimal harus berisi 6 tag.`);
    }
    for (const s of bd.sentences ?? []) {
      if (!Array.isArray(s.expectedTags) || s.expectedTags.length === 0) {
        errors.push(`${bd.id} (${s.id}): "expectedTags" tidak boleh kosong.`);
      }
      if (
        !Array.isArray(s.evidence) ||
        s.evidence.length !== (s.expectedTags?.length ?? 0)
      ) {
        errors.push(
          `${bd.id} (${s.id}): jumlah "evidence" harus sama dengan "expectedTags".`,
        );
      }
      for (const tag of s.expectedTags ?? []) {
        if (!bd.tagBank?.includes(tag)) {
          errors.push(
            `${bd.id} (${s.id}): tag "${tag}" tidak ditemukan di dalam "tagBank".`,
          );
        }
      }
    }
  }

  for (const [pIdx, ff] of (entry.findFixParagraphs ?? []).entries()) {
    const spans = (ff.parts ?? []).filter((p) => Boolean(p.spanId));
    if (spans.length < 3) {
      errors.push(
        `${entry.articleId} findFixParagraphs[${pIdx}]: minimal harus memiliki 3 part dengan "spanId".`,
      );
    }
    const mutations = spans.filter((p) => Boolean(p.mutation));
    if (mutations.length === 0) {
      errors.push(
        `${entry.articleId} findFixParagraphs[${pIdx}]: minimal harus ada 1 "mutation".`,
      );
    }
    for (const m of mutations) {
      const mut = m.mutation;
      if (!mut.id || !mut.wrongText || !mut.correction) {
        errors.push(
          `${entry.articleId} (${m.spanId}): mutation wajib memiliki id, wrongText, dan correction.`,
        );
      }
      if (mut.wrongText?.toLowerCase() === mut.correction?.toLowerCase()) {
        errors.push(
          `${mut.id}: wrongText dan correction tidak boleh sama ("${mut.wrongText}").`,
        );
      }
    }
  }

  return errors;
}

function extractJsonFromText(raw) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(candidate);
}

async function main() {
  const args = process.argv.slice(2);
  const flag = args[0];

  if (flag === "--prompt") {
    const topic = args.slice(1).join(" ") || "Topik Pilihan Anda";
    console.log(buildPrompt(topic));
    return;
  }

  const existingRaw = await readFile(CUSTOM_JSON_PATH, "utf8");
  const existing = JSON.parse(existingRaw);

  if (flag === "--import") {
    const inputPath = args[1];
    if (!inputPath) {
      console.error(
        "Gunakan: npm run article:import -- <path-ke-file.json-atau-.txt>",
      );
      process.exit(1);
    }
    const rawInput = await readFile(resolve(inputPath), "utf8");
    const parsed = extractJsonFromText(rawInput);
    const entries = Array.isArray(parsed) ? parsed : [parsed];

    const allErrors = [];
    entries.forEach((e, i) => {
      allErrors.push(...validateEntry(e, `input[${i}]`));
    });

    if (allErrors.length > 0) {
      console.error("Validasi gagal:\n- " + allErrors.join("\n- "));
      process.exit(1);
    }

    for (const newEntry of entries) {
      const idx = existing.findIndex(
        (item) => item.articleId === newEntry.articleId,
      );
      if (idx !== -1) {
        existing[idx] = newEntry;
        console.log(`✓ Memperbarui artikel "${newEntry.articleTitle}" (${newEntry.articleId})`);
      } else {
        existing.push(newEntry);
        console.log(`✓ Menambahkan artikel baru "${newEntry.articleTitle}" (${newEntry.articleId})`);
      }
    }

    await writeFile(
      CUSTOM_JSON_PATH,
      JSON.stringify(existing, null, 2) + "\n",
      "utf8",
    );
    console.log(`Tersimpan di ${CUSTOM_JSON_PATH}`);
    return;
  }

  // Default / --validate
  const errors = [];
  existing.forEach((e, i) => {
    errors.push(...validateEntry(e, `custom-articles[${i}]`));
  });

  if (errors.length > 0) {
    console.error("Ditemukan masalah pada custom-articles.json:\n- " + errors.join("\n- "));
    process.exit(1);
  }

  console.log(
    `✓ custom-articles.json valid (${existing.length} artikel tambahan terdaftar).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


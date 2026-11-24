import { personalSentences } from "../story/personalSentences.js";

export interface ArticleSentence {
  paragraph: string;
  start: number;
  end: number;
}

export interface GrammarHighlight {
  start: number;
  end: number;
  label: string;
  explanation: string;
}

export function splitArticle(text: string): ArticleSentence[] {
  const result: ArticleSentence[] = [];
  for (const paragraph of text.trim().split(/(?:\r?\n[ \t]*){2,}/)) {
    let offset = 0;
    let previous: ArticleSentence | undefined;
    for (const sentence of personalSentences(paragraph)) {
      const start = paragraph.indexOf(sentence, offset);
      offset = start + sentence.length;
      // Keep a quoted question and its reporting clause together.
      if (previous && /[”"’']$/.test(paragraph.slice(previous.end - 1, previous.end))
          && /^(?:(?:she|he|they|I) (?:said|says?|asked|asks?)|(?:said|says|asked|asks)\b)/.test(sentence)) {
        previous.end = offset;
      } else {
        previous = { paragraph, start, end: offset };
        result.push(previous);
      }
    }
  }
  return result;
}

export function sentenceRequest({ paragraph, start, end }: ArticleSentence) {
  const from = Math.max(0, start - 1000);
  return { paragraph: paragraph.slice(from, end + 1000), start: start - from, end: end - from };
}

const sample = [
  {
    text: "The director has spoken about her new film.",
    notes: [
      { phrase: "has spoken", label: "Present Perfect", explanation: "Sutradara sudah berbicara tentang filmnya. Bentuk has + spoken menghubungkan pernyataan sebelumnya dengan kabar yang sedang dibahas." },
    ],
  },
  {
    text: "The film will see Maya share what she learned from climbing.",
    notes: [
      { phrase: "will see", label: "Modal will + bentuk dasar", explanation: "Will diikuti bentuk dasar see. Dalam konteks ini, penulis memperkenalkan apa yang akan ditampilkan di film." },
      { phrase: "see Maya share", label: "See + objek + bentuk dasar", explanation: "Maya adalah orang yang berbagi pengalaman. Dalam pola see + Maya + share, kata share memakai bentuk dasar tanpa to atau akhiran -s." },
      { phrase: "from climbing", label: "Preposisi + gerund", explanation: "Setelah preposisi from, climbing menyebut kegiatan yang menjadi sumber pelajaran bagi Maya." },
    ],
  },
];

export const sampleArticle = sample.map(row => row.text).join(" ");

export function sampleHighlights(index: number): GrammarHighlight[] {
  const { text, notes } = sample[index];
  return notes.map(({ phrase, label, explanation }) => {
    const start = text.indexOf(phrase);
    return { start, end: start + phrase.length, label, explanation };
  });
}

// One tap target per overlapping group keeps the original sentence readable.
export function highlightGroups(highlights: GrammarHighlight[]) {
  const groups: { start: number; end: number; notes: GrammarHighlight[] }[] = [];
  for (const note of highlights) {
    const last = groups[groups.length - 1];
    if (last && note.start < last.end) {
      last.end = Math.max(last.end, note.end);
      last.notes.push(note);
    } else {
      groups.push({ start: note.start, end: note.end, notes: [note] });
    }
  }
  return groups;
}

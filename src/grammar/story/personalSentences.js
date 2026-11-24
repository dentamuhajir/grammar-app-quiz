// Keep punctuation with its sentence so the tutor and learner see the same text.
export function personalSentences(story) {
  const sentences = [];
  let start = 0;
  for (const match of story.matchAll(/[.!?]+["'”’)]*/g)) {
    const end = match.index + match[0].length;
    if (match[0] === ".") {
      if (/\d/.test(story[end - 2] ?? "") && /\d/.test(story[end] ?? "")) continue;
      if (/\b(?:Mr|Mrs|Ms|Dr|Prof|e\.g|i\.e)$/i.test(story.slice(start, end - 1)) && story.slice(end).trim()) continue;
      if (/[A-Za-z]/.test(story[end] ?? "") && story[end + 1] === ".") continue;
    }
    const sentence = story.slice(start, end).trim();
    if (sentence) sentences.push(sentence);
    start = end;
  }
  const tail = story.slice(start).trim();
  if (tail) sentences.push(tail);
  return sentences;
}

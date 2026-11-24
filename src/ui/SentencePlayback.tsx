import { sentenceReading } from "../grammar/sentenceReadings";
import type { Question } from "../grammar/types";
import { SpokenSentence } from "./SpokenSentence";

export function SentencePlayback({ text, question }: { text: string; question?: Question }) {
  const reading = sentenceReading(text, question);
  return <>
    <SpokenSentence text={text} highlightWord={question?.relativeClause?.pronoun} />
    <details key={text} className="sentence-reading-guide">
      <summary>Cara baca</summary>
      <p>{reading ?? "Cara baca kalimat ini belum tersedia."}</p>
    </details>
  </>;
}

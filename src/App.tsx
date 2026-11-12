import { useState } from "react";
import { PRACTICE_LABELS } from "./grammar/labels";
import { QAPractice } from "./ui/QAPractice";
import { BasicsPractice } from "./ui/BasicsPractice";
import { SentencePractice } from "./ui/SentencePractice";

export default function App() {
  const [practice, setPractice] = useState<keyof typeof PRACTICE_LABELS>("sentences");
  return (
    <div className="page">
      <header className="header">
        <h1 className="brand">Grammar <span className="brand-accent">Drill</span></h1>
      </header>
      <nav className="practice-switch" aria-label="Mode latihan">
        {(Object.keys(PRACTICE_LABELS) as Array<keyof typeof PRACTICE_LABELS>).map((mode) => (
          <button key={mode} type="button" aria-pressed={practice === mode}
            onClick={() => setPractice(mode)}>{PRACTICE_LABELS[mode]}</button>
        ))}
      </nav>
      {practice === "sentences" ? <SentencePractice /> : practice === "basics" ? <BasicsPractice /> : <QAPractice />}
    </div>
  );
}

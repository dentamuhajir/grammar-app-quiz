export function SwipeGuide({direction, progress, blocked}: {
  direction: "left" | "right" | null;
  progress: number;
  blocked: boolean;
}) {
  return <>
    <div className="swipe-guide" aria-label="Geser kartu ke kiri untuk Skip Soal, ke kanan untuk Materi">
      <span>← Skip Soal</span><small>Geser kartu</small><span>Materi →</span>
    </div>
    {direction && <div className={`swipe-feedback swipe-feedback-${direction} ${blocked ? "is-blocked" : ""}`}
      role="status" aria-live="polite">
      <strong>{direction === "left" ? "← Skip Soal" : "Materi →"}</strong>
      <span>{blocked ? "Selesaikan atau hapus draft untuk skip"
        : progress >= 1 ? "Lepaskan untuk melanjutkan" : "Geser sedikit lagi"}</span>
      <div className="swipe-feedback-meter"><i style={{transform: `scaleX(${progress})`}} /></div>
    </div>}
  </>;
}

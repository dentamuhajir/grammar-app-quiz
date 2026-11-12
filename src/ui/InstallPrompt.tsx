import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowGuide(false);
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return;
    }
    setShowGuide((v) => !v);
  }

  if (installed && !offline) return null;

  return (
    <div className="pwa-bar">
      <div className="pwa-bar-row">
        {offline && (
          <span className="tag tag-tense" role="status">
            ⚡ Mode Offline Aktif
          </span>
        )}
        {!installed && (
          <button
            type="button"
            className="pwa-install-btn"
            onClick={handleInstallClick}
          >
            ⬇ {deferredPrompt ? "Install Aplikasi (Offline)" : "Pakai Offline / Install"}
          </button>
        )}
      </div>
      {showGuide && !installed && (
        <div className="pwa-guide" role="region" aria-label="Panduan instalasi offline">
          <p>
            <strong>Siap digunakan offline!</strong> Seluruh materi sudah tersimpan otomatis di browser ini. Untuk memasangnya sebagai aplikasi di layar utama:
          </p>
          <ul>
            <li>
              <strong>Android / Laptop (Chrome &amp; Edge):</strong> Klik ikon{" "}
              <strong>Install (⊕)</strong> di kolom alamat atas atau menu{" "}
              <strong>⋮ → Install app / Tambahkan ke Layar Utama</strong>.
            </li>
            <li>
              <strong>iPhone / iPad (Safari):</strong> Ketuk tombol{" "}
              <strong>Share</strong> lalu pilih{" "}
              <strong>Add to Home Screen</strong>.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

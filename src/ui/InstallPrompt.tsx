import { useEffect, useState } from "react";
import { BottomSheet } from "./BottomSheet";

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
    setShowGuide(true);
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
            <svg
              className="pwa-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Install Aplikasi Offline</span>
          </button>
        )}
      </div>

      <BottomSheet
        open={showGuide && !installed}
        onClose={() => setShowGuide(false)}
        title="Install Aplikasi Offline"
      >
        <div className="pwa-guide">
          <p>
            <strong>Siap digunakan 100% offline!</strong> Seluruh soal dan
            materi sudah tersimpan otomatis di perangkat ini. Untuk memasangnya
            seperti aplikasi di layar utama:
          </p>
          <ul>
            <li>
              <strong>Android / Laptop (Chrome &amp; Edge):</strong> Klik ikon{" "}
              <strong>Install (⊕)</strong> di kolom alamat atas atau buka menu{" "}
              <strong>⋮ → Install app / Tambahkan ke Layar Utama</strong>.
            </li>
            <li>
              <strong>iPhone / iPad (Safari):</strong> Ketuk tombol{" "}
              <strong>Share</strong> di bawah lalu pilih{" "}
              <strong>Add to Home Screen</strong>.
            </li>
          </ul>
        </div>
      </BottomSheet>
    </div>
  );
}

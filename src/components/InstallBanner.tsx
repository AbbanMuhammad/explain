import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    setDismissed(true);
  };

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-primary text-primary-foreground rounded-xl p-4 shadow-lg flex items-center gap-3 animate-fade-in">
      <Download className="w-6 h-6 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Install ExplainIt</p>
        <p className="text-xs opacity-90">Add to home screen for quick access — even offline!</p>
      </div>
      <Button size="sm" variant="secondary" onClick={handleInstall} className="shrink-0 font-semibold">
        Install
      </Button>
      <button onClick={() => setDismissed(true)} className="p-1 opacity-70 hover:opacity-100" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default InstallBanner;

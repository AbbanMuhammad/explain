import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

const UpdateBanner = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onControllerChange = () => window.location.reload();

    navigator.serviceWorker.ready.then((registration) => {
      // Check if there's already a waiting worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShow(true);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShow(true);
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  const handleUpdate = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-primary text-primary-foreground rounded-xl p-4 shadow-lg flex items-center gap-3 animate-fade-in">
      <RefreshCw className="w-6 h-6 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Update Available</p>
        <p className="text-xs opacity-90">A new version of ExplainIt is ready!</p>
      </div>
      <Button size="sm" variant="secondary" onClick={handleUpdate} className="shrink-0 font-semibold">
        Update
      </Button>
      <button onClick={() => setShow(false)} className="p-1 opacity-70 hover:opacity-100" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UpdateBanner;

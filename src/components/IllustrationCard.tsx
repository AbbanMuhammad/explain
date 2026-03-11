import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface IllustrationCardProps {
  topic: string;
  visible: boolean;
}

const IllustrationCard = ({ topic, visible }: IllustrationCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generateImage = useCallback(async (currentTopic: string) => {
    if (!currentTopic) return;
    setLoading(true);
    setError(false);
    setImageUrl(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ topic: currentTopic }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!resp.ok) {
        console.error("Image generation error:", resp.status);
        setError(true);
        return;
      }

      const data = await resp.json();
      if (data?.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        setError(true);
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e?.name === "AbortError") {
        console.error("Image generation timed out");
      } else {
        console.error("Image generation failed:", e);
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible && topic) {
      generateImage(topic);
    }
  }, [topic, visible, generateImage]);

  const handleRegenerate = useCallback(() => {
    if (topic) generateImage(topic);
  }, [topic, generateImage]);

  if (!visible || !topic) return null;

  return (
    <section className="max-w-2xl mx-auto px-4 pb-6 md:pb-8">
      <div className="bg-secondary/50 rounded-2xl border border-primary/10 p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-bold text-primary">
            Visual Illustration
          </h3>
        </div>

        <div className="relative w-full rounded-xl overflow-hidden border border-border">
          {loading && (
            <div className="w-full aspect-video rounded-xl flex flex-col items-center justify-center bg-muted gap-3">
              <Skeleton className="w-full h-full absolute inset-0 rounded-xl" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground font-medium">Generating realistic image…</p>
              </div>
            </div>
          )}
          {error && !loading && (
            <div className="w-full aspect-video flex items-center justify-center bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground">Could not generate illustration. Try again.</p>
            </div>
          )}
          {imageUrl && !loading && (
            <img
              src={imageUrl}
              alt={`Realistic illustration about ${topic}`}
              className="w-full aspect-video object-cover rounded-xl"
            />
          )}
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={loading}
            className="gap-2 w-full sm:w-auto h-10 text-sm font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Generating…" : "Regenerate Image"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IllustrationCard;

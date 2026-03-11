import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Volume2, Square, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExplanationCardProps {
  explanation: string;
  isStreaming: boolean;
  onSimplify: () => void;
  isSimplifying: boolean;
}

const ExplanationCard = ({
  explanation,
  isStreaming,
  onSimplify,
  isSimplifying,
}: ExplanationCardProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        const englishVoices = available.filter((v) => v.lang.startsWith("en"));
        const sorted = englishVoices.length > 0 ? englishVoices : available;
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        setVoices(sorted);
        if (!selectedVoiceURI && sorted.length > 0) {
          const defaultVoice = sorted.find((v) => v.default) || sorted[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceURI]);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!explanation) stopSpeech();
  }, [explanation, stopSpeech]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      return;
    }
    const plainText = explanation.replace(/[#*_`~>\-\[\]()!]/g, "");
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 0.9;

    const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  if (!explanation && !isStreaming) return null;

  const showLoadingState = isStreaming && !explanation;

  return (
    <section className="max-w-2xl mx-auto px-4 pb-6 md:pb-8">
      <div className="bg-secondary/50 rounded-2xl border border-primary/10 p-5 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-primary">📖 Explanation</h3>
          {explanation && !isStreaming && (
            <div className="flex items-center gap-2">
              {voices.length > 1 && (
                <Select value={selectedVoiceURI} onValueChange={setSelectedVoiceURI}>
                  <SelectTrigger className="h-9 w-[140px] sm:w-[180px] text-xs">
                    <SelectValue placeholder="Choose voice" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {voices.map((v) => (
                      <SelectItem key={v.voiceURI} value={v.voiceURI} className="text-xs">
                        {v.name.replace(/^(Microsoft |Google |Apple )/, "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={handleSpeak}
                className={`h-9 w-9 rounded-full transition-colors ${
                  isSpeaking
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground"
                    : ""
                }`}
                title={isSpeaking ? "Stop reading" : "Read aloud"}
              >
                {isSpeaking ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {showLoadingState && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 animate-fade-in">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm sm:text-base font-semibold text-muted-foreground animate-pulse">
              {isSimplifying ? "Simplifying for you..." : "Generating your explanation..."}
            </p>
          </div>
        )}

        {explanation && (
          <div className="prose prose-sm max-w-none text-foreground leading-[1.8] text-[0.9375rem] [&>p]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>h1]:mt-6 [&>h2]:mt-5 [&>h3]:mt-4 [&>h1]:mb-3 [&>h2]:mb-2 [&>h3]:mb-2">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                    {children}
                  </a>
                ),
              }}
            >
              {explanation}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 rounded-sm" />
            )}
          </div>
        )}
        {!isStreaming && explanation && (
          <div className="mt-5 sm:mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onSimplify}
              disabled={isSimplifying}
              className="gap-2 w-full sm:w-auto h-11 text-sm sm:text-base font-semibold"
            >
              {isSimplifying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              Explain it simpler
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExplanationCard;

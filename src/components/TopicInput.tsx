import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Loader2, Mic, X } from "lucide-react";

const CLASS_LEVELS = ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6", "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
const SUBJECTS = ["Mathematics", "English", "Biology", "Chemistry", "Physics", "Civic Education", "Others"];

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface TopicInputProps {
  onSubmit: (topic: string, classLevel: string, subject: string) => void;
  isLoading: boolean;
}

const TopicInput = ({ onSubmit, isLoading }: TopicInputProps) => {
  const [topic, setTopic] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const supportsSpeech = !!SpeechRecognition;

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-NG";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTopic((prev) => (prev ? prev + " " + transcript : transcript));
      setUsedVoice(true);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const handleSubmit = () => {
    if (!topic.trim()) return;
    if (!usedVoice && !classLevel) return;
    onSubmit(topic.trim(), classLevel || "Not specified", subject || "Not specified");
  };

  return (
    <section className="max-w-2xl mx-auto px-4 pb-6 md:pb-8">
      <div className="bg-card rounded-xl border p-4 sm:p-6 shadow-sm space-y-4">
        <label className="text-sm sm:text-base font-semibold text-foreground">
          What topic do you want to learn about?
        </label>
        <div className="relative">
          <Textarea
            placeholder="e.g. Photosynthesis, Quadratic Equations, The Nigerian Civil War..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[90px] resize-none text-base pr-14"
          />
          {supportsSpeech && (
            <div className="absolute top-2 right-2 flex gap-1">
              {isListening ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={stopListening}
                  className="h-9 w-9 text-destructive hover:text-destructive"
                  title="Stop listening"
                >
                  <X className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={startListening}
                  className="h-9 w-9 text-muted-foreground hover:text-primary"
                  title="Speak your question"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-sm text-destructive font-medium animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            Listening… speak now
          </div>
        )}

        {!supportsSpeech && (
          <p className="text-xs text-muted-foreground">
            Voice input not supported on this browser — please type your question.
          </p>
        )}

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Subject</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <Button
                key={s}
                type="button"
                variant={subject === s ? "default" : "outline"}
                size="sm"
                onClick={() => setSubject(subject === s ? "" : s)}
                className="rounded-full text-sm"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Select value={classLevel} onValueChange={setClassLevel}>
            <SelectTrigger className="w-full sm:w-44 h-12 text-base">
              <SelectValue placeholder="Select class level" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_LEVELS.map((level) => (
                <SelectItem key={level} value={level} className="text-base py-2.5">
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleSubmit}
            disabled={!topic.trim() || (!usedVoice && !classLevel) || isLoading}
            className="w-full h-12 text-base font-semibold gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isLoading ? "Getting explanation..." : "Explain it!"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopicInput;

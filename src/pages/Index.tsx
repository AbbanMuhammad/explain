import { useState, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import TopicInput from "@/components/TopicInput";
import ExplanationCard from "@/components/ExplanationCard";
import QuizSection from "@/components/QuizSection";
import OfflineBanner from "@/components/OfflineBanner";
import { streamExplanation, generateQuiz } from "@/lib/streamChat";
import type { MCQ, DescriptiveQ } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, WifiOff } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { saveExplanation } from "@/lib/savedExplanations";
import { supabase } from "@/integrations/supabase/client";
import AnalyticsSection from "@/components/AnalyticsSection";

const Index = () => {
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const [explanation, setExplanation] = useState("");
  const [fullExplanation, setFullExplanation] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [descriptive, setDescriptive] = useState<DescriptiveQ[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentClass, setCurrentClass] = useState("");
  const [currentSubject, setCurrentSubject] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  const fetchExplanation = useCallback(
    async (topic: string, classLevel: string, simpler: boolean) => {
      setIsStreaming(true);
      setShowQuiz(false);
      setMcqs([]);
      setDescriptive([]);
      if (!simpler) {
        setExplanation("");
      } else {
        setExplanation("");
        setIsSimplifying(true);
      }

      let fullText = "";

      try {
        await streamExplanation({
          topic,
          classLevel,
          simpler,
          onDelta: (chunk) => {
            fullText += chunk;
            setExplanation(fullText);
          },
          onDone: () => {
            setIsStreaming(false);
            setIsSimplifying(false);
            setFullExplanation(fullText);
            saveExplanation(topic, classLevel, fullText);
          },
        });
      } catch (e) {
        console.error("Explanation error:", e);
        setIsStreaming(false);
        setIsSimplifying(false);
        toast({
          title: "Something went wrong",
          description: e instanceof Error ? e.message : "Could not get explanation",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const handleReadyForQuiz = useCallback(async () => {
    if (!currentTopic || !currentClass || !fullExplanation) return;
    setShowQuiz(true);
    setQuizLoading(true);
    try {
      const quiz = await generateQuiz({
        topic: currentTopic,
        classLevel: currentClass,
        explanation: fullExplanation,
      });
      setMcqs(quiz.mcqs || []);
      setDescriptive(quiz.descriptive || []);
    } catch (e) {
      console.error("Quiz generation error:", e);
      toast({
        title: "Quiz generation failed",
        description: e instanceof Error ? e.message : "Could not generate quiz",
        variant: "destructive",
      });
    } finally {
      setQuizLoading(false);
    }
  }, [currentTopic, currentClass, fullExplanation, toast]);

  const handleSubmit = (topic: string, classLevel: string, subject: string) => {
    const fullTopic = subject && subject !== "Not specified" ? `${topic} (${subject})` : topic;
    setCurrentTopic(fullTopic);
    setCurrentClass(classLevel);
    setCurrentSubject(subject || "Not specified");
    fetchExplanation(fullTopic, classLevel, false);

    supabase
      .from("questions")
      .insert({
        question_text: topic.trim(),
        subject: subject || "Not specified",
        class_level: classLevel || "JSS1",
      })
      .then(({ error }) => {
        if (error) console.error("Failed to save question:", error);
      });
  };

  const handleSimplify = () => {
    if (currentTopic && currentClass) {
      fetchExplanation(currentTopic, currentClass, true);
    }
  };

  const showReadyButton = !isStreaming && explanation && !showQuiz;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {!isOnline && <OfflineBanner />}
      <div id="home">
        <HeroSection />
      </div>

      <section className="max-w-2xl mx-auto px-4 py-6 sm:py-8 text-center">
        <div className="bg-accent/50 border border-primary/20 rounded-xl p-5 sm:p-6">
          <p className="text-base sm:text-lg font-bold text-foreground mb-1">
            🎓 Built for Primary &amp; Secondary School Students
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            ExplainIt is designed specifically for secondary school students (JSS1–SS3). All explanations
            and quizzes are tailored to your level — no university jargon, just simple learning!
          </p>
        </div>
      </section>

      <HowItWorks />
      <div id="ask-topic">
        {isOnline ? (
          <TopicInput onSubmit={handleSubmit} isLoading={isStreaming} />
        ) : (
          <section className="max-w-2xl mx-auto px-4 pb-6 md:pb-8 text-center">
            <div className="bg-muted rounded-xl border border-border p-6 flex flex-col items-center gap-2">
              <WifiOff className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Connect to the internet to get new explanations.
              </p>
            </div>
          </section>
        )}
      </div>
      <ExplanationCard
        explanation={explanation}
        isStreaming={isStreaming}
        onSimplify={handleSimplify}
        isSimplifying={isSimplifying}
      />
      {showReadyButton && (
        <section className="max-w-2xl mx-auto px-4 pb-6 md:pb-8">
          <Button
            onClick={handleReadyForQuiz}
            disabled={quizLoading}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 text-base rounded-xl"
          >
            {quizLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <BookOpen className="w-5 h-5" />
            )}
            I've read and understood — Test me! 📝
          </Button>
        </section>
      )}
      {showQuiz && (
        <QuizSection
          mcqs={mcqs}
          descriptive={descriptive}
          isLoading={quizLoading}
          topic={currentTopic}
          classLevel={currentClass}
        />
      )}
      <AnalyticsSection />

      <div className="w-full border-t border-border" />

      <footer className="w-full text-center py-8 sm:py-10 px-4" style={{ backgroundColor: 'hsl(153, 100%, 16%)', color: 'white' }}>
        <p className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">
          ExplainIt
        </p>
        <p className="text-sm sm:text-base opacity-90 mb-4">
          Explaining every topic, simply.
        </p>
        <p className="text-xs sm:text-sm opacity-70 mb-4">
          Built for the <a href="https://3mtt.nitda.gov.ng" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-80 transition-opacity" style={{ color: 'hsl(153, 80%, 50%)' }}>3MTT</a> NextGen Knowledge Showcase
        </p>
        <p className="text-xs opacity-50">© {new Date().getFullYear()} ExplainIt. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { streamCheckAnswer } from "@/lib/streamChat";
import type { MCQ, DescriptiveQ } from "@/lib/streamChat";

interface QuizSectionProps {
  mcqs: MCQ[];
  descriptive: DescriptiveQ[];
  isLoading: boolean;
  topic: string;
  classLevel: string;
}

const optionLabels = ["A", "B", "C", "D"] as const;

const QuizSection = ({ mcqs, descriptive, isLoading, topic, classLevel }: QuizSectionProps) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [descriptiveAnswers, setDescriptiveAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [checkingIndex, setCheckingIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <section className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-card rounded-xl border p-6 shadow-sm flex items-center gap-3 justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating quiz questions...
        </div>
      </section>
    );
  }

  if (mcqs.length === 0) return null;

  const selectAnswer = (qIndex: number, option: string) => {
    if (selectedAnswers[qIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const submitDescriptive = async (qIndex: number) => {
    const answer = descriptiveAnswers[qIndex]?.trim();
    if (!answer) return;

    setCheckingIndex(qIndex);
    setFeedback((prev) => ({ ...prev, [qIndex]: "" }));

    let fullFeedback = "";
    try {
      await streamCheckAnswer({
        question: descriptive[qIndex].question,
        studentAnswer: answer,
        topic,
        classLevel,
        onDelta: (chunk) => {
          fullFeedback += chunk;
          setFeedback((prev) => ({ ...prev, [qIndex]: fullFeedback }));
        },
        onDone: () => {
          setCheckingIndex(null);
        },
      });
    } catch (e) {
      console.error("Check answer error:", e);
      setFeedback((prev) => ({
        ...prev,
        [qIndex]: "❌ Could not check your answer. Please try again.",
      }));
      setCheckingIndex(null);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 pb-10 md:pb-12 space-y-6 md:space-y-8">
      {/* MCQs */}
      <div className="bg-card rounded-xl border p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-bold text-primary mb-6">🧠 Test Your Understanding</h3>
        <div className="space-y-6">
          {mcqs.map((mcq, i) => {
            const selected = selectedAnswers[i];
            const isAnswered = selected !== undefined;

            return (
              <div key={i} className="space-y-3">
                <p className="font-semibold text-foreground text-sm sm:text-base">
                  {i + 1}. {mcq.question}
                </p>
                <div className="grid gap-2.5">
                  {optionLabels.map((label) => {
                    const isCorrect = mcq.correct === label;
                    const isSelected = selected === label;
                    let optionClass =
                      "w-full text-left px-4 py-3 sm:py-2.5 rounded-lg border text-sm sm:text-base transition-colors min-h-[44px] ";

                    if (!isAnswered) {
                      optionClass += "hover:bg-accent hover:border-primary/30 cursor-pointer";
                    } else if (isCorrect) {
                      optionClass += "bg-primary/10 border-primary text-primary font-medium";
                    } else if (isSelected && !isCorrect) {
                      optionClass += "bg-destructive/10 border-destructive text-destructive";
                    } else {
                      optionClass += "opacity-50";
                    }

                    return (
                      <button
                        key={label}
                        onClick={() => selectAnswer(i, label)}
                        disabled={isAnswered}
                        className={optionClass}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-bold">{label}.</span>
                          {mcq.options[label]}
                          {isAnswered && isCorrect && (
                            <CheckCircle className="w-4 h-4 text-primary ml-auto shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-destructive ml-auto shrink-0" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {isAnswered && (
                  <p className="text-xs text-muted-foreground">
                    {selected === mcq.correct
                      ? "✅ Correct! Well done!"
                      : `❌ The correct answer is ${mcq.correct}. ${mcq.options[mcq.correct as keyof typeof mcq.options]}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Score Summary */}
        {mcqs.length > 0 && Object.keys(selectedAnswers).length === mcqs.length && (() => {
          const correct = mcqs.filter((mcq, i) => selectedAnswers[i] === mcq.correct).length;
          const total = mcqs.length;
          const ratio = correct / total;
          const message = ratio === 1
            ? "🎉 Perfect score! Amazing work!"
            : ratio >= 0.7
            ? "👏 Great job! You're doing well!"
            : ratio >= 0.4
            ? "💪 Good effort! Keep practising!"
            : "📚 Don't worry — review the explanation and try again!";

          return (
            <div className="mt-6 rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-center space-y-2">
              <p className="text-2xl font-bold text-primary">
                {correct} / {total}
              </p>
              <p className="text-sm font-semibold text-foreground">{message}</p>
              <p className="text-xs text-muted-foreground">
                You answered {correct} out of {total} questions correctly
              </p>
            </div>
          );
        })()}
      </div>

      {/* Descriptive Questions */}
      {descriptive.length > 0 && (
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="text-lg font-bold text-primary mb-6">✍️ Explain In Your Own Words</h3>
          <div className="space-y-6">
            {descriptive.map((dq, i) => {
              const hasFeedback = feedback[i] !== undefined && feedback[i] !== "";
              const isChecking = checkingIndex === i;

              return (
                <div key={i} className="space-y-3">
                  <p className="font-semibold text-foreground text-sm">
                    {i + 1}. {dq.question}
                  </p>
                  <Textarea
                    placeholder="Type your answer here..."
                    value={descriptiveAnswers[i] || ""}
                    onChange={(e) =>
                      setDescriptiveAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                    }
                    disabled={hasFeedback || isChecking}
                    className="min-h-[100px] resize-none"
                  />
                  {!hasFeedback && !isChecking && (
                    <Button
                      onClick={() => submitDescriptive(i)}
                      disabled={!descriptiveAnswers[i]?.trim()}
                      size="sm"
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Answer
                    </Button>
                  )}
                  {isChecking && !hasFeedback && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking your answer...
                    </div>
                  )}
                  {hasFeedback && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="text-xs font-semibold text-primary mb-2">📝 Tutor Feedback</p>
                      <div className="prose prose-sm max-w-none text-foreground text-sm">
                        <ReactMarkdown>{feedback[i]}</ReactMarkdown>
                        {isChecking && (
                          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 rounded-sm" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default QuizSection;

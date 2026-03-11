import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, MessageCircleQuestion, BookOpen } from "lucide-react";

interface AnalyticsData {
  totalQuestions: number;
  topQuestions: { text: string; count: number }[];
  topSubjects: { subject: string; count: number }[];
}

const AnalyticsSection = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalQuestions: 0,
    topQuestions: [],
    topSubjects: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { count } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true });

      const { data: rows } = await supabase
        .from("questions")
        .select("question_text, subject");

      const questionCounts: Record<string, number> = {};
      const subjectCounts: Record<string, number> = {};

      (rows ?? []).forEach((r: any) => {
        const q = r.question_text?.toLowerCase().trim();
        if (q) questionCounts[q] = (questionCounts[q] || 0) + 1;
        const s = r.subject;
        if (s && s !== "Not specified") subjectCounts[s] = (subjectCounts[s] || 0) + 1;
      });

      const topQuestions = Object.entries(questionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([text, count]) => ({ text, count }));

      const topSubjects = Object.entries(subjectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([subject, count]) => ({ subject, count }));

      setData({
        totalQuestions: count ?? 0,
        topQuestions,
        topSubjects,
      });
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const maxSubjectCount = Math.max(...data.topSubjects.map((s) => s.count), 1);

  return (
    <section className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-1">
          ExplainIt in Numbers
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          See how students are learning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-accent/60 border border-primary/20 rounded-xl p-5 sm:p-6 flex flex-col items-center text-center">
          <MessageCircleQuestion className="w-8 h-8 text-primary mb-3" />
          <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Total Questions Asked
          </p>
          {loading ? (
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold text-primary">
              {data.totalQuestions.toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-accent/60 border border-primary/20 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
            <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Most Frequent Questions
            </p>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-5 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : data.topQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No questions yet</p>
          ) : (
            <ol className="space-y-1.5 text-sm">
              {data.topQuestions.map((q, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                  <span className="text-foreground capitalize line-clamp-1">{q.text}</span>
                  <span className="ml-auto text-muted-foreground text-xs shrink-0">×{q.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="bg-accent/60 border border-primary/20 rounded-xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
            <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Popular Subjects
            </p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : data.topSubjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">No subjects yet</p>
          ) : (
            <div className="space-y-3">
              {data.topSubjects.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">{s.subject}</span>
                    <span className="text-muted-foreground text-xs">{s.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(s.count / maxSubjectCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;

import { useState, useEffect } from "react";
import { getSavedExplanations, deleteExplanation, type SavedExplanation } from "@/lib/savedExplanations";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Trash2, BookOpen, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const Saved = () => {
  const [explanations, setExplanations] = useState<SavedExplanation[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setExplanations(getSavedExplanations());
  }, []);

  const handleDelete = (id: string) => {
    deleteExplanation(id);
    setExplanations(getSavedExplanations());
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mb-2 flex items-center gap-2">
          <BookOpen className="w-7 h-7" /> Saved Explanations
        </h1>
        <p className="text-muted-foreground mb-6">All your previously generated explanations, available offline.</p>

        {explanations.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No saved explanations yet.</p>
            <p className="text-sm mt-1">Explanations are automatically saved when generated.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {explanations.map((item) => (
              <div key={item.id} className="bg-secondary/50 rounded-xl border border-primary/10 p-4 sm:p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className="text-left w-full"
                    >
                      <h3 className="font-bold text-primary text-sm sm:text-base truncate">{item.topic}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.classLevel} · {new Date(item.savedAt).toLocaleDateString()}
                      </p>
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {expanded === item.id && (
                  <div className="mt-4 pt-3 border-t border-primary/10 prose prose-sm max-w-none text-foreground leading-[1.8] text-[0.875rem]">
                    <ReactMarkdown>{item.explanation}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;

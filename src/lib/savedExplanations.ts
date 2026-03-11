export interface SavedExplanation {
  id: string;
  topic: string;
  classLevel: string;
  explanation: string;
  savedAt: string;
}

const STORAGE_KEY = "explainit-saved-explanations";

export const getSavedExplanations = (): SavedExplanation[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveExplanation = (topic: string, classLevel: string, explanation: string) => {
  const saved = getSavedExplanations();
  const exists = saved.some((s) => s.topic === topic && s.classLevel === classLevel);
  if (exists) {
    const updated = saved.map((s) =>
      s.topic === topic && s.classLevel === classLevel
        ? { ...s, explanation, savedAt: new Date().toISOString() }
        : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return;
  }
  saved.unshift({
    id: crypto.randomUUID(),
    topic,
    classLevel,
    explanation,
    savedAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
};

export const deleteExplanation = (id: string) => {
  const saved = getSavedExplanations().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
};

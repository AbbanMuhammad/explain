import { BookOpen, Users, Lightbulb } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "The Problem",
    text: "Many secondary school students in Nigeria struggle to understand difficult topics because textbook explanations are too complex and teachers are not always available for one-on-one help.",
  },
  {
    icon: Users,
    title: "Who It's For",
    text: "ExplainIt is built for primary, Junior to Senior Secondary Students who want clear, simple explanations of any subject topic — anytime, anywhere.",
  },
  {
    icon: Lightbulb,
    title: "What It Does",
    text: "Type in any topic or question, select your class level, and get an instant explanation written in plain, easy-to-understand language — like a personal tutor in your pocket.",
  },
];

const HeroSection = () => (
  <section className="py-8 px-4 md:py-20">
    <div className="max-w-4xl mx-auto text-center mb-8 md:mb-12">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-2 md:mb-3 tracking-tight">
        ExplainIt 📚
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
        Explaining every topic, simply.
      </p>
    </div>
    <div className="max-w-5xl mx-auto grid gap-4 md:gap-6 md:grid-cols-3">
      {features.map((f) => (
        <div
          key={f.title}
          className="bg-card rounded-xl border p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-lg bg-accent flex items-center justify-center mb-3 md:mb-4">
            <f.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-foreground mb-1.5 md:mb-2">{f.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HeroSection;

import { GraduationCap, MessageSquareText, Zap, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: MessageSquareText,
    title: "Type Your Topic",
    description: "Enter any topic or question — like Photosynthesis, Quadratic Equations, etc",
  },
  {
    icon: GraduationCap,
    title: "Choose Your Class",
    description: "Choose your class level from JSS 1 to SS 3 to receive explanations and content tailored to your academic level.",
  },
  {
    icon: Zap,
    title: "Get Your Explanation",
    description: "Receive a simple, clear explanation instantly — like having a personal tutor!",
  },
  {
    icon: ClipboardCheck,
    title: "Test Your Understanding",
    description: "Take a quick quiz to make sure you truly understood the topic.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
          How It Works
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Four simple steps to understanding any topic
        </p>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {steps.map((step, i) => (
          <div
            key={i}
            className="relative bg-card border rounded-xl p-5 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <step.icon className="w-6 h-6" />
            </div>
            <span className="absolute top-3 left-3 text-xs font-bold text-muted-foreground bg-muted rounded-full h-6 w-6 flex items-center justify-center">
              {i + 1}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;

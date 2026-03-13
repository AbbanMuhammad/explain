import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const links = [
    { label: "Home", href: "#home" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About", href: "#about" },
    { label: "Ask a Topic", href: "#ask-topic" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14 sm:h-16">
        <a href="#home" className="flex items-center gap-1.5 text-primary font-extrabold text-lg sm:text-xl tracking-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <img src="/logo.svg" alt="ExplainIt logo" className="w-8 h-8 sm:w-9 sm:h-9" />
          ExplainIt
        </a>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              to="/saved"
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors inline-flex items-center gap-1"
            >
              <Save className="w-4 h-4" /> Saved
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 pb-4 pt-2 space-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors min-h-[44px] flex items-center"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/saved"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-primary hover:bg-accent transition-colors min-h-[44px] flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Saved Explanations
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

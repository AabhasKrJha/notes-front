"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ShieldCheck, Sparkles, BarChart4 } from "lucide-react";

const BRAND = "Notes App";

const features = [
  {
    title: "Secure Authentication",
    description: "JWT + FastAPI guard every request so your notes remain private.",
    icon: ShieldCheck,
  },
  {
    title: "Smart Tagging & Search",
    description: "Organize with tags, filter by date, and find anything instantly.",
    icon: Sparkles,
  },
  {
    title: "Admin Insights",
    description: "Admins see usage stats—not user content—for ethical oversight.",
    icon: BarChart4,
  },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { theme, toggleTheme, isLoaded } = useTheme();

  const primaryAction = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">NA</span>
            {BRAND}
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#about" className="hover:text-foreground">
              About
            </a>
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#cta" className="hover:text-foreground">
              Get Started
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isLoaded && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            )}
            {isAuthenticated ? (
              <Button size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center px-6 pb-16 pt-20 text-center sm:pt-28" id="hero">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">{BRAND}</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Capture ideas, stay organized, and keep your notes in sync.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A modern note-taking experience powered by Next.js and FastAPI with role-based authentication,
            personal dashboards, and ethical admin insights.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={primaryAction} disabled={loading}>
              {isAuthenticated ? "Go to Dashboard" : "Sign In"}
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            )}
          </div>
        </section>

        <section
          id="about"
          className="border-y border-border bg-card/40 py-16 text-center text-muted-foreground"
        >
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-semibold text-foreground">Why choose {BRAND}?</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base">
              Built for teams and individuals who care about privacy, performance, and clarity. Every note is protected,
              every action tracked, and admins only see anonymized usage metrics—never your content.
            </p>
          </div>
        </section>

        <section id="features" className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Features that matter</h2>
            <p className="mt-3 text-muted-foreground">
              Organized writing, role-based access, and actionable insights—all in one place.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="cta" className="border-t border-border bg-card/30 py-16">
          <div className="container mx-auto flex flex-col items-center gap-4 px-6 text-center">
            <h2 className="text-3xl font-semibold">Ready to jot something down?</h2>
            <p className="max-w-2xl text-muted-foreground">
              Start for free, switch themes, invite teammates, and focus on the ideas that matter.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" onClick={primaryAction}>
                {isAuthenticated ? "Open Dashboard" : "Try it now"}
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="ghost" asChild>
                  <Link href="/signup">See how it works</Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

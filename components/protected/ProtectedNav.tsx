"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Moon, Sun } from "lucide-react";

interface ProtectedNavProps {
  title: string;
  description?: string;
}

export function ProtectedNav({ title, description }: ProtectedNavProps) {
  const router = useRouter();
  const { user, signout } = useAuth();
  const { theme, toggleTheme, isLoaded } = useTheme();

  const isAdmin = user?.role === "admin";
  const showAnalyticsLink = !isAdmin;
  const showProfileLink = !isAdmin;

  const handleSignOut = () => {
    signout();
    router.push("/signin");
  };

  return (
    <div className="border-b border-border bg-card/80 backdrop-blur">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          {!isAdmin && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              {showProfileLink && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
              )}
              {showAnalyticsLink && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/analytics">Analytics</Link>
                </Button>
              )}
            </>
          )}
          <Button variant="destructive" size="sm" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}


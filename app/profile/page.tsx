"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { authApi, adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ProtectedNav } from "@/components/protected/ProtectedNav";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminAnalytics, AdminStats } from "@/types";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [emailValue, setEmailValue] = useState(user?.email ?? "");
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalytics | null>(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  const [adminAnalyticsLoading, setAdminAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmailValue(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.role === "admin") {
      setAdminStatsLoading(true);
      setAdminAnalyticsLoading(true);
      adminApi
        .getStats()
        .then(setAdminStats)
        .finally(() => setAdminStatsLoading(false));
      adminApi
        .getAnalytics()
        .then(setAdminAnalytics)
        .finally(() => setAdminAnalyticsLoading(false));
    }
  }, [user?.role]);

  if (!user) {
    return null;
  }

  if (user.role === "admin") {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <ProtectedNav title="Admin Profile" description="Workspace health overview." />
        <main className="container mx-auto flex-1 px-4 py-10">
          <AdminOverview
            stats={adminStats}
            analytics={adminAnalytics}
            statsLoading={adminStatsLoading}
            analyticsLoading={adminAnalyticsLoading}
          />
        </main>
      </div>
    );
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitting(true);
    setEmailStatus(null);
    try {
      await authApi.updateEmail(emailValue);
      await refreshUser();
      setEmailStatus({ type: "success", message: "Email updated successfully." });
    } catch (error: any) {
      setEmailStatus({ type: "error", message: error.message || "Failed to update email." });
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordStatus(null);
    try {
      await authApi.changePassword(
        passwordForm.current_password,
        passwordForm.new_password,
        passwordForm.confirm_password
      );
      setPasswordStatus({ type: "success", message: "Password updated successfully." });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      setPasswordStatus({ type: "error", message: error.message || "Failed to update password." });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ProtectedNav title="Profile" description="Manage your account details." />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>Your account overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium">{user.email}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-base font-medium capitalize">{user.role}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="text-base font-medium">
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {user.last_login && (
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Last sign-in</p>
                  <p className="text-base font-medium">
                    {new Date(user.last_login).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Email</CardTitle>
              <CardDescription>Change the email associated with your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleEmailSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    required
                  />
                </div>
                {emailStatus && (
                  <p
                    className={cn(
                      "text-sm",
                      emailStatus.type === "success" ? "text-emerald-600" : "text-destructive"
                    )}
                  >
                    {emailStatus.message}
                  </p>
                )}
                <Button type="submit" disabled={emailSubmitting} className="w-full">
                  {emailSubmitting ? "Updating..." : "Update Email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password regularly for better security</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-3" onSubmit={handlePasswordSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))
                    }
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))
                    }
                    required
                    minLength={6}
                  />
                </div>
                {passwordStatus && (
                  <p
                    className={cn(
                      "text-sm md:col-span-3",
                      passwordStatus.type === "success" ? "text-emerald-600" : "text-destructive"
                    )}
                  >
                    {passwordStatus.message}
                  </p>
                )}
                <div className="md:col-span-3">
                  <Button type="submit" disabled={passwordSubmitting} className="w-full md:w-auto">
                    {passwordSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


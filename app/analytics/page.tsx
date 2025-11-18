"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { notesApi } from "@/lib/api";
import { NoteWithOwner } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Star, Pin } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import { ProtectedNav } from "@/components/protected/ProtectedNav";

type AnalyticsSnapshot = {
  total: number;
  pinned: number;
  favorites: number;
  tags: { tag: string; count: number }[];
  weekly: { label: string; count: number }[];
  monthly: { label: string; count: number }[];
};

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const [notes, setNotes] = useState<NoteWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notesApi.getAll();
        setNotes(data);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const analytics = useMemo<AnalyticsSnapshot>(() => {
    const total = notes.length;
    const pinned = notes.filter((n) => n.pinned).length;
    const favorites = notes.filter((n) => n.favorite).length;

    const tagCounts: Record<string, number> = {};
    const weeklyCounts: Record<string, number> = {};
    const monthlyCounts: Record<string, number> = {};

    notes.forEach((note) => {
      note.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      if (note.created_at) {
        const created = new Date(note.created_at);
        const weekStart = new Date(created);
        weekStart.setDate(created.getDate() - created.getDay());
        const weekLabel = weekStart.toISOString().split("T")[0];
        weeklyCounts[weekLabel] = (weeklyCounts[weekLabel] || 0) + 1;

        const monthLabel = created.toLocaleString("default", { month: "short", year: "numeric" });
        monthlyCounts[monthLabel] = (monthlyCounts[monthLabel] || 0) + 1;
      }
    });

    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    const weekly = Object.entries(weeklyCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));

    const monthly = Object.entries(monthlyCounts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));

    return {
      total,
      pinned,
      favorites,
      tags,
      weekly,
      monthly,
    };
  }, [notes]);

  const tagChartData = analytics.tags.slice(0, 8);
  const weeklyChartData = analytics.weekly.slice(-8);
  const monthlyChartData = analytics.monthly.slice(-6);

  const chartConfig: ChartConfig = {
    notes: {
      label: "Notes",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ProtectedNav title="My Analytics" description="A deeper look at your note-taking habits." />

      <main className="container mx-auto flex-1 px-4 py-10">
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">Loading analytics...</div>
        ) : error ? (
          <div className="py-6 text-center text-destructive">{error}</div>
        ) : (
          <AnalyticsSections
            analytics={analytics}
            tagChartData={tagChartData}
            weeklyChartData={weeklyChartData}
            monthlyChartData={monthlyChartData}
            chartConfig={chartConfig}
          />
        )}
      </main>

    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSections({
  analytics,
  tagChartData,
  weeklyChartData,
  monthlyChartData,
  chartConfig,
}: {
  analytics: AnalyticsSnapshot;
  tagChartData: { tag: string; count: number }[];
  weeklyChartData: { label: string; count: number }[];
  monthlyChartData: { label: string; count: number }[];
  chartConfig: ChartConfig;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total Notes" value={analytics.total} icon={<ListChecks className="h-5 w-5" />} />
        <SummaryCard label="Pinned Notes" value={analytics.pinned} icon={<Pin className="h-5 w-5" />} />
        <SummaryCard label="Favorites" value={analytics.favorites} icon={<Star className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tag distribution</CardTitle>
          <CardDescription>Most frequently used tags</CardDescription>
        </CardHeader>
        <CardContent>
          {tagChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet.</p>
          ) : (
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={tagChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tag" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-notes)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly activity</CardTitle>
            <CardDescription>Notes created per week</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="var(--color-notes)" strokeWidth={2} dot />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly trend</CardTitle>
            <CardDescription>Overview of notes per month</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-notes)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


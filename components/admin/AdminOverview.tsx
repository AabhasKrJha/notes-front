"use client";

import { useState } from "react";
import { AdminAnalytics, AdminStats } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

interface AdminOverviewProps {
  stats: AdminStats | null;
  analytics: AdminAnalytics | null;
  statsLoading: boolean;
  analyticsLoading: boolean;
}

type RangeOption = "weekly" | "monthly" | "yearly";
const rangeOptions: RangeOption[] = ["weekly", "monthly", "yearly"];

export function AdminOverview({ stats, analytics, statsLoading, analyticsLoading }: AdminOverviewProps) {
  const [noteRange, setNoteRange] = useState<RangeOption>("weekly");
  const [userRange, setUserRange] = useState<RangeOption>("weekly");

  if (statsLoading && !stats) {
    return (
      <Card>
        <CardContent>
          <div className="py-6 text-center text-muted-foreground">Loading admin metrics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent>
          <div className="py-6 text-center text-muted-foreground">No admin data available yet.</div>
        </CardContent>
      </Card>
    );
  }

  const noteMetrics = [
    { label: "Total Notes", value: stats.total_notes },
    { label: "This Week", value: stats.notes_last_7_days },
    { label: "This Month", value: stats.notes_last_30_days },
    { label: "This Year", value: stats.notes_last_365_days },
  ];

  const noteMetricChartData = [
    { period: "Week", value: stats.notes_last_7_days },
    { period: "Month", value: stats.notes_last_30_days },
    { period: "Year", value: stats.notes_last_365_days },
  ];

  const peopleMetrics = [
    { label: "Total Users", value: stats.total_users },
    { label: "Active (30d)", value: stats.monthly_active_users },
    { label: "Active (12m)", value: stats.annual_active_users },
  ];

  const notesTimeline = analytics?.notes_timeline?.[noteRange] ?? [];
  const usersTimeline = analytics?.users_timeline?.[userRange] ?? [];

  const noteChartData = notesTimeline.map((point) => ({
    label: formatTimelineLabel(point.label, noteRange),
    count: point.count,
  }));

  const userChartData = usersTimeline.map((point) => ({
    label: formatTimelineLabel(point.label, userRange),
    count: point.count,
  }));

  const noteMetricChartConfig = {
    notes: {
      label: "Notes",
      color: "hsl(var(--chart-1))",
    },
  } as const;

  const noteTrendConfig = {
    notes: {
      label: "Notes",
      color: "hsl(var(--chart-2))",
    },
  } as const;

  const userTrendConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-3))",
    },
  } as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Note creation</CardTitle>
            <CardDescription>System-wide note volume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {noteMetrics.map((metric) => (
                <MetricPill key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>
            <ChartContainer config={noteMetricChartConfig} className="h-48">
              <BarChart data={noteMetricChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" fill="var(--color-notes)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>People overview</CardTitle>
            <CardDescription>Members and recent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {peopleMetrics.map((metric) => (
                <MetricPill key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Notes timeline</CardTitle>
                <CardDescription>Creation trend across time</CardDescription>
              </div>
              <RangeToggle value={noteRange} onChange={setNoteRange} />
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading && !analytics ? (
              <div className="py-4 text-center text-sm text-muted-foreground">Loading timeline...</div>
            ) : noteChartData.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">No note activity yet.</div>
            ) : (
              <ChartContainer config={noteTrendConfig} className="h-60">
                <LineChart data={noteChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>User timeline</CardTitle>
                <CardDescription>New accounts over time</CardDescription>
              </div>
              <RangeToggle value={userRange} onChange={setUserRange} />
            </div>
          </CardHeader>
          <CardContent>
            {analyticsLoading && !analytics ? (
              <div className="py-4 text-center text-sm text-muted-foreground">Loading timeline...</div>
            ) : userChartData.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">No user growth yet.</div>
            ) : (
              <ChartContainer config={userTrendConfig} className="h-60">
                <BarChart data={userChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-users, hsl(var(--chart-3)))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User directory</CardTitle>
          <CardDescription>User base with note counts</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.users.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.users.map((summary) => (
                    <TableRow key={summary.email}>
                      <TableCell>{summary.name}</TableCell>
                      <TableCell className="text-muted-foreground">{summary.email}</TableCell>
                      <TableCell>{new Date(summary.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {summary.last_login ? new Date(summary.last_login).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                              summary.is_monthly_active
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            Monthly {summary.is_monthly_active ? "active" : "inactive"}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                              summary.is_yearly_active
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            Annual {summary.is_yearly_active ? "active" : "inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{summary.note_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
    </div>
  );
}

function RangeToggle({ value, onChange }: { value: RangeOption; onChange: (value: RangeOption) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card p-1 text-xs">
      {rangeOptions.map((option) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant={value === option ? "default" : "ghost"}
          onClick={() => onChange(option)}
        >
          {option === "weekly" ? "Weekly" : option === "monthly" ? "Monthly" : "Yearly"}
        </Button>
      ))}
    </div>
  );
}

function formatTimelineLabel(label: string, range: RangeOption): string {
  if (range === "weekly") {
    const date = new Date(label);
    if (Number.isNaN(date.getTime())) {
      return label;
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (range === "monthly") {
    const [year, month] = label.split("-");
    if (year && month) {
      const date = new Date(Number(year), Number(month) - 1, 1);
      return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    }
    return label;
  }
  return label;
}

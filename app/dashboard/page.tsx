"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { adminApi, notesApi } from "@/lib/api";
import { AdminAnalytics, AdminStats, NoteWithOwner } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, Pin, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ProtectedNav } from "@/components/protected/ProtectedNav";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [notes, setNotes] = useState<NoteWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithOwner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    attachmentsText: "",
    pinned: false,
    favorite: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    startDate: "",
    endDate: "",
    tags: [] as string[],
  });
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [adminAnalytics, setAdminAnalytics] = useState<AdminAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [filterTagInput, setFilterTagInput] = useState("");
  const [formTagPopoverOpen, setFormTagPopoverOpen] = useState(false);
  const [newFormTag, setNewFormTag] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "pinned" | "favorite">("all");
  const [viewNote, setViewNote] = useState<NoteWithOwner | null>(null);
  const isAdmin = user?.role === "admin";

  const formatDisplayDate = (value: string) => {
    if (!value) return "Pick a date";
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const loadNotes = async (activeFilters = filters) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await notesApi.getAll({
        search: activeFilters.search || undefined,
        startDate: activeFilters.startDate || undefined,
        endDate: activeFilters.endDate || undefined,
        tags: activeFilters.tags?.length ? activeFilters.tags : undefined,
      });
      setNotes(data);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to load notes.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await adminApi.getStats();
      setAdminStats(stats);
    } catch (error) {
      console.error("Failed to load admin stats", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const tags = await notesApi.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to load tags", error);
    }
  };

  const fetchAdminAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const analytics = await adminApi.getAnalytics();
      setAdminAnalytics(analytics);
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && !isAdmin) {
      loadNotes(filters);
      fetchTags();
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchAdminStats();
      fetchAdminAnalytics();
    }
  }, [authLoading, isAdmin]);

  const handleCreate = () => {
    setEditingNote(null);
    setFormData({
      title: "",
      description: "",
      tags: [],
      attachmentsText: "",
      pinned: false,
      favorite: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (note: NoteWithOwner) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      description: note.description || "",
      tags: note.tags || [],
      attachmentsText: (note.attachments || []).join("\n"),
      pinned: note.pinned,
      favorite: note.favorite,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await notesApi.delete(id);
      await loadNotes(filters);
      await fetchTags();
    } catch (error) {
      console.error("Failed to delete note:", error);
      setErrorMessage("Failed to delete note. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags;
      const attachmentArray = formData.attachmentsText
        ? formData.attachmentsText.split("\n").map((url) => url.trim()).filter(Boolean)
        : [];

      if (editingNote) {
        await notesApi.update(editingNote.id, {
          title: formData.title,
          description: formData.description,
          tags: tagsArray,
          attachments: attachmentArray,
          pinned: formData.pinned,
          favorite: formData.favorite,
        });
      } else {
        await notesApi.create({
          title: formData.title,
          description: formData.description,
          tags: tagsArray,
          attachments: attachmentArray,
          pinned: formData.pinned,
          favorite: formData.favorite,
        });
      }
      setIsDialogOpen(false);
      await loadNotes(filters);
      await fetchTags();
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Failed to save note");
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadNotes(filters);
  };

  const resetFilters = () => {
    const reset = { search: "", startDate: "", endDate: "", tags: [] as string[] };
    setFilters(reset);
    setFilterTagInput("");
    setTagPopoverOpen(false);
    loadNotes(reset);
  };

  const handleDateSelect = (field: "startDate" | "endDate", date?: Date) => {
    handleFilterChange(field, date ? date.toISOString().split("T")[0] : "");
  };

  const addFilterTag = (tag: string) => {
    if (!tag.trim()) return;
    setFilters((prev) => {
      if (prev.tags.includes(tag)) return prev;
      return { ...prev, tags: [...prev.tags, tag] };
    });
    setAvailableTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setFilterTagInput("");
  };

  const removeFilterTag = (tag: string) => {
    setFilters((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const addFormTag = (tag: string) => {
    if (!tag.trim()) return;
    setFormData((prev) => {
      if (prev.tags.includes(tag)) return prev;
      return { ...prev, tags: [...prev.tags, tag] };
    });
    setAvailableTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setNewFormTag("");
  };

  const removeFormTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleViewNote = (note: NoteWithOwner) => {
    setViewNote(note);
  };

  const hasActiveFilters =
    !!filters.search ||
    !!filters.startDate ||
    !!filters.endDate ||
    filters.tags.length > 0;

  const handleTagNavClick = (tag?: string) => {
    const next = {
      ...filters,
      tags: tag ? [tag] : [],
    };
    setFilters(next);
    loadNotes(next);
    setTagPopoverOpen(false);
  };

  const handleTogglePinned = async (note: NoteWithOwner) => {
    try {
      await notesApi.update(note.id, { pinned: !note.pinned });
      await loadNotes(filters);
    } catch (error) {
      console.error("Failed to toggle pin", error);
    }
  };

  const handleToggleFavorite = async (note: NoteWithOwner) => {
    try {
      await notesApi.update(note.id, { favorite: !note.favorite });
      await loadNotes(filters);
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  const notesWithFormattedTags = useMemo(() => {
    return notes.map((note) => ({
      ...note,
      tags: note.tags ?? [],
      attachments: note.attachments ?? [],
    }));
  }, [notes]);

  const displayedNotes = useMemo(() => {
    if (viewMode === "pinned") {
      return notesWithFormattedTags.filter((note) => note.pinned);
    }
    if (viewMode === "favorite") {
      return notesWithFormattedTags.filter((note) => note.favorite);
    }
    return notesWithFormattedTags;
  }, [notesWithFormattedTags, viewMode]);

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background transition-colors">
        <ProtectedNav title="Admin Dashboard" description="Monitor overall activity across the workspace." />
        <main className="container mx-auto px-4 py-8">
          <AdminOverview
            stats={adminStats}
            analytics={adminAnalytics}
            statsLoading={statsLoading}
            analyticsLoading={analyticsLoading}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <ProtectedNav title="Notes Dashboard" description="Organize, filter, and keep every note in sync." />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="lg:w-72">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine your notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Keyword</Label>
                  <Input
                    id="search"
                    placeholder="Search notes..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.startDate && "text-muted-foreground"
                        )}
                      >
                        {formatDisplayDate(filters.startDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.startDate ? new Date(filters.startDate) : undefined}
                        onSelect={(date) => handleDateSelect("startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.endDate && "text-muted-foreground"
                        )}
                      >
                        {formatDisplayDate(filters.endDate)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.endDate ? new Date(filters.endDate) : undefined}
                        onSelect={(date) => handleDateSelect("endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        {filters.tags.length ? `${filters.tags.length} selected` : "Select tags"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 space-y-4" align="start">
                      <div className="flex flex-wrap gap-2">
                        {availableTags.length === 0 && (
                          <p className="text-xs text-muted-foreground">No tags yet.</p>
                        )}
                        {availableTags.map((tag) => {
                          const selected = filters.tags.includes(tag);
                          return (
                            <Button
                              key={tag}
                              size="sm"
                              variant={selected ? "default" : "outline"}
                              onClick={() =>
                                selected ? removeFilterTag(tag) : addFilterTag(tag)
                              }
                            >
                              {tag}
                            </Button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new tag"
                          value={filterTagInput}
                          onChange={(e) => setFilterTagInput(e.target.value)}
                        />
                        <Button
                          onClick={() => {
                            addFilterTag(filterTagInput.trim());
                            setTagPopoverOpen(true);
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {filters.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {filters.tags.map((tag) => (
                        <span
                          key={`filter-chip-${tag}`}
                          className="flex items-center gap-1 rounded-full bg-secondary px-3 py-0.5 text-xs text-secondary-foreground"
                        >
                          {tag}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => removeFilterTag(tag)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3">
                <Button className="flex-1" onClick={applyFilters}>
                  Apply
                </Button>
                <Button className="flex-1" variant="secondary" onClick={resetFilters}>
                  Reset
                </Button>
              </CardFooter>
            </Card>
          </aside>

          <div className="flex-1 space-y-6">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* <span className="text-sm font-semibold text-muted-foreground">View</span> */}
                <div className="flex flex-wrap gap-2">
                  {["all", "pinned", "favorite"].map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={viewMode === mode ? "default" : "outline"}
                      onClick={() => setViewMode(mode as "all" | "pinned" | "favorite")}
                    >
                      {mode === "all" ? "All" : mode === "pinned" ? "Pinned" : "Favorites"}
                    </Button>
                  ))}
                </div>
              </div>
              {availableTags.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-semibold text-muted-foreground">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={filters.tags.length === 0 ? "default" : "outline"}
                      onClick={() => handleTagNavClick(undefined)}
                    >
                      All tags
                    </Button>
                    {availableTags.map((tag) => (
                      <Button
                        key={`nav-tag-${tag}`}
                        size="sm"
                        variant={filters.tags.length === 1 && filters.tags[0] === tag ? "default" : "outline"}
                        onClick={() => handleTagNavClick(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>My Notes</CardTitle>
                    <CardDescription>Search, filter, and manage your notes</CardDescription>
                  </div>
                  <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {hasActiveFilters && (
                  <div className="mb-4 rounded-md border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground">
                    Showing results with applied filters.
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {errorMessage}
                  </div>
                )}

                {loading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading notes...</div>
                ) : displayedNotes.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">No notes found. Create your first note!</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Images</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedNotes.map((note) => (
                        <TableRow key={note.id} className="cursor-pointer" onClick={() => handleViewNote(note)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {note.pinned && <Pin className="h-4 w-4 text-primary" />}
                          {note.favorite && <Star className="h-4 w-4 text-amber-500" />}
                          <span>{note.title}</span>
                        </div>
                      </TableCell>
                          <TableCell className="max-w-md truncate">
                        {note.description ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="text-sm leading-relaxed *:mb-2 *:last-child:mb-0 wrap-break-word"
                          >
                            {note.description}
                          </ReactMarkdown>
                        ) : (
                          <span className="text-muted-foreground/70">No description</span>
                        )}
                          </TableCell>
                          <TableCell>
                            {note.tags.length === 0 ? (
                              <span className="text-xs text-muted-foreground">No tags</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {note.tags.map((tag) => (
                                  <span
                                    key={`${note.id}-${tag}`}
                                    className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </TableCell>
                      <TableCell className="max-w-xs">
                        {note.attachments.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No images</span>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {note.attachments.map((url) => (
                                <img
                                  key={`${note.id}-img-${url}`}
                                  src={url}
                                  alt="Note attachment"
                                  className="h-16 w-16 rounded border object-cover"
                                  loading="lazy"
                                />
                              ))}
                            </div>
                            <div className="flex flex-col gap-1">
                              {note.attachments.map((url) => (
                                <a
                                  key={`${note.id}-link-${url}`}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="truncate text-xs text-primary underline-offset-2 hover:underline"
                                >
                                  {url}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </TableCell>
                          <TableCell>{new Date(note.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePinned(note);
                            }}
                          >
                            <Pin
                              className={cn(
                                "h-4 w-4",
                                note.pinned ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(note);
                            }}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                note.favorite ? "text-amber-500" : "text-muted-foreground"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(note);
                            }}
                          >
                                <Edit className="h-4 w-4" />
                              </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(note.id);
                            }}
                          >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
              <DialogDescription>
                {editingNote ? "Update the note details" : "Add a new note with title, description, and tags"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Note title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Note description"
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Popover open={formTagPopoverOpen} onOpenChange={setFormTagPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      {formData.tags.length ? `${formData.tags.length} selected` : "Select tags"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 space-y-4" align="start">
                    <div className="flex flex-wrap gap-2">
                      {availableTags.length === 0 && (
                        <p className="text-xs text-muted-foreground">No tags yet.</p>
                      )}
                      {availableTags.map((tag) => {
                        const selected = formData.tags.includes(tag);
                        return (
                          <Button
                            key={`form-tag-option-${tag}`}
                            size="sm"
                            variant={selected ? "default" : "outline"}
                            onClick={() => (selected ? removeFormTag(tag) : addFormTag(tag))}
                          >
                            {tag}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new tag"
                        value={newFormTag}
                        onChange={(e) => setNewFormTag(e.target.value)}
                      />
                      <Button
                        onClick={() => {
                          addFormTag(newFormTag.trim());
                          setFormTagPopoverOpen(true);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={`form-tag-chip-${tag}`}
                        className="flex items-center gap-1 rounded-full bg-secondary px-3 py-0.5 text-xs text-secondary-foreground"
                      >
                        {tag}
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => removeFormTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="attachments">Image links</Label>
                <textarea
                  id="attachments"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.attachmentsText}
                  onChange={(e) => setFormData({ ...formData, attachmentsText: e.target.value })}
                  placeholder="One URL per line"
                />
                <p className="text-xs text-muted-foreground">Only links supported. They will show as images.</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="button"
                  variant={formData.pinned ? "default" : "outline"}
                  onClick={() => setFormData((prev) => ({ ...prev, pinned: !prev.pinned }))}
                >
                  {formData.pinned ? "Pinned" : "Pin note"}
                </Button>
                <Button
                  type="button"
                  variant={formData.favorite ? "default" : "outline"}
                  onClick={() => setFormData((prev) => ({ ...prev, favorite: !prev.favorite }))}
                >
                  {formData.favorite ? "Favorited" : "Favorite"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingNote ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewNote} onOpenChange={(open) => !open && setViewNote(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>{viewNote?.title}</DialogTitle>
              {viewNote?.pinned && <Pin className="h-4 w-4 text-primary" />}
              {viewNote?.favorite && <Star className="h-4 w-4 text-amber-500" />}
            </div>
            <DialogDescription>
              {viewNote ? `Created on ${new Date(viewNote.created_at).toLocaleString()}` : ""}
            </DialogDescription>
          </DialogHeader>
          {viewNote && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">Content</h3>
                {viewNote.description ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm max-w-none pt-2 dark:prose-invert"
                  >
                    {viewNote.description}
                  </ReactMarkdown>
                ) : (
                  <p className="pt-2 text-sm text-muted-foreground">No description provided.</p>
                )}
              </div>
              {viewNote.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Tags</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {viewNote.tags.map((tag) => (
                      <span
                        key={`view-tag-${tag}`}
                        className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {viewNote.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground">Images</h3>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {viewNote.attachments.map((url) => (
                      <a
                        key={`view-attachment-${url}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center gap-2 text-xs text-primary underline-offset-2 hover:underline"
                      >
                        <img
                          src={url}
                          alt="Attachment"
                          className="h-20 w-20 rounded border object-cover"
                          loading="lazy"
                        />
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}






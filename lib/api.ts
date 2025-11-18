import {
  SignUpData,
  SignInData,
  AuthResponse,
  Note,
  NoteWithOwner,
  User,
  NoteCreate,
  NoteUpdate,
  NoteFilters,
  AdminStats,
  AdminAnalytics,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper function to get auth token
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
}

// Helper function to set auth token
function setToken(token: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("token", token);
}

// Helper function to remove auth token
function removeToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("token");
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (options.headers) {
    const incomingHeaders = new Headers(options.headers);
    incomingHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      throw new Error("Session expired. Please sign in again.");
    }
    const error = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    // No content
    return null as T;
  }

  const text = await response.text();
  if (!text) {
    return null as T;
  }

  return JSON.parse(text);
}

// Auth API
export const authApi = {
  signup: async (data: SignUpData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response.access_token) {
      setToken(response.access_token);
    }
    return response;
  },

  signin: async (data: SignInData): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (response.access_token) {
      setToken(response.access_token);
    }
    return response;
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>("/api/auth/me");
  },

  signout: (): void => {
    removeToken();
  },

  updateEmail: async (email: string): Promise<User> => {
    return apiRequest<User>("/api/auth/email", {
      method: "PUT",
      body: JSON.stringify({ email }),
    });
  },

  changePassword: async (
    current_password: string,
    new_password: string,
    confirm_password: string
  ): Promise<{ detail: string }> => {
    return apiRequest<{ detail: string }>("/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    });
  },
};

// Notes API
export const notesApi = {
  getAll: async (filters?: NoteFilters): Promise<NoteWithOwner[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.startDate) params.set("start_date", filters.startDate);
    if (filters?.endDate) params.set("end_date", filters.endDate);
    if (filters?.tags?.length) params.set("tags", filters.tags.join(","));

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<NoteWithOwner[]>(`/api/notes${query}`);
  },

  getById: async (id: number): Promise<NoteWithOwner> => {
    return apiRequest<NoteWithOwner>(`/api/notes/${id}`);
  },

  create: async (data: NoteCreate): Promise<Note> => {
    return apiRequest<Note>("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: NoteUpdate): Promise<Note> => {
    return apiRequest<Note>(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest<void>(`/api/notes/${id}`, {
      method: "DELETE",
    });
  },

  getTags: async (): Promise<string[]> => {
    return apiRequest<string[]>("/api/notes/tags");
  },
};

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    return apiRequest<AdminStats>("/api/admin/stats");
  },
  getAnalytics: async (): Promise<AdminAnalytics> => {
    return apiRequest<AdminAnalytics>("/api/admin/analytics");
  },
};

export { getToken, setToken, removeToken };


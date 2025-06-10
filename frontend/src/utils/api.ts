import axios from "axios";
import { ApiResponse, Comment, Photo, User } from "../types/models";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-storage");
    if (token) {
      const { state } = JSON.parse(token);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state and redirect to login
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }

    return Promise.reject(error.response?.data || error);
  }
);

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) =>
    api.post<
      { email: string; password: string },
      ApiResponse<{ user: User; session: { jwt: string } }>
    >("/auth/login", {
      email,
      password,
    }),

  register: async (name: string, email: string, password: string) =>
    api.post<
      { name: string; email: string; password: string },
      ApiResponse<{ user: User; session: { jwt: string } }>
    >("/auth/register", {
      name,
      email,
      password,
    }),

  logout: async () => {
    const response = await api.post<void, ApiResponse<string>>("/auth/logout");
    setAuthToken(null);
    return response;
  },

  getCurrentUser: async () => api.get<void, ApiResponse<User>>("/auth/me"),

  upgradeToCreator: async () =>
    api.post<void, ApiResponse<User>>("/auth/upgrade-to-creator"),

  toggleView: async () =>
    api.post<void, ApiResponse<User>>("/auth/toggle-view"),
};

// Photos API
export const photosApi = {
  getPhotos: async (page = 1, limit = 10, tags?: string[], userId?: string) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (tags?.length) params.append("tags", tags.join(","));
    if (userId) params.append("userId", userId);

    return api.get<
      void,
      ApiResponse<{ photos: Photo[]; page: number; totalPages: number }>
    >(`/photos?${params.toString()}`);
  },

  getPhotoById: async (id: string) =>
    api.get<void, ApiResponse<Photo>>(`/photos/${id}`),

  uploadPhoto: async (
    data: FormData,
    onProgress?: (progress: number) => void
  ) => {
    return api.post<FormData, ApiResponse<Photo>>("/photos", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  updatePhoto: async (id: string, data: Partial<Photo>) =>
    api.patch<Partial<Photo>, ApiResponse<Photo>>(`/photos/${id}`, data),

  deletePhoto: async (id: string) =>
    api.delete<void, ApiResponse<void>>(`/photos/${id}`),

  ratePhoto: async (id: string, score: number) =>
    api.post<{ score: number }, ApiResponse<Photo>>(`/photos/${id}/rate`, {
      score,
    }),

  addComment: async (id: string, text: string) =>
    api.post<{ text: string }, ApiResponse<Comment>>(`/photos/${id}/comments`, {
      text,
    }),

  deleteComment: async (photoId: string, commentId: string) =>
    api.delete<void, ApiResponse<void>>(
      `/photos/${photoId}/comments/${commentId}`
    ),
};

import { create } from "zustand";
import { ApiError, Photo } from "../types/models";
import { photosApi } from "../utils/api";

interface PhotoState {
  photos: Photo[];
  currentPhoto: Photo | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  uploadProgress: number;
  loadPhotos: (
    page?: number,
    limit?: number,
    tags?: string[],
    userId?: string
  ) => Promise<void>;
  getPhotoById: (id: string) => Promise<void>;
  uploadPhoto: (data: FormData) => Promise<void>;
  updatePhoto: (id: string, data: Partial<Photo>) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  ratePhoto: (id: string, score: number) => Promise<void>;
  addComment: (id: string, text: string) => Promise<void>;
  deleteComment: (photoId: string, commentId: string) => Promise<void>;
  resetState: () => void;
}

export const usePhotoStore = create<PhotoState>((set, get) => ({
  photos: [],
  currentPhoto: null,
  isLoading: false,
  error: null,
  page: 1,
  totalPages: 1,
  uploadProgress: 0,

  loadPhotos: async (page = 1, limit = 10, tags = [], userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await photosApi.getPhotos(page, limit, tags, userId);
      if (response.success && response.data) {
        set({
          photos: response.data.photos,
          page: response.data.page,
          totalPages: response.data.totalPages,
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || "Failed to load photos" });
    } finally {
      set({ isLoading: false });
    }
  },

  getPhotoById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await photosApi.getPhotoById(id);
      if (response.success && response.data) {
        set({ currentPhoto: response.data });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || "Failed to load photo" });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadPhoto: async (data: FormData) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      const response = await photosApi.uploadPhoto(data, (progress) => {
        set({ uploadProgress: progress });
      });
      if (response.success && response.data) {
        const { photos } = get();
        set({ photos: [response.data, ...photos] });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || "Failed to upload photo" });
      throw error;
    } finally {
      set({ isLoading: false, uploadProgress: 0 });
    }
  },

  updatePhoto: async (id: string, data: Partial<Photo>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await photosApi.updatePhoto(id, data);
      if (response.success && response.data) {
        const updatedPhoto = response.data;
        const { photos, currentPhoto } = get();

        // Update in list if present
        const updatedPhotos = photos.map((photo) =>
          photo._id === updatedPhoto._id ? updatedPhoto : photo
        );

        // Update current photo if it's the one being edited
        if (currentPhoto?._id === updatedPhoto._id) {
          set({ currentPhoto: updatedPhoto });
        }

        set({ photos: updatedPhotos });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || "Failed to update photo" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePhoto: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await photosApi.deletePhoto(id);
      if (response.success) {
        const { photos } = get();
        set({
          photos: photos.filter((photo) => photo._id !== id),
          currentPhoto: null,
        });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || "Failed to delete photo" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  ratePhoto: async (id: string, score: number) => {
    set({ error: null });
    try {
      const response = await photosApi.ratePhoto(id, score);
      if (response.success && response.data) {
        const updatedPhoto = response.data;
        const { photos, currentPhoto } = get();

        // Update in list if present
        const updatedPhotos = photos.map((photo) =>
          photo._id === updatedPhoto._id ? updatedPhoto : photo
        );

        // Update current photo if it's the one being rated
        if (currentPhoto?._id === updatedPhoto._id) {
          set({ currentPhoto: updatedPhoto });
        }

        set({ photos: updatedPhotos });
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || "Failed to rate photo" });
      throw error;
    }
  },

  addComment: async (id: string, text: string) => {
    set({ error: null });
    try {
      const response = await photosApi.addComment(id, text);
      if (response.success && response.data) {
        const { currentPhoto } = get();
        if (currentPhoto && currentPhoto._id === id) {
          set({
            currentPhoto: {
              ...currentPhoto,
              comments: [...(currentPhoto.comments || []), response.data],
            },
          });
        }
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || "Failed to add comment" });
      throw error;
    }
  },

  deleteComment: async (photoId: string, commentId: string) => {
    set({ error: null });
    try {
      const response = await photosApi.deleteComment(photoId, commentId);
      if (response.success) {
        const { currentPhoto } = get();
        if (currentPhoto && currentPhoto._id === photoId) {
          set({
            currentPhoto: {
              ...currentPhoto,
              comments: currentPhoto.comments?.filter(
                (c) => c._id !== commentId
              ),
            },
          });
        }
      }
    } catch (error) {
      const apiError = error as ApiError;
      set({ error: apiError.message || "Failed to delete comment" });
      throw error;
    }
  },

  resetState: () => {
    set({
      photos: [],
      currentPhoto: null,
      isLoading: false,
      error: null,
      page: 1,
      totalPages: 1,
      uploadProgress: 0,
    });
  },
}));

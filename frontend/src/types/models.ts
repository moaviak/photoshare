export interface User {
  _id: string;
  name: string;
  email: string;
  role: "consumer" | "creator";
  currentView: "consumer" | "creator";
  joinedAt: string;
}

export interface Photo {
  _id: string;
  title: string;
  caption?: string;
  imageUrl: string;
  location?: string;
  tags: string[];
  isPublic: boolean;
  createdBy: User;
  createdAt: string;
  ratings: Rating[];
  comments: Comment[];
  averageRating: number;
}

export interface Rating {
  _id: string;
  score: number;
  user: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  author: User;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface PhotoUploadData {
  title: string;
  caption?: string;
  location?: string;
  tags?: string;
  isPublic?: boolean;
  photo: File;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  field?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  filename?: string;
}

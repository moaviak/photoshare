import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CreatorRoute from "@/components/auth/CreatorRoute";
import GuestRoute from "@/components/auth/GuestRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import FeedPage from "@/pages/FeedPage";
import PhotoDetailsPage from "@/pages/PhotoDetailsPage";
import ProfilePage from "@/pages/ProfilePage";
import UploadPage from "@/pages/UploadPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      {
        path: "login",
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: "register",
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: "feed",
        element: (
          <ProtectedRoute>
            <FeedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "photos/:id",
        element: (
          <ProtectedRoute>
            <PhotoDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "upload",
        element: (
          <ProtectedRoute>
            <CreatorRoute>
              <UploadPage />
            </CreatorRoute>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Spinner, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { authApi } from "@/utils/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user, token } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const validateAuth = async () => {
      if (token && !user) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success) {
            useAuthStore.setState({ user: response.data });
          }
        } catch {
          useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      }
      setIsValidating(false);
    };

    validateAuth();
  }, [token, user]);

  if (isValidating) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Center, Text, VStack, Button } from "@chakra-ui/react";

interface CreatorRouteProps {
  children: React.ReactNode;
}

const CreatorRoute = ({ children }: CreatorRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "creator") {
    return (
      <Center h="calc(100vh - 64px)">
        <VStack gap={4}>
          <Text>This page is only accessible to creators.</Text>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </VStack>
      </Center>
    );
  }

  if (user.currentView !== "creator") {
    return (
      <Center h="calc(100vh - 64px)">
        <VStack gap={4}>
          <Text>Please switch to creator view to access this page.</Text>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </VStack>
      </Center>
    );
  }

  return children;
};

export default CreatorRoute;

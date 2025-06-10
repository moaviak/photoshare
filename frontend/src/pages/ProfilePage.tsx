import { useState } from "react";
import {
  Box,
  VStack,
  Grid,
  Text,
  Button,
  HStack,
  Switch,
  Skeleton,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { usePhotoStore } from "@/store/photoStore";
import PhotoCard from "@/components/photos/PhotoCard";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/types/models";

const ProfilePage = () => {
  const { user, upgradeToCreator, toggleView } = useAuthStore();
  const { loadPhotos, photos, isLoading } = usePhotoStore();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const bgColor = useColorModeValue("white", "gray.800");

  // Load user's photos
  useQuery({
    queryKey: ["userPhotos", user?._id],
    queryFn: () => loadPhotos(1, 50, [], user?._id),
    enabled: !!user?._id,
  });

  const handleUpgradeToCreator = async () => {
    try {
      setIsUpgrading(true);
      await upgradeToCreator();
      toaster.create({
        title: "Account upgraded successfully",
        description: "You are now a creator!",
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      const apiError = error as ApiError;
      toaster.create({
        title: "Failed to upgrade account",
        description: apiError.message || "An error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleToggleView = async () => {
    try {
      await toggleView();
      toaster.create({
        title: "View mode switched",
        type: "success",
        duration: 2000,
      });
    } catch (error) {
      const apiError = error as ApiError;
      toaster.create({
        title: "Failed to switch view",
        description: apiError.message || "An error occurred",
        type: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Box p={6}>
      <VStack spaceY={8} align="stretch">
        <Box bg={bgColor} p={6} borderRadius="lg" shadow="md">
          <VStack spaceY={4} align="stretch">
            <Text fontSize="2xl" fontWeight="bold" color="gray.900">
              Profile
            </Text>

            <Box>
              <Text fontWeight="medium" color="gray.800">
                Name
              </Text>
              <Text color="gray.600">{user?.name}</Text>
            </Box>

            <Box>
              <Text fontWeight="medium" color="gray.800">
                Email
              </Text>
              <Text color="gray.600" _dark={{ color: "gray.300" }}>
                {user?.email}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="medium" color="gray.800">
                Role
              </Text>
              <Text color="gray.600" _dark={{ color: "gray.300" }}>
                {user?.role === "creator" ? "Creator" : "Consumer"}
              </Text>
            </Box>

            {user?.role === "consumer" && (
              <Button
                colorScheme="blue"
                onClick={handleUpgradeToCreator}
                loading={isUpgrading}
              >
                Upgrade to Creator
              </Button>
            )}

            {user?.role === "creator" && (
              <HStack>
                <Text>Creator View</Text>
                <Switch.Root
                  checked={user.currentView === "creator"}
                  onChange={handleToggleView}
                />
              </HStack>
            )}
          </VStack>
        </Box>

        <Box>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Your Photos
          </Text>

          {isLoading ? (
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={6}
            >
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} height="300px" borderRadius="lg" />
              ))}
            </Grid>
          ) : photos.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>
              No photos uploaded yet
            </Text>
          ) : (
            <Grid
              templateColumns={{
                base: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={6}
            >
              {photos.map((photo) => (
                <PhotoCard key={photo._id} photo={photo} />
              ))}
            </Grid>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default ProfilePage;

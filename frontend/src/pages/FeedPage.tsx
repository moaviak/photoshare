import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  Input,
  VStack,
  Text,
  Button,
  HStack,
  Skeleton,
} from "@chakra-ui/react";
import { useInView } from "react-intersection-observer";
import { usePhotoStore } from "@/store/photoStore";
import PhotoCard from "@/components/photos/PhotoCard";
import { useDebounce } from "@/hooks/useDebounce";
import { toaster } from "@/components/ui/toaster";
import { ApiError } from "@/types/models";

const FeedPage = () => {
  const { loadPhotos, photos, isLoading, page, totalPages } = usePhotoStore();
  const [searchTags, setSearchTags] = useState("");
  const debouncedTags = useDebounce(searchTags, 500);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const loadingRef = useRef(false);
  const { ref: loadMoreRef, inView } = useInView();

  const handleLoadPhotos = useCallback(
    async (page: number, tags: string[] = []) => {
      try {
        loadingRef.current = true;
        await loadPhotos(page, 12, tags);
      } catch (error) {
        const apiError = error as ApiError;
        toaster.create({
          title: "Error loading photos",
          description: apiError.message || "Failed to load photos",
          type: "error",
          duration: 5000,
        });
      } finally {
        loadingRef.current = false;
      }
    },
    [loadPhotos]
  );

  const handleLoadMore = useCallback(() => {
    handleLoadPhotos(page + 1, currentTags);
  }, [currentTags, handleLoadPhotos, page]);

  useEffect(() => {
    const tags = debouncedTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setCurrentTags(tags);
    handleLoadPhotos(1, tags);
  }, [debouncedTags, handleLoadPhotos]);

  useEffect(() => {
    if (inView && !isLoading && page < totalPages && !loadingRef.current) {
      handleLoadMore();
    }
  }, [handleLoadMore, inView, isLoading, page, totalPages]);

  const renderSkeleton = () => (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} height="300px" borderRadius="lg" />
      ))}
    </>
  );

  return (
    <Box p={6}>
      <VStack spaceY={6} align="stretch">
        <Box>
          <Input
            placeholder="Search by tags (comma-separated)"
            value={searchTags}
            onChange={(e) => setSearchTags(e.target.value)}
            border={"1px solid gray"}
            borderRadius={"md"}
            _focus={{ borderColor: "gray.700" }}
            _placeholder={{ color: "gray.500" }}
            color={"gray.700"}
            paddingX={3}
            fontSize={"sm"}
          />
          <Text fontSize="sm" color="gray.500" mt={1}>
            Example: nature, landscape, sunset
          </Text>
        </Box>

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

          {isLoading && renderSkeleton()}
        </Grid>

        {!isLoading && photos.length === 0 && (
          <Text textAlign="center" color="gray.500" py={8}>
            No photos found
          </Text>
        )}

        {page < totalPages && (
          <HStack justify="center" py={4} ref={loadMoreRef}>
            <Button
              onClick={handleLoadMore}
              disabled={isLoading}
              variant="ghost"
            >
              Load More
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default FeedPage;

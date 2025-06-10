import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  Button,
  Tag,
  Avatar,
  Input,
  Separator,
  Dialog,
  Portal,
  Skeleton,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiTrash2, FiStar, FiSend } from "react-icons/fi";
import { photosApi } from "@/utils/api";
import { useAuthStore } from "@/store/authStore";
import { Comment, Photo } from "@/types/models";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";

const PhotoDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [comment, setComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const bgColor = useColorModeValue("white", "gray.800");

  const { data: photo, isLoading } = useQuery<Photo>({
    queryKey: ["photo", id],
    queryFn: async () => {
      const response = await photosApi.getPhotoById(id!);
      if (!response.data) {
        throw new Error("Photo not found");
      }
      return response.data as Photo;
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: () => photosApi.deletePhoto(id!),
    onSuccess: () => {
      navigate("/feed");
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toaster.create({
        title: "Photo deleted successfully",
        type: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toaster.create({
        title: "Failed to delete photo",
        description: error.message || "An error occurred",
        type: "error",
        duration: 5000,
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => photosApi.addComment(id!, text),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["photo", id] });
      toaster.create({
        title: "Comment added successfully",
        type: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toaster.create({
        title: "Failed to add comment",
        description: error.message || "An error occurred",
        type: "error",
        duration: 5000,
      });
    },
  });

  const ratePhotoMutation = useMutation({
    mutationFn: (score: number) => photosApi.ratePhoto(id!, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photo", id] });
      toaster.create({
        title: "Rating updated successfully",
        type: "success",
        duration: 3000,
      });
    },
    onError: (error) => {
      toaster.create({
        title: "Failed to update rating",
        description: error.message || "An error occurred",
        type: "error",
        duration: 5000,
      });
    },
  });

  if (isLoading || !photo) {
    return (
      <Grid
        templateColumns={{ base: "1fr", lg: "3fr 2fr" }}
        gap={8}
        bg={bgColor}
        p={6}
        borderRadius="lg"
        shadow="md"
      >
        <Skeleton height="500px" borderRadius="lg" />
        <VStack align="stretch" spaceY={6}>
          <Skeleton height="30px" width="200px" />
          <Skeleton height="20px" width="150px" />
          <Skeleton height="100px" />
        </VStack>
      </Grid>
    );
  }

  const isOwner = photo.createdBy._id === user?._id;
  const userRating = photo.ratings.find((r) => r.user === user?._id)?.score;
  const imageUrl = photo.imageUrl.startsWith("http")
    ? photo.imageUrl
    : `${import.meta.env.VITE_SERVER_URL}${photo.imageUrl}`;

  const handleDelete = async () => {
    await deletePhotoMutation.mutateAsync();
    setIsOpen(false);
  };

  const handleComment = async () => {
    if (comment.trim()) {
      await addCommentMutation.mutateAsync(comment);
    }
  };

  const handleRate = async (score: number) => {
    setSelectedRating(score);
    await ratePhotoMutation.mutateAsync(score);
  };

  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "3fr 2fr" }}
      gap={8}
      bg={bgColor}
      p={6}
      borderRadius="lg"
      shadow="md"
    >
      <Box borderRadius="lg" overflow="hidden">
        <Skeleton loading={isImageLoading} borderRadius="lg">
          <Image
            src={imageUrl}
            alt={photo.title}
            w="100%"
            h="auto"
            objectFit="cover"
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
          />
        </Skeleton>
      </Box>

      <VStack align="stretch" spaceY={6}>
        <VStack align="stretch" spaceY={2}>
          <HStack justify="space-between">
            <Text fontSize="2xl" fontWeight="bold" color={"gray.800"}>
              {photo.title}
            </Text>
            {isOwner && (
              <IconButton
                aria-label="Delete photo"
                colorScheme="red"
                variant="ghost"
                onClick={() => setIsOpen(true)}
                disabled={deletePhotoMutation.isPending}
              >
                <FiTrash2 />
              </IconButton>
            )}
          </HStack>

          {photo.caption && (
            <Text color="gray.600" _dark={{ color: "gray.300" }}>
              {photo.caption}
            </Text>
          )}

          {photo.location && (
            <Text fontSize="sm" color="gray.500">
              📍 {photo.location}
            </Text>
          )}

          <HStack spaceX={2} flexWrap="wrap">
            {photo.tags.map((tag) => (
              <Tag.Root key={tag} size="sm" colorScheme="blue" variant="subtle">
                <Tag.Label>{tag}</Tag.Label>
              </Tag.Root>
            ))}
          </HStack>
        </VStack>

        <Separator />

        <VStack align="stretch" spaceY={2}>
          <Text fontWeight="semibold" color={"gray.600"}>
            Rate this photo
          </Text>
          <HStack spaceX={2}>
            {[1, 2, 3, 4, 5].map((score) => (
              <IconButton
                key={score}
                aria-label={`Rate ${score} stars`}
                colorScheme={
                  score <= (selectedRating || userRating || 0)
                    ? "yellow"
                    : "gray"
                }
                onClick={() => handleRate(score)}
                disabled={ratePhotoMutation.isPending}
              >
                <FiStar
                  color={
                    score <= (selectedRating || userRating || 0)
                      ? "yellow"
                      : "gray"
                  }
                />
              </IconButton>
            ))}
            <Text ml={2} color={"gray.500"}>
              ({photo.ratings.length} rating
              {photo.ratings.length !== 1 ? "s" : ""})
            </Text>
          </HStack>
        </VStack>

        <Separator />

        <VStack align="stretch" spaceY={4}>
          <Text fontWeight="semibold" color={"gray.600"}>
            Comments
          </Text>
          <HStack>
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              border={"1px solid gray"}
              borderRadius={"md"}
              _focus={{ borderColor: "gray.700" }}
              _placeholder={{ color: "gray.500" }}
              color={"gray.700"}
              paddingX={3}
              fontSize={"sm"}
            />
            <IconButton
              aria-label="Send comment"
              onClick={handleComment}
              disabled={addCommentMutation.isPending}
            >
              <FiSend />
            </IconButton>
          </HStack>

          <VStack align="stretch" spaceY={4} maxH="400px" overflowY="auto">
            {photo.comments?.map((comment: Comment) => (
              <HStack
                key={comment._id}
                align="start"
                spaceX={3}
                alignItems={"center"}
              >
                <Avatar.Root size="sm">
                  <Avatar.Fallback name={comment.author.name} />
                </Avatar.Root>
                <Box flex={1}>
                  <Text fontWeight="medium" fontSize={"sm"} color={"gray.800"}>
                    {comment.author.name}
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: "gray.600" }}
                  >
                    {comment.text}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </VStack>

      <Dialog.Root size="xs" open={isOpen} role="alertdialog">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content padding={4} marginTop={"4"} gapY={4}>
              <Dialog.Header
                color={"gray.800"}
                fontSize={"md"}
                fontWeight="semibold"
              >
                Delete Photo
              </Dialog.Header>
              <Dialog.Body color={"gray.800"}>
                Are you sure? This action cannot be undone.
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorScheme="red"
                  onClick={handleDelete}
                  ml={3}
                  disabled={deletePhotoMutation.isPending}
                  bgColor={"red.500"}
                >
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Grid>
  );
};

export default PhotoDetailsPage;

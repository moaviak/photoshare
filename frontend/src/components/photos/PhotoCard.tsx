import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Image,
  Text,
  HStack,
  VStack,
  IconButton,
  Tag,
  Flex,
  Skeleton,
} from "@chakra-ui/react";
import { FiHeart, FiMessageCircle, FiStar } from "react-icons/fi";
import { Photo } from "@/types/models";
import { useColorModeValue } from "../ui/color-mode";
import { useState } from "react";

interface PhotoCardProps {
  photo: Photo;
}

const PhotoCard = ({ photo }: PhotoCardProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const [isLoading, setIsLoading] = useState(true);

  // Convert relative URLs to absolute URLs if needed
  const imageUrl = photo.imageUrl.startsWith("http")
    ? photo.imageUrl
    : `${import.meta.env.VITE_SERVER_URL}${photo.imageUrl}`;

  return (
    <Box
      as="div"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      shadow="md"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
    >
      <RouterLink to={`/photos/${photo._id}`}>
        <Box position="relative" paddingTop="100%" overflow="hidden">
          <Skeleton
            loading={isLoading}
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
          >
            <Image
              src={imageUrl}
              alt={photo.title}
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              objectFit="cover"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </Skeleton>
        </Box>

        <VStack p={4} align="stretch" spaceY={3}>
          <Text fontWeight="semibold" color={textColor}>
            {photo.title}
          </Text>

          {photo.caption && (
            <Text fontSize="sm" color="gray.500">
              {photo.caption}
            </Text>
          )}

          {photo.tags?.length > 0 && (
            <Flex gap={2} flexWrap="wrap">
              {photo.tags.slice(0, 3).map((tag) => (
                <Tag.Root
                  key={tag}
                  size="sm"
                  colorScheme="blue"
                  variant="subtle"
                >
                  <Tag.Label>{tag}</Tag.Label>
                </Tag.Root>
              ))}
              {photo.tags.length > 3 && (
                <Tag.Root size="sm" colorScheme="gray" variant="subtle">
                  <Tag.Label>+{photo.tags.length - 3}</Tag.Label>
                </Tag.Root>
              )}
            </Flex>
          )}

          <HStack justify="space-between" pt={2}>
            <HStack spaceX={4}>
              <HStack>
                <IconButton
                  aria-label={`${photo.ratings.length} ratings`}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.preventDefault()}
                >
                  <FiHeart />
                </IconButton>
                <Text fontSize="sm" color="gray.500">
                  {photo.ratings.length}
                </Text>
              </HStack>

              <HStack>
                <IconButton
                  aria-label={`${photo.comments?.length || 0} comments`}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.preventDefault()}
                >
                  <FiMessageCircle />
                </IconButton>
                <Text fontSize="sm" color="gray.500">
                  {photo.comments?.length || 0}
                </Text>
              </HStack>
            </HStack>

            <HStack>
              <FiStar />
              <Text fontSize="sm" color="gray.500">
                {photo.averageRating?.toFixed(1) || "0.0"}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </RouterLink>
    </Box>
  );
};

export default PhotoCard;

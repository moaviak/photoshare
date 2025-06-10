import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import {
  Box,
  Button,
  Field,
  Input,
  VStack,
  Text,
  Textarea,
  Progress,
  Image,
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { usePhotoStore } from "@/store/photoStore";
import { PhotoUploadData } from "@/types/models";
import { toaster } from "@/components/ui/toaster";

const UploadPage = () => {
  const navigate = useNavigate();
  const { uploadPhoto, isLoading, uploadProgress } = usePhotoStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PhotoUploadData>>({
    title: "",
    caption: "",
    location: "",
    tags: "",
    isPublic: true,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size before compression (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        toaster.create({
          title: "File too large",
          description: "Image will be compressed to meet the 5MB limit",
          type: "info",
          duration: 3000,
        });

        try {
          const options = {
            maxSizeMB: 4.9, // Slightly under 5MB to be safe
            maxWidthOrHeight: 2048,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(file, options);

          // Create preview URL
          const previewUrl = URL.createObjectURL(compressedFile);
          setPreview(previewUrl);

          // Store compressed file in form data
          setFormData((prev) => ({ ...prev, photo: compressedFile }));
        } catch {
          toaster.create({
            title: "Compression failed",
            description: "Please try with a smaller image",
            type: "error",
            duration: 3000,
          });
          e.target.value = ""; // Reset file input
          return;
        }
      } else {
        // File is under 5MB, use as is
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
        setFormData((prev) => ({ ...prev, photo: file }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // Validate required fields
      if (!formData.title || !formData.photo) {
        toaster.create({
          title: "Missing required fields",
          description: "Please provide a title and photo",
          type: "error",
          duration: 3000,
        });
        return;
      }

      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          data.append(
            key,
            typeof value === "boolean" ? value.toString() : value
          );
        }
      });

      await uploadPhoto(data);

      toaster.create({
        title: "Photo uploaded successfully",
        type: "success",
        duration: 3000,
      });

      navigate("/feed");
    } catch (error) {
      toaster.create({
        title: "Upload failed",
        description: error || "Failed to upload photo",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const switchInput = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: switchInput.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <VStack spaceY={6} as="form" onSubmit={handleSubmit}>
        <Field.Root required>
          <Field.Label color="black">Photo</Field.Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            p={1}
            color="gray.700"
            border={"1px solid gray"}
            width={"min-content"}
          />
          {preview && (
            <Box mt={4}>
              <Image
                src={preview}
                alt="Preview"
                maxH="300px"
                objectFit="contain"
                borderRadius="md"
              />
            </Box>
          )}
        </Field.Root>

        <Field.Root required>
          <Field.Label color="black">Title</Field.Label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your photo a title"
            border={"1px solid gray"}
            borderRadius={"md"}
            _focus={{ borderColor: "gray.700" }}
            _placeholder={{ color: "gray.500" }}
            color={"gray.700"}
            paddingX={3}
            fontSize={"sm"}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label color="black">Caption</Field.Label>
          <Textarea
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            placeholder="Add a description"
            border={"1px solid gray"}
            borderRadius={"md"}
            _focus={{ borderColor: "gray.700" }}
            _placeholder={{ color: "gray.500" }}
            color={"gray.700"}
            paddingX={3}
            fontSize={"sm"}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label color="black">Location</Field.Label>
          <Input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Where was this photo taken?"
            border={"1px solid gray"}
            borderRadius={"md"}
            _focus={{ borderColor: "gray.700" }}
            _placeholder={{ color: "gray.500" }}
            color={"gray.700"}
            paddingX={3}
            fontSize={"sm"}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label color="black">Tags</Field.Label>
          <Input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Add tags separated by commas"
            border={"1px solid gray"}
            borderRadius={"md"}
            _focus={{ borderColor: "gray.700" }}
            _placeholder={{ color: "gray.500" }}
            color={"gray.700"}
            paddingX={3}
            fontSize={"sm"}
          />
          <Text fontSize="sm" color="gray.500" mt={1}>
            Separate tags with commas (e.g., nature, landscape, sunset)
          </Text>
        </Field.Root>

        <Checkbox.Root
          checked={formData.isPublic}
          onCheckedChange={(details) =>
            setFormData((prev) => ({ ...prev, isPublic: !!details.checked }))
          }
          size={"sm"}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label color={"gray.800"}>
            Make this photo public
          </Checkbox.Label>
        </Checkbox.Root>

        {isLoading && uploadProgress > 0 && (
          <Box w="100%">
            <Progress.Root size="sm" colorScheme="blue">
              <HStack gap="5">
                <Progress.Label>Uploading</Progress.Label>
                <Progress.Track flex="1">
                  <Progress.Range />
                </Progress.Track>
                <Progress.ValueText>{uploadProgress}</Progress.ValueText>
              </HStack>
            </Progress.Root>
          </Box>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          loading={isLoading}
          loadingText="Uploading..."
          w="full"
        >
          Upload Photo
        </Button>
      </VStack>
    </Box>
  );
};

export default UploadPage;

import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Button, Input, Field, VStack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import AuthCard from "@/components/auth/AuthCard";
import type { ApiError } from "@/types/models";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");
      await registerUser(data.name, data.email, data.password);
      navigate("/feed", { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to register");
    }
  };

  return (
    <AuthCard title="Create your account">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4}>
          <Field.Root invalid={!!errors.name}>
            <Field.Label color="black">Name</Field.Label>
            <Input
              {...register("name")}
              border={"1px solid var(--chakra-colors-gray-600)"}
              color={"gray.600"}
              paddingX={3}
            />
            <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.email}>
            <Field.Label color="black">Email</Field.Label>
            <Input
              type="email"
              {...register("email")}
              border={"1px solid var(--chakra-colors-gray-600)"}
              color={"gray.600"}
              paddingX={3}
            />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label color="black">Password</Field.Label>
            <Input
              type="password"
              {...register("password")}
              border={"1px solid var(--chakra-colors-gray-600)"}
              color={"gray.600"}
              paddingX={3}
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.confirmPassword}>
            <Field.Label color="black">Confirm Password</Field.Label>
            <Input
              type="password"
              {...register("confirmPassword")}
              border={"1px solid var(--chakra-colors-gray-600)"}
              color={"gray.600"}
              paddingX={3}
            />
            <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
          </Field.Root>

          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            loading={isSubmitting}
          >
            Register
          </Button>

          <Text fontSize="sm" color={"gray.500"}>
            Already have an account?{" "}
            <RouterLink
              to="/login"
              style={{ color: "var(--chakra-colors-blue-500)" }}
            >
              Login here
            </RouterLink>
          </Text>
        </VStack>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;

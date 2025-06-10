import { useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { Button, Field, Input, VStack, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import AuthCard from "@/components/auth/AuthCard";
import type { ApiError } from "@/types/models";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      await login(data.email, data.password);
      const from = location.state?.from?.pathname || "/feed";
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to log in");
    }
  };

  return (
    <AuthCard title="Login to your account">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={4}>
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
            Login
          </Button>

          <Text fontSize="sm" color={"gray.500"}>
            Don't have an account?{" "}
            <RouterLink
              to="/register"
              style={{ color: "var(--chakra-colors-blue-500)" }}
            >
              Register here
            </RouterLink>
          </Text>
        </VStack>
      </form>
    </AuthCard>
  );
};

export default LoginPage;

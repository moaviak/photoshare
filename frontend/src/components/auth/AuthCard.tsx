import { Box, Container, Heading, Stack } from "@chakra-ui/react";

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

const AuthCard = ({ title, children }: AuthCardProps) => {
  return (
    <Container maxW="md" py={12}>
      <Box bg="white" _dark={{ bg: "gray.800" }} p={8} rounded="lg" shadow="md">
        <Stack gap="6">
          <Heading
            size="lg"
            color="black"
            _dark={{ color: "white" }}
            fontSize={"lg"}
          >
            {title}
          </Heading>
          {children}
        </Stack>
      </Box>
    </Container>
  );
};

export default AuthCard;

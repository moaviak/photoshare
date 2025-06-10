import { Box, Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/navigation/Navbar";
import { Toaster } from "@/components/ui/toaster";

const RootLayout = () => {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }} paddingX={6}>
      <Navbar />
      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
      <Toaster />
    </Box>
  );
};

export default RootLayout;

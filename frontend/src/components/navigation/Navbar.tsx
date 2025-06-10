import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Text,
  Menu,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { FiUpload, FiUser } from "react-icons/fi";

const NavLink = ({
  to,
  children,
  ...props
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <Link to={to} style={{ textDecoration: "none" }} {...props}>
    {children}
  </Link>
);

const Navbar = () => {
  const { user, isAuthenticated, logout, toggleView } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <Box
      py={4}
      borderBottom="1px"
      borderColor="gray.200"
      _dark={{ borderColor: "gray.700" }}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <NavLink to="/">
            <Text fontSize="2xl" fontWeight="bold">
              PhotoShare
            </Text>
          </NavLink>

          <HStack gap={4}>
            {isAuthenticated ? (
              <>
                {user?.currentView === "creator" && (
                  <NavLink to="/upload">
                    <IconButton aria-label="Upload photo" as={FiUpload} />
                  </NavLink>
                )}

                <Menu.Root>
                  <Menu.Trigger as={IconButton} aria-label="User menu">
                    <FiUser />
                  </Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item value="profile">
                      <NavLink to="/profile">Profile</NavLink>
                    </Menu.Item>
                    {user?.role === "creator" && (
                      <Menu.Item value="toggle-view" onClick={toggleView}>
                        Switch to{" "}
                        {user.currentView === "creator"
                          ? "Consumer"
                          : "Creator"}{" "}
                        View
                      </Menu.Item>
                    )}
                    <Menu.Item value="logout" onClick={handleLogout}>
                      Logout
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Root>
              </>
            ) : (
              <HStack gap={2}>
                <NavLink to="/login">
                  <Button variant="ghost" color="white">
                    Login
                  </Button>
                </NavLink>
                <NavLink to="/register">
                  <Button color="white">Register</Button>
                </NavLink>
              </HStack>
            )}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;

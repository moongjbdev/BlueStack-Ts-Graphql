import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import {
  MeDocument,
  MeQuery,
  useLogoutMutation,
  useMeQuery,
} from "../generated/graphql";

const NavBar = () => {
  const { data, loading: useMeQueryLoading } = useMeQuery();
  const [logoutUser, { loading: useLogoutMutaionLoading }] =
    useLogoutMutation();

  const handleLogoutUser = async () => {
    await logoutUser({
      update(cache, { data }) {
        if (data?.logout) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: null,
            },
          });
        }
      },
    });
  };
  if (useMeQueryLoading) return <Text>Loading...</Text>;

  return (
    <Box bg="tan" p={4}>
      <Flex maxW={800} justifyContent="space-between" align="center" m="auto">
        {/* Logo */}
        <Link href="/">
          <Heading as="h1" size="lg" cursor="pointer">
            Blue Page
          </Heading>
        </Link>

        {/* Nếu đã login, hiển thị Logout */}
        {data?.me ? (
          <Button
            colorScheme="teal"
            onClick={handleLogoutUser}
            isLoading={useLogoutMutaionLoading}
          >
            Logout
          </Button>
        ) : (
          /* Nếu chưa login, hiển thị Login & Register */
          <Flex>
            <Link href="/login" passHref>
              <Button as="a" variant="link" mr={4}>
                Login
              </Button>
            </Link>
            <Link href="/register" passHref>
              <Button as="a" variant="link">
                Register
              </Button>
            </Link>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default NavBar;

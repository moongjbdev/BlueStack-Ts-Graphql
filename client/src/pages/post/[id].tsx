import {
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Button,
} from "@chakra-ui/react";
import React from "react";
import { usePostQuery } from "../../generated/graphql";
import { useRouter } from "next/router";

const Post = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = usePostQuery({
    variables: { id: id as string },
    skip: !id,
  });

  if (loading) return <Spinner />;
  if (error)
    return (
      <Alert status="error">
        <AlertIcon />
        Something wrong happened
      </Alert>
    );

  if (!data?.post)
    return (
      <Alert status="warning">
        <AlertIcon />
        Not found post
      </Alert>
    );

  return (
    <Box
      maxW="800px"
      mx="auto"
      mt={6}
      p={4}
      borderWidth="1px"
      borderRadius="md"
    >
      <Heading as="h1" size="xl" mb={4}>
        {data.post.title}
      </Heading>
      <Text fontSize="lg">{data.post.text}</Text>
      <Text mt={4} fontSize="sm" color="gray.500">
        Posted by: {data.post.user.username} -{" "}
        {new Date(data.post.createdAt).toLocaleDateString()}
      </Text>
      <Button
        mt={6}
        colorScheme="teal"
        onClick={() => {
          router.push("/");
        }}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default Post;

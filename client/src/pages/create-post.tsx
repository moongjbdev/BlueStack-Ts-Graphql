import React from "react";
import { useRouter } from "next/router";
import { useCheckAuth } from "../utils/useCheckAuth";
import { Box, Button, Flex, Spinner, useToast } from "@chakra-ui/react";
import Layout from "../components/Layout";
import { Form, Formik } from "formik";
import InputField from "../components/InputField";
import { CreatePostInput, useCreatePostMutation } from "../generated/graphql";

const CreatePost = () => {
  const router = useRouter();
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [createPost] = useCreatePostMutation();

  const toast = useToast();
  const handleCreatePost = async (
    values: CreatePostInput,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      const response = await createPost({
        variables: {
          createPostInput: values,
        },
        update: (cache, { data }) => {
          cache.modify({
            fields: {
              posts(existing = { totalCount: 0, paginatedPosts: [] }) {
                if (data?.createPost.success && data.createPost.post) {
                  //Post:_new_id
                  const newPostRef = cache.identify(data?.createPost?.post);
                  const newPostAfterCreation = {
                    ...existing,
                    totalCount: existing.totalCount + 1,
                    paginatedPosts: [
                      { __ref: newPostRef },
                      ...existing.paginatedPosts, // [{__ref: "Post:1", {__ref: "Post:2"}]
                    ],
                  };
                  return newPostAfterCreation;
                }
              },
            },
          });
        },
      });

      if (response.data?.createPost.success) {
        toast({
          title: `Create post successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        router.push("/");
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
    setSubmitting(false);
  };

  if (authLoading || (!authLoading && !authData?.me)) {
    return (
      <Flex align="center" justifyContent="center" minH="100vh">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Layout>
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={(values, { setSubmitting }) =>
          handleCreatePost(values, setSubmitting)
        }
      >
        {({ isSubmitting }) => (
          <Form>
            <Box>
              <InputField
                name="title"
                placeholder="Title of post"
                label="Title"
                type="text"
              />
            </Box>

            <Box mt={4}>
              <InputField
                name="text"
                placeholder="Content of post"
                label="Content"
                as="textarea"
              />
            </Box>

            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
              width="full"
            >
              Create Post
            </Button>
            <Button
              colorScheme="gray"
              mt={4}
              onClick={() => router.push("/")}
              width="full"
            >
              Back to Home
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default CreatePost;

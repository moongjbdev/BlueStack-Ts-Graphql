import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { addApolloState, initializeApollo } from "../lib/apolloClient";
import Link from "next/link";
import Layout from "../components/Layout";
import PostEditDeleteButton from "../components/PostEditDeleteButton";
import { NetworkStatus } from "@apollo/client";
const litmit = 3;
const Index = () => {
  const { data, loading, error, fetchMore, networkStatus } = usePostsQuery({
    variables: {
      limit: litmit,
    },

    // component nao co render boi post query, se rerender khi networkStatus thay doi, tuc la fetchMore
    notifyOnNetworkStatusChange: true,
  });

  const loadingMorePage = networkStatus === NetworkStatus.fetchMore;
  const loadMorePost = () =>
    fetchMore({
      variables: {
        limit: litmit,
        cursor: data?.posts?.cursor,
      },
    });

  return (
    <Layout>
      {loading && !loadMorePost ? (
        <Flex align="center" justifyContent="center" minH="100vh">
          <Spinner />
        </Flex>
      ) : (
        <Stack spacing={8}>
          {data?.posts?.paginatedPosts.map((post) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <Box flex={1}>
                {/* Chỉ bọc Link cho phần tiêu đề & nội dung */}
                <Link href={`/post/${post.id}`}>
                  <Heading>{post.title}</Heading>
                  <Text>Posted by: {post.user.username}</Text>
                  <Text mt={4}>{post.textSnippet}</Text>
                </Link>

                {/* Nút Edit/Delete nằm ngoài Link */}
                <Flex align="center">
                  <Box ml="auto">
                    <PostEditDeleteButton />
                  </Box>
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data?.posts?.hasMore && (
        <Flex>
          <Box m="auto" my={8}>
            <Button onClick={loadMorePost} isLoading={loadingMorePage}>
              {loadingMorePage ? "Loading" : "More..."}
            </Button>
          </Box>
        </Flex>
      )}
    </Layout>
  );
};

//query de dua vao cache cua apollo
export const getStaticProps = async () => {
  const apolloClient = initializeApollo();
  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit: litmit,
    },
  });
  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Index;

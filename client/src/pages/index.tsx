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
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetStaticProps,
  GetStaticPropsContext,
} from "next";
import UpvoteSection from "../components/UpvoteSection";

const limit = 3;

const Index = () => {
  const { data, loading, error, fetchMore, networkStatus } = usePostsQuery({
    variables: { limit },
    notifyOnNetworkStatusChange: true,
  });

  const loadingMorePage = networkStatus === NetworkStatus.fetchMore;

  const loadMorePost = () =>
    fetchMore({ variables: { cursor: data?.posts?.cursor } });

  // Kiểm tra nếu không có dữ liệu
  if (!data && !loading) {
    return (
      <Layout>
        <Flex align="center" justifyContent="center" minH="100vh">
          <Text fontSize="xl" color="gray.500">
            Không có bài viết nào để hiển thị.
          </Text>
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout>
      {loading && !loadingMorePage ? (
        <Flex align="center" justifyContent="center" minH="100vh">
          <Spinner />
        </Flex>
      ) : error ? (
        <Text>Đã xảy ra lỗi khi tải dữ liệu.</Text>
      ) : (
        <Stack spacing={8}>
          {data?.posts?.paginatedPosts.length === 0 ? ( // Kiểm tra nếu mảng paginatedPosts rỗng
            <Flex align="center" justifyContent="center" minH="50vh">
              <Text fontSize="xl" color="gray.500">
                Không có bài viết nào để hiển thị.
              </Text>
            </Flex>
          ) : (
            data?.posts?.paginatedPosts.map((post, index) => (
              <Flex
                key={`${post.id}-${index}`}
                p={5}
                shadow="md"
                borderWidth="1px"
              >
                <UpvoteSection post={post} />

                <Box flex={1}>
                  <Link href={`/post/${post.id}`}>
                    <Heading>{post.title}</Heading>
                    <Text>Posted by: {post.user?.username ?? "Unknown"}</Text>
                    <Text mt={4}>{post.textSnippet}</Text>
                  </Link>
                  <Flex align="center" mt={2}>
                    <Box ml="auto">
                      {post.user?.id.toString() === post.userId.toString() && (
                        <PostEditDeleteButton
                          postId={post.id}
                          authorId={post.userId.toString()}
                        />
                      )}
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            ))
          )}
        </Stack>
      )}
      {data?.posts?.hasMore && data && (
        <Flex>
          <Box m="auto" my={8}>
            <Button
              onClick={() => {
                loadMorePost();
              }}
              isLoading={loadingMorePage}
            >
              {loadingMorePage ? "Loading" : "More..."}
            </Button>
          </Box>
        </Flex>
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const apolloClient = initializeApollo({ headers: context.req.headers });
  await apolloClient.query({
    query: PostsDocument,
    variables: { limit },
  });
  return addApolloState(apolloClient, { props: {} });
};

export default Index;

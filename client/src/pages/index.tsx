import NavBar from "../components/NavBar";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { addApolloState, initializeApollo } from "../lib/apolloClient";

const Index = () => {
  const { data, loading } = usePostsQuery();

  return (
    <div>
      <NavBar />
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <h1>Posts</h1>
          {data?.posts?.map((post) => (
            <div key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();
  await apolloClient.query({
    query: PostsDocument,
  });
  return addApolloState(apolloClient, {
    props: {},
  });
};

export default Index;

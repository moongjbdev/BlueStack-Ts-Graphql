import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import {
  PaginatedPosts,
  useDeletePostMutation,
  useMeQuery,
} from "../generated/graphql";

interface PostEditButtonProps {
  postId: string;
  authorId: string;
}

const PostEditDeleteButton = ({ postId, authorId }: PostEditButtonProps) => {
  const { data } = useMeQuery(); // Lấy thông tin user đăng nhập

  // Nếu user chưa đăng nhập hoặc không phải tác giả -> Không hiển thị nút
  const [deletePostMutation] = useDeletePostMutation();
  // if (!data?.me || data.me.id !== authorId) return null;
  if (!data?.me || data.me.id.toString() !== authorId.toString()) return null;

  // const onPostDelete = async () => {
  //   try {
  //     const response = await deletePostMutation({
  //       variables: { id: postId },
  //       update(cache, { data }) {
  //         if (data?.deletePost.success) {
  //           cache.modify({
  //             fields: {
  //               posts(existingPosts) {
  //                 const newPostAfterDelete = {
  //                   ...existingPosts,
  //                   totalCount: existingPosts.totalCount - 1,
  //                   paginatedPosts: existingPosts.paginatedPosts.filter(
  //                     (postRefObject: any) =>
  //                       postRefObject.__ref !== `Post:${postId}`
  //                   ),
  //                 };
  //                 return newPostAfterDelete;
  //               },
  //             },
  //           });
  //         }
  //       },
  //     });
  //     console.log("Delete Post Response:", response);
  //   } catch (err) {
  //     console.error("Error deleting post:", err);
  //   }
  // };
  const onPostDelete = async () => {
    try {
      const response = await deletePostMutation({
        variables: { id: postId },
        update(cache, { data }) {
          if (data?.deletePost.success) {
            cache.modify({
              fields: {
                posts(
                  existingPosts = {
                    paginatedPosts: [],
                    cursor: null,
                    hasMore: false,
                    totalCount: 0,
                  },
                  { readField }
                ) {
                  // Lọc ra bài viết đã bị xóa
                  const updatedPosts = existingPosts.paginatedPosts.filter(
                    (postRefObject: any) =>
                      readField("id", postRefObject) !== postId
                  );

                  // Cập nhật cursor dựa trên bài viết cuối cùng trong danh sách
                  const newCursor =
                    updatedPosts.length > 0
                      ? (readField(
                          "createdAt",
                          updatedPosts[updatedPosts.length - 1]
                        ) as string)
                      : null;

                  // Cập nhật hasMore
                  const newHasMore =
                    updatedPosts.length < existingPosts.totalCount - 1;

                  return {
                    ...existingPosts,
                    totalCount: existingPosts.totalCount - 1,
                    paginatedPosts: updatedPosts,
                    cursor: newCursor,
                    hasMore: newHasMore,
                  };
                },
              },
            });
          }
        },
      });
      console.log("Delete Post Response:", response);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <Box>
      <Link href={`/post/edit/${postId}`}>
        <IconButton icon={<EditIcon />} aria-label="edit" mr={4} />
      </Link>
      <IconButton
        icon={<DeleteIcon />}
        aria-label="delete"
        colorScheme="red"
        onClick={onPostDelete}
      />
    </Box>
  );
};

export default PostEditDeleteButton;

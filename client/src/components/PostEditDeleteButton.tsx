import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { useMeQuery } from "../generated/graphql";

interface PostEditButtonProps {
  postId: string;
  authorId: string;
}

const PostEditDeleteButton = ({ postId, authorId }: PostEditButtonProps) => {
  const { data } = useMeQuery(); // Lấy thông tin user đăng nhập

  // Nếu user chưa đăng nhập hoặc không phải tác giả -> Không hiển thị nút
  if (!data?.me || data.me.id !== authorId) return null;

  return (
    <Box>
      <Link href={`/post/edit/${postId}`}>
        <IconButton icon={<EditIcon />} aria-label="edit" mr={4} />
      </Link>
      <IconButton icon={<DeleteIcon />} aria-label="delete" colorScheme="red" />
    </Box>
  );
};

export default PostEditDeleteButton;

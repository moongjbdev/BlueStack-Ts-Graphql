import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  PostWithUserInfoFragment,
  useVoteMutation,
  VoteType,
} from "../generated/graphql";

interface UpVoteSectionProps {
  post: PostWithUserInfoFragment; // Props nhận vào một bài viết
}

const UpvoteSection: React.FC<UpVoteSectionProps> = ({ post }) => {
  const [vote] = useVoteMutation(); // Sử dụng mutation vote
  const [upvoteLoading, setUpvoteLoading] = useState(false); // Trạng thái loading cho upvote
  const [downvoteLoading, setDownvoteLoading] = useState(false); // Trạng thái loading cho downvote
  // Hàm xử lý upvote
  const handleUpvote = async () => {
    setUpvoteLoading(true); // Bắt đầu loading cho upvote
    try {
      await vote({
        variables: {
          postId: parseInt(post.id),
          inputVoteValue: VoteType.Upvote,
        },
      });
    } catch (err) {
      console.error("Error upvoting:", err);
    } finally {
      setUpvoteLoading(false); // Kết thúc loading cho upvote
    }
  };

  // Hàm xử lý downvote
  const handleDownvote = async () => {
    setDownvoteLoading(true); // Bắt đầu loading cho downvote
    try {
      await vote({
        variables: {
          postId: parseInt(post.id),
          inputVoteValue: VoteType.Downvote,
        },
      });
    } catch (err) {
      console.error("Error downvoting:", err);
    } finally {
      setDownvoteLoading(false); // Kết thúc loading cho downvote
    }
  };

  return (
    <Flex direction="column" align="center" mr={4}>
      {/* Nút upvote */}
      <IconButton
        icon={<ChevronUpIcon />}
        aria-label="upvote"
        onClick={handleUpvote}
        isLoading={upvoteLoading} // Hiển thị trạng thái loading chỉ cho upvote
        colorScheme={post.voteType === 1 ? "green" : undefined} // Tô màu nếu đã upvote
      />
      {/* Điểm số */}
      <Text fontSize="lg" fontWeight="bold" my={2}>
        {post.points}
      </Text>
      {/* Nút downvote */}
      <IconButton
        icon={<ChevronDownIcon />}
        aria-label="downvote"
        onClick={handleDownvote}
        isLoading={downvoteLoading} // Hiển thị trạng thái loading chỉ cho downvote
        colorScheme={post.voteType === -1 ? "red" : undefined} // Tô màu nếu đã downvote
      />
    </Flex>
  );
};

export default UpvoteSection;

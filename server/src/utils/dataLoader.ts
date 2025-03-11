import DataLoader from "dataloader";
import { User } from "../entities/User";
import { Upvote } from "../entities/Upvote";
interface VoteTypeConditions {
  postId: number;
  userId: number;
}
const batchGetUsers = async (userIds: number[]) => {
  const users = await User.findByIds(userIds);
  return userIds.map((userId) => users.find((user) => user.id === userId));
};

const batchGetVoteTypes = async (voteTypeConditions: VoteTypeConditions[]) => {
  const voteTypes = await Upvote.findByIds(voteTypeConditions);
  return voteTypeConditions.map((voteTypeCondition) =>
    voteTypes.find(
      (voteType) =>
        voteType.postId === voteTypeCondition.postId &&
        voteType.userId === voteTypeCondition.userId
    )
  );
};

export const buildDataLoaders = () => ({
  userLoader: new DataLoader<number, User | undefined>((userIds) =>
    batchGetUsers(userIds as number[])
  ),
  voteTypeLoader: new DataLoader<VoteTypeConditions, Upvote | undefined>(
    (voteTypeConditions) =>
      batchGetVoteTypes(voteTypeConditions as VoteTypeConditions[])
  ),
});

import { Post } from "../entities/Post";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class PaginatedPosts {
  @Field()
  totalCount: number;

  @Field((_type) => String, { nullable: true })
  cursor: string | null;

  @Field()
  hasMore: boolean;

  @Field((_type) => [Post])
  paginatedPosts: Post[];
}

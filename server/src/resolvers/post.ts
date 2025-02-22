import { UpdatePostInput } from "../types/UpdatePostInput";
import { Post } from "../entities/Post";
import { CreatePostInput } from "../types/CreatePostInput";
import { PostMutationResponse } from "../types/PostMutationResponse";
import {
  Resolver,
  Mutation,
  Arg,
  Query,
  ID,
  UseMiddleware,
  FieldResolver,
  Root,
  Int,
  Ctx,
} from "type-graphql";
import { checkAuth } from "../middleware/checkAuth";
import { User } from "../entities/User";
import { PaginatedPosts } from "../types/PaginatedPosts";
import { LessThan } from "typeorm";
import { Context } from "../types/Context";

@Resolver((_of) => Post)
export class PostResolver {
  @FieldResolver((_return) => String)
  textSnippet(@Root() parentPost: Post) {
    return parentPost.text.length > 100
      ? parentPost.text.slice(0, 100) + "..."
      : parentPost.text;
  }

  @FieldResolver((_return) => User)
  async user(@Root() parentPost: Post) {
    return await User.findOne({ where: { id: parentPost.userId } });
  }

  //Create post
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg("createPostInput") createPostInput: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title: createPostInput.title,
        text: createPostInput.text,
        userId: req.session.userId,
      });
      newPost.save();
      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post: newPost,
      };
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: "Internal Server Error",
      };
    }
  }

  //Get all posts
  @Query((_return) => PaginatedPosts, { nullable: true })
  async posts(
    @Arg("cursor", (_type) => String, { nullable: true })
    cursor?: string | null,
    @Arg("limit", (_type) => Int, { defaultValue: 3 }) limit: number = 3
  ): Promise<PaginatedPosts | null> {
    try {
      const totalPostCount = await Post.count();
      const realLimit = Math.min(10, limit);

      const findOptions: { [key: string]: any } = {
        order: { createdAt: "DESC" },
        take: realLimit + 1,
      };

      if (cursor) {
        findOptions.where = { createdAt: LessThan(cursor) };
      }

      const posts = await Post.find(findOptions);
      const hasMore = posts.length > realLimit;
      if (hasMore) posts.pop();

      return {
        totalCount: totalPostCount,
        cursor: posts[posts.length - 1].createdAt,
        hasMore: hasMore,
        PaginatedPosts: posts,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  //Get single post by id
  @Query((_return) => Post, { nullable: true })
  async post(
    @Arg("id", (_type) => ID) postId: number
  ): Promise<Post | undefined> {
    try {
      return await Post.findOne(postId);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  //Update post by id
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg("updatePostInput") updatePostInput: UpdatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const { id, title, text } = updatePostInput;
      const existingPost = await Post.findOne(id);
      if (!existingPost) {
        return {
          code: 404,
          success: false,
          message: `Post with id: ${id} not found`,
          errors: [
            {
              field: "id",
              message: `Post not found`,
            },
          ],
        };
      }
      if (existingPost.userId !== req.session.userId) {
        return {
          code: 403,
          success: false,
          message: "Unauthorized to update this post",
          errors: [
            {
              field: "id",
              message: "Unauthorized to update this post",
            },
          ],
        };
      }
      //update
      existingPost.title = title;
      existingPost.text = text;
      await existingPost.save();

      return {
        code: 200,
        success: true,
        message: "Post updated successfully",
        post: existingPost,
      };
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: "Internal Server Error",
      };
    }
  }

  //delete a post with if
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg("id", (_type) => ID) postId: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({ where: { id: postId } });
      if (!existingPost) {
        return {
          code: 404,
          success: false,
          message: `Post with id: ${postId} not found`,
          errors: [
            {
              field: "id",
              message: `Post not found`,
            },
          ],
        };
      }
      if (existingPost.userId !== req.session.userId) {
        return {
          code: 403,
          success: false,
          message: "Unauthorized to delete this post",
          errors: [
            {
              field: "id",
              message: "Unauthorized to delete this post",
            },
          ],
        };
      }
      await Post.delete({ id: postId });
      return {
        code: 200,
        success: true,
        message: "Post deleted successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: "Internal Server Error",
      };
    }
  }
}

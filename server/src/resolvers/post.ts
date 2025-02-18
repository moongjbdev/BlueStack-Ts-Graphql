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
} from "type-graphql";
import { checkAuth } from "../middleware/checkAuth";

@Resolver()
export class PostResolver {
  //Create post
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg("createPostInput") createPostInput: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title: createPostInput.title,
        text: createPostInput.text,
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
  @Query((_return) => [Post], { nullable: true })
  async posts(): Promise<Post[] | null> {
    try {
      return await Post.find();
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
    @Arg("upadtePostInput") updatePostInput: UpdatePostInput
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
    @Arg("id", (_type) => ID) postId: number
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne(postId);
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

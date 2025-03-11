import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Post } from "./Post";
import { Upvote } from "./Upvote";
@ObjectType() // ObjectType dinh nghia cho GraphQl
@Entity() //db table
export class User extends BaseEntity {
  @Field((_type) => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field((_type) => String)
  @Column({ unique: true })
  username!: string;

  @Field((_type) => String)
  @Column({ unique: true })
  email!: string;

  // Không có @Field() -> trường này sẽ không được expose trong GraphQL
  @Column()
  password!: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.user, { lazy: true })
  posts: Post[];

  @OneToMany((_to) => Upvote, (upvote) => upvote.user)
  upvotes: Upvote[];

  @Field((_type) => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field((_type) => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}

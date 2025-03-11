import { Upvote } from "./Upvote";
import { Field, ID, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field((_return) => ID)
  id!: number;

  @Field()
  @Column()
  userId!: number; // relationship with User entity (one-to-many)

  @Field((_type) => User)
  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany((_to) => Upvote, (upvote) => upvote.post)
  upvotes: Upvote[];

  @Field()
  @Column({ default: 0 })
  points!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  voteType!: number;

  @Field()
  @Column()
  text!: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}

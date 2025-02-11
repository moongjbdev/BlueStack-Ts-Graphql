import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
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

  @Field((_type) => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field((_type) => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}

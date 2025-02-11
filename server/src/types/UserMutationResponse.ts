import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./MutationResponse";
import { User } from "../entities/User";
import { FieldError } from "./fieldError";

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  user?: User;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}

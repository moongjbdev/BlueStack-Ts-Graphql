import { Resolver, Query } from "type-graphql";
@Resolver()
export class HelloResolver {
  @Query((_returns) => String)
  hello() {
    return "Hello World!";
  }
}

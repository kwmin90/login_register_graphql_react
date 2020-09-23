import { User } from "../graphql/user";
import { Query, Resolver } from "type-graphql";
import { UserModel } from "../models/user.model";

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await UserModel.find();
  }
}

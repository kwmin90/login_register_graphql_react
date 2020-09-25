import { User } from "../models/user";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { UserModel } from "../models/user.model";
import { compare, genSalt, hash } from "bcrypt";
import { Context } from "../utils/context";
import { sign } from "jsonwebtoken";
import * as fs from "fs";

const RSA_PRIVATE_KEY = fs.readFileSync("./private.key");

@ObjectType()
class LoginResponse {
  @Field()
  idToken?: string;
  @Field(() => User)
  user?: User;
}

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await UserModel.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("firstName") firstName: string,
    @Arg("lastName") lastName: string,
    @Arg("password") password: string
  ) {
    const salt = await genSalt(10);
    try {
      const user = await new UserModel({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: await hash(password, salt),
      });
      await user.save();
    } catch (err) {
      console.log(err);
      return false;
    }
    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: Context
  ): Promise<LoginResponse> {
    const user = await UserModel.findOne({ email: email });
    if (!user) throw new Error("Invalid email or password");
    const valid = await compare(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    const jwtBearerToken = sign({ userId: user.id }, RSA_PRIVATE_KEY, {
      algorithm: "RS256",
      expiresIn: "15m",
    });
    res.cookie("token", jwtBearerToken, {
      httpOnly: true,
    });
    return {
      idToken: jwtBearerToken,
      user,
    };
  }
}

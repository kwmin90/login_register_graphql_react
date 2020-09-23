import { prop } from "@typegoose/typegoose";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => ID, { nullable: true })
  _id?: string;

  @Field()
  @prop({ required: true })
  firstName: string;

  @Field()
  @prop({ required: true })
  lastName: string;

  @Field()
  @prop({ required: true })
  email: string;

  @Field()
  @prop({ required: true })
  password: string;
}

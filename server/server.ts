import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/userResolver";
import "dotenv/config";
import "reflect-metadata";

(async () => {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  mongoose.connect(`${process.env.MONGODB_CONNECTION}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  const connection = mongoose.connection;

  connection.on("error", () => {
    console.log("connection error");
  });
  connection.once("open", () => {
    console.log("mongodb connection established");
  });

  app.use(
    "/graphql",
    graphqlHTTP({
      schema: await buildSchema({
        resolvers: [UserResolver],
      }),
      graphiql: true,
    })
  );

  app.listen(4000, () => {
    console.log("express server started");
  });
})();

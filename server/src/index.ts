require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/user";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import { __prod__, COOKIE_NAME } from "./constants";
import { Context } from "./types/Context";
import { PostResolver } from "./resolvers/post";
const main = async () => {
  await createConnection({
    type: "postgres",
    database: "bluedis",
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD_DEV,
    logging: true,
    synchronize: true,
    entities: [User, Post],
  });

  const app = express();

  //session cookies
  const mongoURI =
    process.env.DB_MONGODB_SESSION || "mongodb://localhost:27017/";
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // app.use(
  //   cors({
  //     origin: "http://localhost:4000", // FE của bạn
  //     credentials: true, // Quan trọng để gửi cookie
  //   })
  // );

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({ mongoUrl: mongoURI }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true, //JS from FE cannot read cookies
        secure: __prod__, // Cookie only sent over HTTPS
        sameSite: "lax", // Protection against CSRF attacks,
      },
      secret:
        (process.env.SESSION_SECRET_DEV_PROD as string) || "my-secret-key",
      resave: false,
      saveUninitialized: false, // dont save empty values session
    })
  );

  // Apollo Server setup
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(
      `App is running on port ${PORT}, Graphql started on localhost:${PORT}${apolloServer.graphqlPath}`
    )
  );
};

main().catch((error) => console.error(error));

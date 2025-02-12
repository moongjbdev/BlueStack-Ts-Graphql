import { User } from "../entities/User";
import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateregisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { Context } from "../types/Context";
import { COOKIE_NAME } from "../constants";
@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    const validateRegisterInputErrors = validateregisterInput(registerInput);
    if (validateRegisterInputErrors !== null)
      return {
        code: 400,
        success: false,
        ...validateRegisterInputErrors,
      };
    try {
      const { username, email, password } = registerInput;
      const existingUser = await User.findOne({
        where: [{ email }, { username }],
      });
      if (existingUser)
        return {
          code: 400,
          success: false,
          message: "Duplicate username or password",
          errors: [
            {
              field: existingUser.email === email ? "email" : "username",
              message:
                existingUser.email === email
                  ? "Email already exists"
                  : "Username already exists",
            },
          ],
        };

      const hashedPassword = await argon2.hash(password);

      const newUser = await User.create({
        email,
        username,
        password: hashedPassword,
      });

      await newUser.save();

      return {
        code: 200,
        success: true,
        message: "User registration successful",
        user: newUser,
      };
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: "Internal Server Error",
      };
    }
  }
  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") loginInput: LoginInput,
    @Ctx() { req, res }: Context
  ): Promise<UserMutationResponse> {
    try {
      const { usernameOrEmail, password } = loginInput;
      const existingUser = await User.findOne(
        usernameOrEmail.includes("@")
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      );
      if (!existingUser) {
        return {
          code: 401,
          success: false,
          message: "Invalid username or password",
          errors: [
            {
              field: "usernameOrEmail",
              message: "Invalid username or password",
            },
          ],
        };
      }
      const isPasswordValid = await argon2.verify(
        existingUser.password,
        password
      );
      if (!isPasswordValid) {
        return {
          code: 401,
          success: false,
          message: "Invalid username or password",
          errors: [
            {
              field: "usernameOrEmail",
              message: "Invalid username or password",
            },
          ],
        };
      }
      console.log("Log bug 1");
      //session: userId = existingUser.id
      //create session and return cookie
      req.session.userId = existingUser.id;
      console.log("Session after setting userId:", req.session);
      console.log("Response headers:", res.getHeaders());

      //set-cookie
      res.cookie(COOKIE_NAME, req.sessionID, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      // return user data
      existingUser.updatedAt = new Date();
      await existingUser.save();

      return {
        code: 200,
        success: true,
        message: "Login successful",
        user: existingUser,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: "Internal Server Error",
      };
    }
  }
}

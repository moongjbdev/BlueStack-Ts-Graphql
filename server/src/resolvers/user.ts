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
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
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

      //save session and send sessionId
      req.session.userId = newUser.id;

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
    @Ctx() { req }: Context
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
      //session: userId = existingUser.id
      //create session and return cookie
      req.session.userId = existingUser.id;

      //set-cookie

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

  @Mutation((_return) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    //clear cookies
    return new Promise<boolean>((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);

      req.session.destroy((error) => {
        if (error) {
          console.error("SESSION destroy error: " + error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

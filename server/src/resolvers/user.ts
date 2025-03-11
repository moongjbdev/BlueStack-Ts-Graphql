import { User } from "../entities/User";
import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";
import { RegisterInput } from "../types/RegisterInput";
import { validateregisterInput } from "../utils/validateRegisterInput";
import { LoginInput } from "../types/LoginInput";
import { Context } from "../types/Context";
import { COOKIE_NAME } from "../constants";
import { ForgotPasswordInput } from "../types/ForgotPasswordInput";
import { sendEMail } from "../utils/sendEmail";
import { htmlTemplateForgotPassword } from "../utils/htmlForgotPassword";
import { TokenModel } from "../models/Token";
import { v4 as uuidv4 } from "uuid";
import { ChangePasswordInput } from "../types/ChangePasswordInput";
@Resolver((_of) => User)
export class UserResolver {
  @FieldResolver((_return) => String)
  email(@Root() user: User, @Ctx() { req }: Context) {
    if (req.session.userId === user.id) return user.email;
    return "";
  }
  //check user online
  @Query((_return) => User, { nullable: true })
  async me(@Ctx() { req }: Context): Promise<User | undefined | null> {
    if (!req.session.userId) return null;
    return await User.findOne(req.session.userId);
  }
  //register user
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
      console.log(":::::::::::::::::::::::::: ---------", req.session);

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
  @Mutation((_return) => Boolean)
  async forgotPassword(
    @Arg("forgotPasswordInput") forgotPasswordInput: ForgotPasswordInput
  ): Promise<boolean> {
    try {
      const user = await User.findOne({ email: forgotPasswordInput.email });
      if (!user) {
        return true; // luon tra ve true mac du dung email hay khong
      }

      //check existing token with user_id
      await TokenModel.findOneAndDelete({ userId: `${user.id}` });

      const resetToken = uuidv4();
      const hashResetToken = await argon2.hash(resetToken);
      //send email with reset password link
      const token = await new TokenModel({
        userId: `${user.id}`,
        token: hashResetToken,
      }).save();
      console.log(token);
      const resetLink = `http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}`;

      await sendEMail(
        forgotPasswordInput.email,
        htmlTemplateForgotPassword(resetLink),
        "Forgot Password"
      );

      console.log("DA send email");
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  @Mutation((_return) => UserMutationResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("changePasswordInput") changePasswordInput: ChangePasswordInput,
    @Arg("userId") userId: string,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    if (changePasswordInput.newPassword.length < 8) {
      return {
        code: 400,
        success: false,
        message: "Password must be at least 8 characters long",
        errors: [
          {
            field: "newPassword",
            message: "Password must be at least 8 characters long",
          },
        ],
      };
    }

    try {
      const resetPasswordTokenRecord = await TokenModel.findOne({
        userId: userId,
      });
      if (!resetPasswordTokenRecord) {
        return {
          code: 401,
          success: false,
          message: "Token is invalid or has expired",
          errors: [
            {
              field: "token",
              message: "Token is invalid",
            },
          ],
        };
      }
      const resetPasswordTokenValid = await argon2.verify(
        resetPasswordTokenRecord.token,
        token
      );
      if (!resetPasswordTokenValid) {
        return {
          code: 401,
          success: false,
          message: "Token is invalid or has expired",
          errors: [
            {
              field: "Token",
              message: "Token is invalid",
            },
          ],
        };
      }
      //update password
      const userIdNum = parseInt(userId);
      const user = await User.findOne({ where: { id: userIdNum } });

      if (!user) {
        return {
          code: 401,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "User",
              message: "User not found",
            },
          ],
        };
      }
      const hashedPassword = await argon2.hash(changePasswordInput.newPassword);

      await User.update({ id: userIdNum }, { password: hashedPassword });

      await resetPasswordTokenRecord.deleteOne();

      //set user login
      req.session.userId = user.id;

      return {
        code: 200,
        success: true,
        message: "Password changed successfully",
        user,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: "Internal Server Error",
        errors: [
          {
            field: "Change Password",
            message: "Internal Server Error",
          },
        ],
      };
    }
  }
}

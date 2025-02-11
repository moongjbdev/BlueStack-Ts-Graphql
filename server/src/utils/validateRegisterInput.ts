import { RegisterInput } from "../types/RegisterInput";

export const validateregisterInput = (registerInput: RegisterInput) => {
  if (!registerInput.email.includes("@")) {
    return {
      message: "Invalid email address",
      errors: [
        {
          field: "email",
          message: "Email must include @ symbol",
        },
      ],
    };
  }
  if (registerInput.password.length < 8) {
    return {
      message: "Invalid password",
      errors: [
        {
          field: "password",
          message: "Password must be at least 8 characters",
        },
      ],
    };
  }
  if (registerInput.username.length < 3) {
    return {
      message: "Invalid username",
      errors: [
        {
          field: "username",
          message: "Username must be at least 3 characters",
        },
      ],
    };
  }
  if (registerInput.username.includes("@")) {
    return {
      message: "Invalid username",
      errors: [
        {
          field: "username",
          message: "Username cannot include @ symbol",
        },
      ],
    };
  }

  return null;
};

import { FieldError } from "../generated/graphql";

export const mapFieldError = (errors: FieldError[]) => {
  return errors.reduce((acc, err) => {
    return {
      ...acc,
      [err.field]: err.message,
    };
  }, {});
};

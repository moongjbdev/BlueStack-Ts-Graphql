import React from "react";
import Wrapper from "./Wrapper";
import { Form, Formik } from "formik";
import { Box, Button, Flex, Spinner } from "@chakra-ui/react";
import InputField from "../components/InputField";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";

const ForgotPassword = () => {
  const initialValues = {
    email: "",
  };

  const { data: authData, loading: authLoading } = useCheckAuth();

  const [forgotPassword, { loading, data, error }] =
    useForgotPasswordMutation();

  const handleForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
    try {
      const response = await forgotPassword({
        variables: {
          forgotPasswordInput: values,
        },
      });
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  if (authLoading || (!authLoading && authData?.me))
    return (
      <Flex align="center" justifyContent="center" minH="100vh">
        <Spinner />
      </Flex>
    );
  return (
    <Wrapper>
      <Formik
        initialValues={initialValues}
        onSubmit={handleForgotPasswordSubmit}
      >
        {({ isSubmitting }) =>
          !loading && data ? (
            <Box>Please check your email</Box>
          ) : (
            <Form>
              <Box>
                <InputField
                  name="email"
                  placeholder="Email address"
                  label="Email address"
                  type="text"
                />
              </Box>
              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Send Reset Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default ForgotPassword;

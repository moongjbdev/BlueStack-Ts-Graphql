import { Box, Button, Flex, Spinner, useToast, Link } from "@chakra-ui/react";
import { Formik, Form, FormikHelpers } from "formik";
import NextLink from "next/link"; // Import Next.js Link
import React from "react";
import Wrapper from "./Wrapper";
import InputField from "../components/InputField";
import {
  LoginInput,
  MeDocument,
  MeQuery,
  useLoginMutation,
} from "../generated/graphql";
import { mapFieldError } from "../helpers/mapFieldErrors";
import { useRouter } from "next/router";
import { useCheckAuth } from "../utils/useCheckAuth";

const Login = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();
  const initialValues: LoginInput = {
    usernameOrEmail: "",
    password: "",
  };
  const toast = useToast();
  const router = useRouter();

  const [loginUser, { loading: _loginUserLoading, data, error }] =
    useLoginMutation();

  const handleLoginSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
      update(cache, { data }) {
        if (data?.login.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data?.login.user,
            },
          });
        }
      },
    });

    if (response && response.data?.login.errors) {
      setErrors(mapFieldError(response.data.login.errors));
    } else if (response && response.data && response.data.login) {
      toast({
        title: `Welcome ${response?.data?.login?.user?.username}`,
        description: "",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      router.push("/");
    }
  };

  if (authLoading || (!authLoading && authData?.me))
    return (
      <Flex align="center" justifyContent="center" minH="100vh">
        <Spinner />
      </Flex>
    );

  return (
    <Wrapper size="small">
      {error && (
        <p style={{ color: "red" }}>Failed to login: {error.message}</p>
      )}
      <Formik initialValues={initialValues} onSubmit={handleLoginSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <Box>
              <InputField
                name="usernameOrEmail"
                placeholder="Username or email address"
                label="Username or email address"
                type="text"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Password"
                label="Password"
                type="password"
              />
            </Box>

            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
              width="full"
            >
              Login
            </Button>

            {/* 🔹 Forgot Password Link */}
            <Flex mt={2} justifyContent="flex-end">
              <NextLink href="/forgot-password" passHref>
                <Link color="teal.500" fontSize="sm">
                  Forgot password?
                </Link>
              </NextLink>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;

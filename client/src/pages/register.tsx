import { Box, Button, Flex, Spinner, useToast } from "@chakra-ui/react";
import { Formik, Form, FormikHelpers } from "formik";
import React from "react";
import Wrapper from "./Wrapper";
import InputField from "../components/InputField";
import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from "../generated/graphql";
import { mapFieldError } from "../helpers/mapFieldErrors";
import { useRouter } from "next/router";
import { useCheckAuth } from "../utils/useCheckAuth";
const Register = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();
  const initialValues: RegisterInput = {
    username: "",
    email: "",
    password: "",
  };

  const toast = useToast();

  const router = useRouter();

  const [registerUser, { loading: _registerUserLoading, data, error }] =
    useRegisterMutation();

  const handleRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        if (data?.register.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data?.register.user,
            },
          });
        }
      },
    });
    console.log(response);
    if (response && response.data?.register.errors) {
      setErrors(mapFieldError(response.data.register.errors));
    } else if (response && response.data && response.data.register) {
      if (response?.data?.register?.success) {
        toast({
          title: `Welcome ${response?.data?.register?.user?.username}`,
          description: "Register successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
      router.push("/");
    }
  };
  if (authLoading || (!authLoading && authData?.me))
    return (
      <Flex align="center" justifyContent="center" minH="100vh">
        <Spinner></Spinner>;
      </Flex>
    );

  return (
    <Wrapper>
      <Formik initialValues={initialValues} onSubmit={handleRegisterSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <Box>
              <InputField
                name="username"
                placeholder="Username"
                label="Username"
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
            <Box mt={4}>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type="text"
              />
            </Box>
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;

import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Formik, Form, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../components/InputField";
import {
  ChangePasswordInput,
  useChangePasswordMutation,
} from "../generated/graphql";
import { mapFieldError } from "../helpers/mapFieldErrors";
import Link from "next/link";
import { useCheckAuth } from "../utils/useCheckAuth";
import Wrapper from "./Wrapper";

const ChangePassword = () => {
  const router = useRouter();
  const toast = useToast();
  const { data: authData, loading: authLoading } = useCheckAuth();

  // Lấy token và userId từ URL
  const { token, userId } = router.query;
  const [tokenError, setTokenError] = useState("");

  const initialValues: ChangePasswordInput = {
    newPassword: "",
  };

  // Sử dụng hook đúng để gọi mutation
  const [changePassword, { loading }] = useChangePasswordMutation();

  const handleChangePasswordSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (!token || !userId) {
      setTokenError("Missing token or userId.");
      toast({
        title: "Invalid request",
        description: "Missing token or userId.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const response = await changePassword({
      variables: {
        changePasswordInput: values,
        userId: userId as string,
        token: token as string,
      },
    });
    if (response.data?.changePassword.errors) {
      const fieldErrors = mapFieldError(response.data.changePassword.errors);
      console.log("clg check error", fieldErrors);
      if ("token" in fieldErrors) {
        setTokenError(response.data?.changePassword.message || "Token error.");
        toast({
          title: "Error",
          description: response.data?.changePassword.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
      }
      setErrors(fieldErrors);
    }

    if (response.data?.changePassword.success) {
      toast({
        title: "Password changed successfully",
        description: "You can now log in with your new password.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      router.push("/login");
    }
  };

  if (!token || !userId) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Invalid password change request</AlertTitle>
        <Link href="/">
          <Text color="blue">Return to home page</Text>
        </Link>
      </Alert>
    );
  }
  if (authLoading || (!authLoading && authData?.me))
    return (
      <Flex align="center" justifyContent="center" minH="100vh">
        <Spinner />
      </Flex>
    );
  return (
    <Wrapper size="small">
      <Flex align="center" justify="center" minH="100vh">
        <Box width="400px" p={4} boxShadow="md" borderRadius="md">
          <Formik
            initialValues={initialValues}
            onSubmit={handleChangePasswordSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="newPassword"
                  placeholder="Enter new password"
                  label="New Password"
                  type="password"
                />
                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting || loading}
                  width="full"
                >
                  Change Password
                </Button>

                {/* Nếu có lỗi token, hiển thị link quay lại trang đổi mật khẩu */}
                {tokenError && (
                  <Box mt={4} textAlign="center">
                    <Link href="/forgot-password">
                      <Button variant="link" colorScheme="teal">
                        Go back to change password page
                      </Button>
                    </Link>
                  </Box>
                )}
              </Form>
            )}
          </Formik>
        </Box>
      </Flex>
    </Wrapper>
  );
};

export default ChangePassword;

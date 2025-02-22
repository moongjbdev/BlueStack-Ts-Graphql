import { Box } from "@chakra-ui/react";
import React from "react";

type WrapperSize = "regular" | "small";
interface IWrapperProps {
  children: React.ReactNode;
  size?: WrapperSize;
}
const Wrapper = ({ children, size = "regular" }: IWrapperProps) => {
  return (
    <Box
      maxW={size === "regular" ? "800px" : "400px"}
      w="100%"
      mt={8}
      mx="auto"
    >
      {children}
    </Box>
  );
};

export default Wrapper;

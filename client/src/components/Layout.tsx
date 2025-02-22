import React from "react";
import NavBar from "./NavBar";
import Wrapper from "../pages/Wrapper";
interface IlayOutProps {
  children: React.ReactNode;
}
const Layout = ({ children }: IlayOutProps) => {
  return (
    <>
      <NavBar></NavBar>
      <Wrapper>{children}</Wrapper>
    </>
  );
};

export default Layout;

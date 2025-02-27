import { useRouter } from "next/router";
import { useMeQuery } from "../generated/graphql";
import { useEffect } from "react";

export const useCheckAuth = () => {
  const router = useRouter();
  const { data, loading } = useMeQuery();

  useEffect(() => {
    if (loading) return;
    if (
      data?.me &&
      ["/login", "/register", "/forgot-password", "/change-password"].includes(
        router.route
      )
    ) {
      router.replace("/");
    } else if (
      !data?.me &&
      ["/create-post", "/profile", "/post/edit"].includes(router.route)
    ) {
      router.replace("/login");
    }
  }, [data, loading, router]);

  return { data, loading };
};

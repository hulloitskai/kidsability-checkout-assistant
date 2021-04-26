import React, { FC, useMemo } from "react";
import dynamic from "next/dynamic";

import { Box, Center } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";

import { createGraphiQLFetcher } from "@graphiql/toolkit";
import "graphiql/graphiql.css";

const GraphiQLOrLoading = dynamic(() => import("graphiql"), {
  loading: () => (
    <Center boxSize="full">
      <Spinner colorScheme="pink" boxSize={7} />
    </Center>
  ),
});

const GraphiQL: FC = () => {
  const fetcher = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const { protocol, host } = window.location;
    return createGraphiQLFetcher({
      url: "/api/graphql",
      subscriptionUrl:
        protocol === "https"
          ? `wss://${host}/api/graphql`
          : `ws://${host}/api/graphql`,
    });
  }, []);
  return (
    <Box h="100vh" w="100vw">
      {fetcher && <GraphiQLOrLoading fetcher={fetcher} />}
    </Box>
  );
};

export default GraphiQL;

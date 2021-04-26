import React, { FC } from "react";
import Head from "next/head";
import { AppProps } from "next/app";

import { ApolloProvider } from "services/apollo";
import { ChakraProvider } from "services/chakra";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Kidsability Checkout Assistant</title>
      </Head>
      <ApolloProvider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </ApolloProvider>
    </>
  );
};

export default App;

import React, { FC } from "react";
import theme from "styles/theme";

import { ChakraProvider as Provider } from "@chakra-ui/react";

export interface ChakraProviderProps {}

export const ChakraProvider: FC<ChakraProviderProps> = ({ children }) => (
  <Provider theme={theme}>{children}</Provider>
);

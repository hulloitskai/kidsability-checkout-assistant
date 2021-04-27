import React, { FC } from "react";
import { Box, Text } from "@chakra-ui/react";

const Home: FC = () => {
  return (
    <Box>
      <Text>
        Welcome to the{" "}
        <Text as="span" fontWeight="medium">
          Kidsability Checkout Assistant!
        </Text>
      </Text>
    </Box>
  );
};

export default Home;

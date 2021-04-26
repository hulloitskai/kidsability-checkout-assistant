import { FC, useEffect, useMemo, useState } from "react";

import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

import { Box, VStack, Center, Divider } from "@chakra-ui/react";
import { Text, Heading } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { getCurrentTab, getSubscriberCode } from "./utils";
import { subscribeAs, unsubscribe } from "./utils";
import { checkoutItem, parseUrl } from "./utils";

const useCurrentTab = (): chrome.tabs.Tab | undefined => {
  const [tab, setTab] = useState<chrome.tabs.Tab | undefined>(undefined);
  useEffect(() => {
    const listener = () => getCurrentTab().then(setTab);
    listener();
    const { onUpdated } = chrome.tabs;
    onUpdated.addListener(listener);
    return onUpdated.removeListener(listener);
  }, []);
  return tab;
};

const useCurrentUrl = (
  tab: chrome.tabs.Tab | undefined
): URL | null | undefined => {
  return useMemo(() => {
    if (!tab) return undefined;
    return tab.url ? new URL(tab.url) : null;
  }, [tab]);
};

const App: FC = () => {
  const tab = useCurrentTab();
  const url = useCurrentUrl(tab);

  const [accessionCode, setAccessionCode] = useState<string>("");
  const [subscriberCode, setSubscriberCode] = useState<string | null>(null);
  useEffect(() => {
    getSubscriberCode().then(setSubscriberCode);
  }, [tab]);

  const isLoggedIn = useMemo(() => {
    if (!url) return false;
    const { host, pathname } = url;
    return (
      host.includes("l4u") &&
      (pathname.includes("Bookbag") || pathname.includes("BookBag"))
    );
  }, [url]);

  useEffect(() => {
    console.info(`[kidsability-checkout-assistant/popup] initialized`);
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Box minW={60} p={5}>
        {isLoggedIn ? (
          <VStack align="stretch" spacing={4}>
            <VStack align="stretch">
              <Heading fontSize="md">Automatic Reservation</Heading>
              {subscriberCode && (
                <VStack
                  align="stretch"
                  p={1}
                  bg="blue.100"
                  color="blue.600"
                  rounded="md"
                >
                  <Text fontSize="sm">Device Code:</Text>
                  <Center p={1} pb={2}>
                    <Text fontSize="xl" fontWeight="semibold">
                      {subscriberCode}
                    </Text>
                  </Center>
                </VStack>
              )}
              <Button
                colorScheme={subscriberCode ? "red" : "green"}
                isDisabled={!tab}
                onClick={() => {
                  if (!tab?.id) {
                    throw new Error("Missing current tab.");
                  }
                  if (!subscriberCode) {
                    const code = Math.floor(100000 + Math.random() * 900000);
                    setSubscriberCode(code.toString());
                    subscribeAs(tab.id, code.toString());
                  } else {
                    setSubscriberCode(null);
                    unsubscribe();
                  }
                }}
              >
                {subscriberCode ? "Deactivate" : "Activate"}
              </Button>
            </VStack>
            <Divider />
            <VStack align="stretch">
              <Heading fontSize="md">Manual Reservation</Heading>
              <FormControl>
                <FormLabel fontSize="sm">Accession Code:</FormLabel>
                <Input
                  value={accessionCode}
                  placeholder="1912821238"
                  onChange={({ target: { value } }) =>
                    setAccessionCode(value.trim())
                  }
                />
              </FormControl>
              <Button
                isDisabled={!tab || !accessionCode}
                onClick={() => {
                  if (!tab?.id) {
                    throw new Error("Missing current tab.");
                  }
                  checkoutItem(tab.id, accessionCode);
                }}
              >
                Reserve Item
              </Button>
            </VStack>
          </VStack>
        ) : (
          <VStack align="stretch">
            <Text>This tab is not logged into L4U.</Text>
            <Button
              colorScheme="blue"
              isDisabled={!tab?.id}
              onClick={() => {
                if (!tab?.id) {
                  throw new Error("Missing current tab.");
                }
                const url = parseUrl("/4dcgi/gen_2002/Lang=Def");
                chrome.tabs.update(tab.id, { url });
                window.close();
              }}
            >
              Go To L4U
            </Button>
          </VStack>
        )}
      </Box>
    </ChakraProvider>
  );
};

export default App;

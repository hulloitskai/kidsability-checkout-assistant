import React, { FC, useEffect, useState } from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

import { Container, VStack, Center } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Text, Icon } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { Input, Button } from "@chakra-ui/react";

import { useQueryParam } from "utils/routing";
import { useMutation, gql } from "@apollo/client";

const SUBSCRIBER_CODE_KEY = "SubscriberCode";

const Checkout: FC = () => {
  const accessionCode = useQueryParam("code");
  const [subscriberCode, setSubscriberCode] = useState("");
  const [checkoutItem, { data, error, called }] = useMutation(
    gql`
      mutation($subscriberCode: String!, $accessionCode: String!) {
        checkoutItem(
          subscriberCode: $subscriberCode
          accessionCode: $accessionCode
        ) {
          accessionCode
        }
      }
    `,
    {
      onError: error => {
        window.localStorage.removeItem(SUBSCRIBER_CODE_KEY);
        setSubscriberCode("");
      },
    },
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!accessionCode) {
      return;
    }
    const subscriberCode = window.localStorage.getItem(SUBSCRIBER_CODE_KEY);
    if (subscriberCode) {
      setSubscriberCode(subscriberCode);
      checkoutItem({
        variables: {
          subscriberCode,
          accessionCode,
        },
      });
    }
  }, [accessionCode]);

  return (
    <Container>
      {(subscriberCode && called) || !accessionCode ? (
        <Center minH="100vh" minW="100vw" p={4}>
          <VStack>
            {error ? (
              <Icon as={HiXCircle} color="red.500" boxSize={7} />
            ) : data ? (
              <Icon as={HiCheckCircle} color="green.500" boxSize={7} />
            ) : (
              <Spinner colorScheme="blue" />
            )}
            {error ? (
              <Text>Error: {error.message}</Text>
            ) : data ? (
              <Text>Reservation submitted :)</Text>
            ) : (
              <Text>Submitting reservation...</Text>
            )}
          </VStack>
        </Center>
      ) : (
        <VStack
          as="form"
          align="stretch"
          p={4}
          onSubmit={event => {
            event.preventDefault();
            window.localStorage.setItem(SUBSCRIBER_CODE_KEY, subscriberCode);
            if (subscriberCode && accessionCode) {
              checkoutItem({
                variables: {
                  subscriberCode,
                  accessionCode,
                },
              });
            }
          }}
        >
          <FormControl>
            <FormLabel>Enter your device code:</FormLabel>
            <Input
              value={subscriberCode}
              placeholder="123456"
              onChange={({ target: { value } }) => setSubscriberCode(value)}
            />
          </FormControl>
          <Button type="submit">Continue</Button>
        </VStack>
      )}
    </Container>
  );
};

export default Checkout;

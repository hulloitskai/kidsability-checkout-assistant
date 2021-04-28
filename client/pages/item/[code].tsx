import React, { FC, useEffect, useMemo, useState } from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

import { useForm } from "react-hook-form";
import { useLocalStorage } from "utils/storage";

import { Container, VStack, Center } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { Text, Icon } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { Input, Button } from "@chakra-ui/react";

import { useQueryParam } from "utils/routing";
import { useMutation, gql } from "@apollo/client";

const SESSION_ID_KEY = "SessionId";

type CheckoutFieldValues = {
  sessionId: string;
};

const Checkout: FC = () => {
  const accessionCode = useQueryParam("code");
  const [sessionSource, setSessionSource] = useState<"input" | "storage">(
    "storage",
  );
  const [sessionId, setSessionId] = useLocalStorage<string | null>(
    SESSION_ID_KEY,
    null,
  );

  const [checkoutItem, { data, error }] = useMutation(
    gql`
      mutation($input: CheckoutItemInput!) {
        checkoutItem(input: $input) {
          item {
            accessionCode
          }
        }
      }
    `,
    {
      onError: () => {
        if (sessionSource === "storage") {
          setSessionId(null);
        }
      },
    },
  );

  useEffect(() => {
    if (!sessionId || !accessionCode) {
      return;
    }
    checkoutItem({
      variables: {
        input: {
          sessionId,
          accessionCode,
        },
      },
    });
  }, [sessionId, accessionCode]);

  const { register, handleSubmit } = useForm<CheckoutFieldValues>();
  const onSubmit = handleSubmit(({ sessionId }) => {
    setSessionSource("input");
    setSessionId(sessionId);
  });
  return (
    <Container py={6}>
      {sessionId || !accessionCode ? (
        <Center>
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
        <VStack as="form" align="stretch" onSubmit={onSubmit}>
          <FormControl>
            <FormLabel>Enter your session ID:</FormLabel>
            <Input
              type="number"
              placeholder="123456"
              {...register("sessionId")}
            />
          </FormControl>
          <Button type="submit">Continue</Button>
        </VStack>
      )}
    </Container>
  );
};

export default Checkout;

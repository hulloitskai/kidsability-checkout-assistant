import React, { FC, useMemo } from "react";

import { ApolloClient as Client } from "@apollo/client";
import { ApolloProvider as Provider } from "@apollo/client";
import { useApolloClient as useClient } from "@apollo/client";
import { PossibleTypesMap, TypePolicies } from "@apollo/client";

import { HttpLink } from "@apollo/client";
import { InMemoryCache, NormalizedCacheObject } from "@apollo/client";

const TYPE_POLICIES: TypePolicies = {};

export const POSSIBLE_TYPES: PossibleTypesMap = {};

/**
 * Create an Apollo Client that can send both authenticated and anonymous
 * requests to our GraphQL API.
 */
const createClient = (): Client<NormalizedCacheObject> => {
  const httpLink = new HttpLink({ uri: "/api/graphql" });
  return new Client({
    link: httpLink,
    cache: new InMemoryCache({
      typePolicies: TYPE_POLICIES,
      // TODO: Figure out how to generate this from `schema.json`.
      possibleTypes: POSSIBLE_TYPES,
    }),
  });
};

export type ApolloClient = Client<NormalizedCacheObject>;

export const useApolloClient = useClient as () => ApolloClient;

export const ApolloProvider: FC = ({ children }) => {
  const client = useMemo(createClient, []);
  return <Provider client={client}>{children}</Provider>;
};

// let sharedServerClient: ApolloClient | null = null;

// export const getServerClient = (): ApolloClient => {
//   if (!sharedServerClient) {
//     const serverUrl = `${process.env.NEXT_API_URL}/graphql`;
//     sharedServerClient = new Client({
//       uri: serverUrl,
//       cache: new InMemoryCache(),
//       defaultOptions: {
//         query: {
//           fetchPolicy: "network-only",
//         },
//       },
//     });
//   }
//   return sharedServerClient;
// };

import { ApolloClient, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { gql } from "@apollo/client";

import { checkoutItem, unsubscribe } from "./utils";

const wsLink = new WebSocketLink({
  uri: "wss://kidsability-checkout-assistant.stevenxie.me/api/graphql",
  // uri: "ws://localhost:3000/api/graphql",
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
});

let currentSubscription: ZenObservable.Subscription | null = null;
let currentSessionId: string | null = null;
let currentTabId: number | null = null;

const cancelSubscription = () => {
  currentSubscription?.unsubscribe();
  currentSessionId = null;
  currentTabId = null;
};

const { onMessage } = chrome.runtime;
const { onUpdated } = chrome.tabs;

onUpdated.addListener((tabId, { discarded }) => {
  if (tabId === currentTabId && discarded) {
    cancelSubscription();
  }
});

onMessage.addListener(({ type }, sender, sendResponse) => {
  if (type !== "kidsability-checkout-assistant/session") {
    return;
  }
  console.info(`[kidsability-checkout-assistant/worker] session ID requested`, {
    sessionId: currentSessionId,
  });
  sendResponse(currentSessionId);
});

onMessage.addListener(({ type, sessionId, tabId }) => {
  if (type !== "kidsability-checkout-assistant/subscribe") {
    return;
  }
  if (!sessionId) {
    throw new Error("Missing session ID.");
  }

  currentTabId = tabId;
  currentSessionId = sessionId;
  currentSubscription = client
    .subscribe({
      query: gql`
        subscription($sessionId: String!) {
          item(sessionId: $sessionId) {
            accessionCode
          }
        }
      `,
      variables: {
        sessionId,
      },
    })
    .subscribe(
      ({
        data: {
          item: { accessionCode },
        },
      }) => {
        console.debug(
          `[kidsability-checkout-assistant/worker] got accession code`,
          { accessionCode }
        );
        checkoutItem(tabId, accessionCode);
      },
      (error) => {
        console.error(
          `[kidsability-checkout-assistant/worker] subscription error`,
          { error }
        );
        unsubscribe();
        console.info(`[kidsability-checkout-assistant/worker] unsubscribed`);
      }
    );
  console.info(`[kidsability-checkout-assistant/worker] subscribed`, {
    sessionId,
  });
});

onMessage.addListener(({ type }) => {
  if (type !== "kidsability-checkout-assistant/unsubscribe") {
    return;
  }
  cancelSubscription();
  console.info(`[kidsability-checkout-assistant/worker] unsubscribed`);
});

console.info(`[kidsability-checkout-assistant/worker] initialized`);

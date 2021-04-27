import { ApolloClient, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { gql } from "@apollo/client";

import { checkoutItem } from "./utils";

const wsLink = new WebSocketLink({
  uri: "wss://kidsability-checkout-assistant.stevenxie.me/api/graphql",
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link: wsLink,
  cache: new InMemoryCache(),
});

let currentSubscription: ZenObservable.Subscription | null = null;
let currentSubscriberCode: string | null = null;
let currentTabId: number | null = null;

const { onMessage } = chrome.runtime;
const { onUpdated } = chrome.tabs;

onUpdated.addListener((tabId, { discarded }) => {
  if (tabId === currentTabId && discarded && currentSubscription) {
    currentSubscription.unsubscribe();
    currentSubscriberCode = null;
    currentTabId = null;
  }
});

onMessage.addListener(({ type }, sender, sendResponse) => {
  if (type !== "kidsability-checkout-assistant/subscriber-code") {
    return;
  }
  console.info(
    `[kidsability-checkout-assistant/worker] subscriber code requested`,
    { code: currentSubscriberCode }
  );
  sendResponse(currentSubscriberCode);
});

onMessage.addListener(({ type, subscriberCode, tabId }) => {
  if (type !== "kidsability-checkout-assistant/subscribe") {
    return;
  }
  if (!subscriberCode) {
    throw new Error("Missing subscriber code.");
  }

  currentTabId = tabId;
  currentSubscriberCode = subscriberCode;
  currentSubscription = client
    .subscribe({
      query: gql`
        subscription($subscriberCode: String!) {
          item(subscriberCode: $subscriberCode) {
            accessionCode
          }
        }
      `,
      variables: {
        subscriberCode,
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
      }
    );
  console.info(`[kidsability-checkout-assistant/worker] subscribed`, {
    code: subscriberCode,
  });
});

onMessage.addListener(({ type }) => {
  if (type !== "kidsability-checkout-assistant/unsubscribe") {
    return;
  }
  if (currentSubscription) {
    currentSubscription.unsubscribe();
    currentSubscriberCode = null;
    currentTabId = null;
  }
  console.info(`[kidsability-checkout-assistant/worker] unsubscribed`);
});

console.info(`[kidsability-checkout-assistant/worker] initialized`);

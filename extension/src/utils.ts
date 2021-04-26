import { DateTime } from "luxon";

export const parseUrl = (path: string = "/"): string => {
  return `https://l4u-test.kidsability.org${path}`;
};

export const getCurrentTab = async (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve) => {
    return chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) =>
      resolve(tab)
    );
  });
};

export const getSubscriberCode = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    return chrome.runtime.sendMessage(
      {
        type: "kidsability-checkout-assistant/subscriber-code",
      },
      (code) => resolve(code ?? null)
    );
  });
};

const navigateTo = (tabId: number, path: string): Promise<void> => {
  return new Promise((resolve) => {
    const url = parseUrl(path);
    chrome.tabs.update(tabId, { url }, (tab) => {
      const { onUpdated } = chrome.tabs;
      function listener(tabId: number, changeInfo: chrome.tabs.TabChangeInfo) {
        if (changeInfo.status === "complete") {
          resolve();
          onUpdated.removeListener(listener);
        }
      }
      onUpdated.addListener(listener);
    });
  });
};

export const executeFile = (tabId: number, file: string): Promise<any> => {
  return new Promise((resolve) => {
    chrome.tabs.executeScript(
      tabId,
      {
        file,
        runAt: "document_end",
      },
      ([result]) => resolve(result)
    );
  });
};

export const checkoutItem = async (
  tabId: number,
  accessionCode: string
): Promise<any> => {
  let bookbag = "";

  bookbag = await executeFile(tabId, "find-bookbag.js");
  if (!bookbag) {
    throw new Error("Unable to find bookbag.");
  }
  await navigateTo(
    tabId,
    `/4DACTION/web_Gen_2002_ShowWebDetails/${accessionCode}/Lang=En/BookBag=${bookbag}`
  );
  const loanDays: number = await executeFile(tabId, "find-loan-days.js");

  bookbag = await executeFile(tabId, "find-bookbag.js");
  if (!bookbag) {
    throw new Error("Unable to find bookbag.");
  }
  await navigateTo(
    tabId,
    `/4DCGI/WEB_Gen2002_Place_Booking/${accessionCode}/Lang=En/BookBag=${bookbag}`
  );

  await executeFile(tabId, "make-booking.js");
  const from = DateTime.now();
  const to = from.plus({ days: loanDays });
  const formatDate = (date: DateTime) => date.toFormat("D");
  chrome.tabs.sendMessage(tabId, {
    type: "kidsability-checkout-assistant/make-booking",
    from: formatDate(from),
    to: formatDate(to),
  });
};

export const subscribeAs = async (
  tabId: number,
  subscriberCode: string
): Promise<void> => {
  chrome.runtime.sendMessage({
    type: "kidsability-checkout-assistant/subscribe",
    tabId,
    subscriberCode,
  });
};

export const unsubscribe = async (): Promise<void> => {
  chrome.runtime.sendMessage({
    type: "kidsability-checkout-assistant/unsubscribe",
  });
};

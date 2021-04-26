import first from "lodash/first";
import { useMemo } from "react";
import { useRouter, NextRouter } from "next/router";

export const getQueryValue = (
  router: NextRouter,
  key: string,
): string | null | undefined => {
  const { [key]: value } = router.query;
  if (value === undefined) return undefined;
  return Array.isArray(value) ? first(value) : value;
};

export const getQueryArray = (
  router: NextRouter,
  key: string,
): string[] | null | undefined => {
  const { [key]: value } = router.query;
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
};

export const getRedirect = (router: NextRouter): string | null | undefined =>
  getQueryValue(router, "redirect");

export const useQueryParam = (key: string): string | null | undefined => {
  const router = useRouter();
  return useMemo(() => getQueryValue(router, key), [router]);
};

export const useRedirect = (): string | null | undefined =>
  useQueryParam("redirect");

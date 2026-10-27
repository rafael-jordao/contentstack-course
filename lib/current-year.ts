import { cacheLife } from "next/cache";

/** Cached because Cache Components rejects reading the clock in an uncached render. */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");

  return new Date().getUTCFullYear();
}

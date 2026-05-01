/**
 * tRPC Next.js App Router handler
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { auth } from "@/lib/auth";

const handler = async (req: Request) => {
  const session = await auth();
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({ session }),
    onError: ({ error, path }) => {
      if (process.env.NODE_ENV === "development") {
        console.error(`[tRPC error] ${path}:`, error.message);
      }
    },
  });
};

export { handler as GET, handler as POST };

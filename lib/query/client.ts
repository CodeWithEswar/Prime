import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";

/**
 * Creates a configured QueryClient instance.
 * Server requests must receive fresh request-safe instances.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent immediate refetch on client hydration for server-rendered data
        staleTime: 1000 * 60, // 1 minute default
        gcTime: 1000 * 60 * 5, // 5 minutes default
        refetchOnWindowFocus: false, // Intentional, prevents aggressive background refetches
        retry: (failureCount, error) => {
          // Do not retry on 4xx client errors
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as { status?: number }).status;
            if (status && status >= 400 && status < 500) {
              return false;
            }
          }
          return failureCount < 1;
        },
      },
      dehydrate: {
        // Include pending queries during server prefetching if necessary
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

// Stable browser singleton
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a stable QueryClient in the browser, or creates a new request-scoped
 * QueryClient when running on the server.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always create a new request-safe QueryClient
    return createQueryClient();
  }
  // Browser: initialize once and reuse across components
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}

import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiConfig, getEndpointUrl } from "@/config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
  headers?: Record<string, string> | undefined,
): Promise<Response> {
  const config = getApiConfig();
  
  // Determine if endpoint is a full URL or needs to be resolved
  let url: string;
  if (endpoint.startsWith('http') || endpoint.startsWith('/')) {
    // Full URL or absolute path - use as is
    url = endpoint;
  } else {
    // Endpoint key - resolve using config
    url = getEndpointUrl(endpoint as any);
  }
  
  const defaultHeaders: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  const controller = new AbortController();
  
  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);
  
  try {
    const res = await fetch(url, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const config = getApiConfig();
    const endpoint = queryKey.join("/") as string;
    
    // Resolve URL using config if it's not already a full URL
    let url = endpoint;
    if (!endpoint.startsWith('http') && !endpoint.startsWith('/')) {
      url = getEndpointUrl(endpoint as any);
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

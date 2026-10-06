import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Base HTTP client for calling the backend API.
 *
 * - Client-side (Browser): Dynamically uses window.location.hostname
 *   so it works from localhost AND from other devices on the same network.
 * - Server-side (SSR / Docker): Uses INTERNAL_API_URL env var.
 */

function sanitizeApiUrl(raw?: string): string {
  if (!raw) return "http://localhost:3000/api";
  let url = raw.trim().replace(/^['"]+|['"]+$/g, "").trim();
  if (!url) return "http://localhost:3000/api";

  if (url.startsWith("/")) {
    url = url.replace(/\/+$/, "");
    if (!url.endsWith("/api") && !url.includes("/api/")) {
      url = `${url}/api`;
    }
    return url;
  }

  if (url.startsWith("//")) {
    url = `https:${url}`;
  }

  if (!/^https?:\/\//i.test(url)) {
    if (
      url.startsWith("localhost") ||
      url.startsWith("127.0.0.1") ||
      url.startsWith("192.168.") ||
      url.startsWith("10.") ||
      url.startsWith("172.16.")
    ) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api") && !url.includes("/api/")) {
    url = `${url}/api`;
  }

  return url;
}

function getBaseURL(): string {
  const isServer = typeof window === "undefined";

  if (isServer) {
    // SSR (Server-Side Rendering): Connect directly via internal network or localhost
    return sanitizeApiUrl(
      process.env.INTERNAL_API_URL ||
      process.env.BACKEND_URL ||
      process.env.BACKEND_INTERNAL_URL ||
      "http://localhost:3000/api"
    );
  }

  // Client-side (Browser / DevTools):
  // ALWAYS use relative "/api" path routed through Next.js BFF reverse proxy rewrites.
  // This guarantees DevTools cannot inspect backend internal host/port and ensures 100% same-origin cookies.
  return "/api";
}

const rawAxios = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Authorization Bearer token and handle FormData
rawAxios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pringgodani_admin_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // When sending FormData, delete default Content-Type so browser/axios sets multipart/form-data with boundary
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Interceptor to handle unauthorized access (401)
rawAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        const SESSION_KEY = "pringgodani_admin_session";
        const TOKEN_KEY = "pringgodani_admin_access_token";
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(SESSION_KEY);
        document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

        // Only redirect if we are inside /admin routes and not already on /admin/login
        if (
          window.location.pathname.startsWith("/admin") &&
          !window.location.pathname.startsWith("/admin/login")
        ) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// Map to deduplicate concurrent in-flight GET requests
const inFlightGetRequests = new Map<string, Promise<AxiosResponse<any>>>();

function getRequestKey(url: string, config?: AxiosRequestConfig): string {
  const paramsStr = config?.params ? JSON.stringify(config.params) : "";
  return `${url}::${paramsStr}`;
}

export const apiClient = {
  ...rawAxios,
  get: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> => {
    const key = getRequestKey(url, config);
    const existing = inFlightGetRequests.get(key);
    if (existing) {
      return existing as unknown as Promise<R>;
    }

    const requestPromise = (rawAxios.get(url, config) as Promise<R>).finally(() => {
      inFlightGetRequests.delete(key);
    });

    inFlightGetRequests.set(key, requestPromise as unknown as Promise<AxiosResponse<any>>);
    return requestPromise;
  },
  post: rawAxios.post.bind(rawAxios),
  put: rawAxios.put.bind(rawAxios),
  patch: rawAxios.patch.bind(rawAxios),
  delete: rawAxios.delete.bind(rawAxios),
  defaults: rawAxios.defaults,
  interceptors: rawAxios.interceptors,
};

/** Zero Trust Architecture: Frontend strictly connects to backend REST API. */
export const IS_API_CONNECTED = true;

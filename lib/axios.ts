// src/lib/axios.ts
import axios from "axios";

const isDev = process.env.NODE_ENV === "development";
const isServer = typeof window === "undefined";

// Base URL logic (works perfectly with Vercel + local dev)
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.200.155:8000/api/"; // Client-side → goes through Next.js proxy (recommended!)

const axiosInstance = axios.create({
  baseURL,
  // timeout: 15_000, // 15 seconds
  // Do NOT set a default Content-Type — axios auto-detects FormData vs JSON
  headers: {
    // You can add common headers here
  },
  // Important for cookies/auth when calling your own Next.js API routes
  // withCredentials: true,
});

// Request interceptor – add auth token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // If you're using NextAuth.js v14+ with cookies (NextAuth, Lucia, etc.)
    // the cookie is automatically sent because of withCredentials: true

    // Example: if you store token in localStorage (Clerk, custom JWT, etc.)
    const token = typeof window !== "undefined" ? window.localStorage.getItem("access_token") : null;
    // Don't send token for login requests to avoid 'token_not_valid' errors
    // from old/expired tokens in localStorage.
    if (token && !config.url?.includes("login/")) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDev) {
      console.log("API Request →", config.method?.toUpperCase(), config.url, config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – global error handling + auto refresh example
axiosInstance.interceptors.response.use(
  (response) => {
    // Support both 'status: success' (legacy) and 'success: true' (StandardResponse)
    const isSuccess = response.data && (response.data.status === "success" || response.data.success === true);

    if (isSuccess && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token_not_valid specifically
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "token_not_valid"
    ) {
      console.warn("Auth: Invalid token detected, clearing storage.");
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("access_token");
        window.localStorage.removeItem("refresh_token");
        window.localStorage.removeItem("user_data");
      }

      if (!isServer) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized", {
          detail: { message: "Session expired. Please log in again." },
        }));
      }
      return Promise.reject(error);
    }

    // Handle 401 globally with token refresh logic
    // Skip for login requests – pass through original error so the form can display the backend message
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("login/")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== "undefined" ? window.localStorage.getItem("refresh_token") : null;
        if (!refreshToken) throw new Error("No refresh token");

        // Use basic axios to avoid infinite loops if refresh fails
        const { data } = await axios.post(`${baseURL}refresh/`, { refresh: refreshToken });

        // Depending on your API, it might return data.access or data.data.access
        // With standard response mixin, it might wrap it. Let's assume standard SimpleJWT:
        const newAccessToken = data.access || (data.data && data.data.access);

        if (newAccessToken) {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("access_token", newAccessToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (refreshError) {
        // Auth failed — dispatch event instead of hard redirect
        console.warn("Auth: Refresh token failed or expired.");
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("access_token");
          window.localStorage.removeItem("refresh_token");
          window.localStorage.removeItem("user_data");
        }
        if (!isServer) {
          window.dispatchEvent(new CustomEvent("auth:unauthorized", {
            detail: { message: "Session expired. Please log in again." },
          }));
        }
        return Promise.reject(refreshError);
      }
    }

    // Optional: toast notifications
    if (typeof window !== "undefined") {
      const standardError = error.response?.data;
      if (standardError && standardError.status === "error") {
        // We can optionally log or handle it globally here
        // console.error("Standard Backend Error:", standardError.message);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

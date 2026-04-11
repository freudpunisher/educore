// src/lib/axios.ts
import axios from "axios";

const isDev = process.env.NODE_ENV === "development";
const isServer = typeof window === "undefined";

// Base URL logic (works perfectly with Vercel + local dev)
const baseURL = process.env.NEXT_PRIVATE_API_URL || "http://192.168.200.68:10000/api/"; // Client-side → goes through Next.js proxy (recommended!)

const axiosInstance = axios.create({
  baseURL,
  // timeout: 15_000, // 15 seconds
  headers: {
    "Content-Type": "application/json",


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
    const token = localStorage.getItem("access_token");
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
    // If the response follows the standard format, we return 'data' directly
    if (response.data && response.data.status === "success") {
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
      console.warn("Auth: Invalid token detected, clearing storage and redirecting.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      
      if (!isServer) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // Handle 401 globally (optional token refresh logic)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Example: refresh token flow
      // try {
      //   const { data } = await axios.post("/api/auth/refresh");
      //   localStorage.setItem("access_token", data.accessToken);
      //   return axiosInstance(originalRequest);
      // } catch (refreshError) {
      //   // Force logout, redirect to login, etc.
      //   window.location.href = "/login";
      // }
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
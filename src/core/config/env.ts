export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5000",
  appName: (import.meta.env.VITE_APP_NAME as string | undefined) ?? "CMS Admin Portal"
};

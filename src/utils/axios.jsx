import axios from "axios";
import { getUserFromLocalStorage, removeUserFromLocalStorage } from "./local-storage";

const customFetch = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

customFetch.interceptors.request.use((config) => {
  const user = getUserFromLocalStorage();
  if (user && user.token) {
    config.headers["Authorization"] = `Bearer ${user.token}`;
  }
  config.headers.Accept = "application/json";
  config.headers["Content-Type"] = "application/json";
  return config;
});

customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      removeUserFromLocalStorage(); // This also redirects to "/"
      window.location = "/";
    }
    return Promise.reject(error);
  }
);

export const checkForUnauthorizedResponse = (error) => {
  return error.response?.data?.msg || "Unauthorized";
};

export default customFetch;
import { apiRequest } from "./client";

const json = { "Content-Type": "application/json" };

export const signup = ({ email, password, full_name, phone }) =>
  apiRequest("/auth/signup", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ email, password, full_name, phone }),
  });

export const login = ({ email, password }) =>
  apiRequest("/auth/login", {
    method: "POST",
    headers: json,
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => apiRequest("/auth/me");

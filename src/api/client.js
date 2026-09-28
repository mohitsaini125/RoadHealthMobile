import { API_BASE_URL } from "../config/api";
import { getToken, removeToken } from "../storage/authStorage";

let unauthorizedHandler = null;
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// FastAPI returns `detail` as a string, or a list of {loc, msg} for 422.
function readDetail(data) {
  const d = data?.detail;
  if (!d) return null;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d
      .map((e) => {
        const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : null;
        return field && field !== "body" ? `${field}: ${e.msg}` : e.msg;
      })
      .join("\n");
  }
  return null;
}

export async function apiRequest(endpoint, options = {}) {
  const token = await getToken();
  const headers = { Accept: "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch (e) {
    throw new ApiError(
      "Can't reach the server. Check your internet connection and try again.",
      0
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      await removeToken();
      if (unauthorizedHandler) unauthorizedHandler();
      throw new ApiError(readDetail(data) || "Your session has expired. Please log in again.", 401);
    }
    if (response.status === 403) {
      throw new ApiError("You don't have permission to do this.", 403);
    }
    throw new ApiError(readDetail(data) || "Request failed. Please try again.", response.status);
  }

  return data;
}

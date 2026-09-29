import { API_BASE_URL } from "../config/api";
import { getToken } from "../storage/authStorage";
import { apiRequest } from "./client";
import { File } from "expo-file-system";

/**
 * Submit a road-damage report.
 *
 * Uses a dedicated fetch() call instead of the generic apiRequest() helper
 * so that React Native's FormData + fetch can generate the correct
 * multipart/form-data boundary automatically.
 *
 * CRITICAL — DO NOT pass an expo-file-system File object to FormData.
 * React Native's FormData only accepts the plain { uri, name, type }
 * shape for file parts. Passing anything else throws:
 *   "Unsupported FormDataPart implementation"
 */
export async function submitReport({
  latitude,
  longitude,
  description,
  imageUri,
  imageName,
  imageType,
}) {
  if (!imageUri) throw new Error("A road-damage image is required.");

  // ── Debug log (safe — no token logged) ──────────────────────────────────
  console.log("========== REPORT SUBMISSION ==========");
  console.log("API:", `${API_BASE_URL}/reports`);
  console.log("Image URI:", imageUri);
  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);
  console.log("Description:", description);
  console.log("=======================================");

  // ── Build multipart FormData ─────────────────────────────────────────────
  //
  // React Native's fetch understands ONLY this plain-object shape for files:
  //   { uri: string, name: string, type: string }
  //
  // DO NOT use:
  //   • new File(uri)  — expo-file-system's File class (wrong runtime type)
  //   • new Blob(...)  — not available in React Native
  //   • fetch(imageUri) to convert — causes 404 for local file URIs on Android
  //
  const formData = new FormData();

  // File part — must use the RN plain-object shape, field name "image"
  // to match: image: UploadFile = File(...) in the FastAPI route.
  formData.append("image", new File(imageUri));
  // formData.append("image",new File(imageUri,imageName))
  console.log("Image:", formData.image)

  // Scalar form fields — match FastAPI Form() parameter names exactly.
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));
  console.log("Latitude:", formData.latitude)
    console.log("Longitude:", formData.longitude)

  // description is optional on the backend (Form(default=None)).
  // Only append when non-empty so FastAPI receives null, not an empty string.
  if (description && description.trim()) {
    formData.append("description", description.trim());
  console.log("Description:", formData.description)
  }

  // ── Attach JWT ────────────────────────────────────────────────────────────
  const token = await getToken();
  const headers = {
    Accept: "application/json",
    // DO NOT set Content-Type here.
    // fetch() must generate the multipart boundary automatically.
    // Any manual "Content-Type: multipart/form-data" breaks the boundary.
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // ── Send request ──────────────────────────────────────────────────────────
  let response;
  // console.log(formData.image)
  try {
    console.log(API_BASE_URL)
    response = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers,
      body: formData,
    });
    console.log("Report response status:", response.status);
  } catch (e) {
    const message =  e instanceof Error ? e.message : String(e);
    // Log the real error so Metro shows the actual cause, not a generic message.
    console.error("REPORT SUBMISSION — NETWORK ERROR:", e);
    console.error("Message:", e?.message);
    throw new Error(
      "Can't reach the server. Check your internet connection and try again." + message
    );
  }

  // ── Parse response ────────────────────────────────────────────────────────
  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
        ? data.detail.map((e) => e.msg).join("; ")
        : "Failed to submit report. Please try again.";
    console.error("REPORT SUBMISSION — SERVER ERROR:", response.status, detail);
    throw new Error(detail);
  }

  console.log("Report created:", data?.id ?? data);
  return data;
}

export const listReports = (page = 1, pageSize = 20) =>
  apiRequest(`/reports?page=${page}&page_size=${pageSize}`);

export const getReport = (id) => apiRequest(`/reports/${id}`);

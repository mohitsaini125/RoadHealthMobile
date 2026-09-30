import { API_BASE_URL } from "../config/api";
import { getToken } from "../storage/authStorage";
import { apiRequest } from "./client";

/**
 * Submit a road-damage report using React Native's multipart FormData.
 *
 * IMPORTANT: Expo Go / React Native expects file parts to be the plain
 * `{ uri, name, type }` object shape. Do NOT use expo-file-system's `File`
 * class here; it causes `Unsupported FormDataPart implementation`.
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

  console.log("========== REPORT SUBMISSION ==========");
  console.log("API:", `${API_BASE_URL}/reports`);
  console.log("Image URI:", imageUri);
  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);
  console.log("Description:", description);
  console.log("=======================================");

  const formData = new FormData();

  // Expo ImagePicker normally returns a local file URI such as:
  // file:///data/user/0/.../ImagePicker/<uuid>.jpeg
  // React Native fetch accepts this plain object as a multipart file part.
  const fileName = imageName || `road-damage-${Date.now()}.jpg`;
  const mimeType = imageType || "image/jpeg";

  formData.append("image", {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  });

  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));

  if (description && description.trim()) {
    formData.append("description", description.trim());
  }

  const token = await getToken();
  const headers = {
    Accept: "application/json",
    // Never manually set Content-Type for FormData. fetch() adds the
    // multipart boundary required by FastAPI.
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers,
      body: formData,
    });
    console.log("Report response status:", response.status);
  } catch (e) {
    console.error("REPORT SUBMISSION — NETWORK ERROR:", e);
    console.error("Message:", e?.message);
    throw new Error(
      "Can't reach the server. Check your internet connection and try again."
    );
  }

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
        : `Request failed with status ${response.status}.`;

    console.error("REPORT SUBMISSION — SERVER ERROR:", response.status, detail);
    throw new Error(detail);
  }

  console.log("Report created:", data?.id ?? data);
  return data;
}

export const listReports = (page = 1, pageSize = 20) =>
  apiRequest(`/reports?page=${page}&page_size=${pageSize}`);

export const getReport = (id) => apiRequest(`/reports/${id}`);

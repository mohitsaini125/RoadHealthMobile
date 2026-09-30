import * as FileSystem from "expo-file-system/legacy";
import { API_BASE_URL } from "../config/api";
import { getToken } from "../storage/authStorage";
import { apiRequest } from "./client";

/**
 * Submit a road-damage report using Expo FileSystem's legacy uploadAsync API.
 * Expo SDK 57's legacy API accepts FileSystemUploadType.MULTIPART, whose
 * runtime value is 1. We use the documented numeric value directly to avoid
 * Expo Go builds where the enum export is unavailable at runtime.
 */
export async function submitReport({
  latitude,
  longitude,
  description,
  imageUri,
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

  const token = await getToken();
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const parameters = {
    latitude: String(latitude),
    longitude: String(longitude),
  };

  if (description && description.trim()) {
    parameters.description = description.trim();
  }

  let uploadResult;
  try {
    uploadResult = await FileSystem.uploadAsync(
      `${API_BASE_URL}/reports`,
      imageUri,
      {
        httpMethod: "POST",
        // Expo FileSystem legacy: MULTIPART === 1.
        uploadType: 1,
        fieldName: "image",
        mimeType: imageType || "image/jpeg",
        parameters,
        headers,
      }
    );

    console.log("Report response status:", uploadResult.status);
  } catch (e) {
    console.error("REPORT SUBMISSION — UPLOAD ERROR:", e);
    console.error("Message:", e?.message);
    throw new Error(
      `Report upload failed: ${e?.message || "Unknown upload error"}`
    );
  }

  let data = null;
  try {
    data = JSON.parse(uploadResult.body);
  } catch (_) {
    data = null;
  }

  if (uploadResult.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (uploadResult.status >= 400) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
        ? data.detail.map((e) => e.msg).join("; ")
        : `Server error ${uploadResult.status}. Please try again.`;

    console.error(
      "REPORT SUBMISSION — SERVER ERROR:",
      uploadResult.status,
      detail
    );
    throw new Error(detail);
  }

  console.log("Report created:", data?.id ?? data);
  return data;
}

export const listReports = (page = 1, pageSize = 20) =>
  apiRequest(`/reports?page=${page}&page_size=${pageSize}`);

export const getReport = (id) => apiRequest(`/reports/${id}`);

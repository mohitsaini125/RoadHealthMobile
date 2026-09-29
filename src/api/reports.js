import { File } from "expo-file-system";
import { apiRequest } from "./client";

/**
 * Build a multipart report payload for Expo Go / React Native 0.86.
 *
 * Expo's fetch implementation only accepts a string, Blob, or File as a
 * FormData part. The old React Native `{ uri, name, type }` object throws
 * `Unsupported FormDataPart implementation` on device.
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

  const filename = imageName || `road_damage_${Date.now()}.jpg`;
  const mimeType = imageType || "image/jpeg";

  // Convert the local Expo URI into a real Blob first. Then construct an
  // expo-file-system File from that Blob. This avoids the legacy RN FormData
  // part implementation that Expo Go rejects.
  const blobResponse = await fetch(imageUri);
  if (!blobResponse.ok) {
    throw new Error(`Unable to read selected image (${blobResponse.status}).`);
  }
  const blob = await blobResponse.blob();
  const file = new File([blob], filename, { type: mimeType });

  const formData = new FormData();
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));
  formData.append("description", description || "");
  formData.append("image", file);

  // Do not set Content-Type manually. fetch() must generate the multipart
  // boundary for the FastAPI UploadFile endpoint.
  return apiRequest("/reports", {
    method: "POST",
    body: formData,
  });
}

export const listReports = (page = 1, pageSize = 20) =>
  apiRequest(`/reports?page=${page}&page_size=${pageSize}`);

export const getReport = (id) => apiRequest(`/reports/${id}`);

import { apiRequest } from "./client";

export function submitReport({ latitude, longitude, description, imageUri, imageName, imageType }) {
  if (!imageUri) throw new Error("A road-damage image is required.");

  const formData = new FormData();
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));
  formData.append("description", description || "");

  // Expo React Native requires a URI-based native file part.
  // Do not pass Blob/File objects and do not set Content-Type manually.
  formData.append("image", {
    uri: imageUri,
    name: imageName || "road_damage.jpg",
    type: imageType || "image/jpeg",
  });

  return apiRequest("/reports", { method: "POST", body: formData });
}

export const listReports = (page = 1, pageSize = 20) =>
  apiRequest(`/reports?page=${page}&page_size=${pageSize}`);

export const getReport = (id) => apiRequest(`/reports/${id}`);

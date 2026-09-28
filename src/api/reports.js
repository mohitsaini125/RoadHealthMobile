import { apiRequest } from "./client";

export function submitReport({ latitude, longitude, description, imageUri }) {
  const formData = new FormData();
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));
  formData.append("description", description || "");
  formData.append("image", {
    uri: imageUri,
    name: "road_damage.jpg",
    type: "image/jpeg",
  });
  // Do NOT set Content-Type: fetch generates the multipart boundary.
  return apiRequest("/reports", { method: "POST", body: formData });
}

export const listReports = (page = 1, pageSize = 20) =>
  apiRequest(`/reports?page=${page}&page_size=${pageSize}`);

export const getReport = (id) => apiRequest(`/reports/${id}`);

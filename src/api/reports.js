import { File } from "expo-file-system";
import { apiRequest } from "./client";

export function submitReport({ latitude, longitude, description, imageUri, imageName, imageType }) {
  if (!imageUri) throw new Error("A road-damage image is required.");

  const formData = new FormData();
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));
  formData.append("description", description || "");

  // React Native 0.86 no longer accepts the old plain
  // { uri, name, type } FormData part in this environment.
  // Expo FileSystem's File is a native Blob/File implementation.
  const file = new File(imageUri);
  if (imageName) file.name = imageName;
  if (imageType) file.type = imageType;
  formData.append("image", file);

  // Do not set Content-Type manually. fetch() must generate the multipart boundary.
  return apiRequest("/reports", { method: "POST", body: formData });
}

export const listReports = (page = 1, pageSize = 20) =>
  apiRequest(`/reports?page=${page}&page_size=${pageSize}`);

export const getReport = (id) => apiRequest(`/reports/${id}`);

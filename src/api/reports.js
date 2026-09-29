import { File, UploadType } from "expo-file-system";
import { API_BASE_URL } from "../config/api";
import { getToken } from "../storage/authStorage";

async function uploadReportImage({ latitude, longitude, description, imageUri, imageName, imageType }) {
  if (!imageUri) throw new Error("A road-damage image is required.");

  const token = await getToken();
  const file = new File(imageUri);
  const url = `${API_BASE_URL}/reports`;

  // Use Expo FileSystem's native multipart uploader instead of React Native
  // fetch(FormData). This avoids the Android/Expo Go FormDataPart error.
  const result = await file.upload(url, {
    uploadType: UploadType.MULTIPART,
    fieldName: "image",
    mimeType: imageType || "image/jpeg",
    httpMethod: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    parameters: {
      latitude: String(latitude),
      longitude: String(longitude),
      description: description || "",
    },
  });

  let data = null;
  try {
    data = result.body ? JSON.parse(result.body) : null;
  } catch {
    data = null;
  }

  if (result.status < 200 || result.status >= 300) {
    const detail = typeof data?.detail === "string" ? data.detail : null;
    throw new Error(detail || `Report upload failed (${result.status}).`);
  }

  return data;
}

export function submitReport(params) {
  return uploadReportImage(params);
}

export const listReports = (page = 1, pageSize = 20) => {
  // Kept on the normal JSON API client path for GET requests.
  return import("./client").then(({ apiRequest }) =>
    apiRequest(`/reports?page=${page}&page_size=${pageSize}`)
  );
};

export const getReport = (id) =>
  import("./client").then(({ apiRequest }) => apiRequest(`/reports/${id}`));

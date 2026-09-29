import { File } from "expo-file-system";
import { apiRequest } from "./client";

/**
 * Build a multipart report payload for Expo Go / React Native.
 *
 * IMPORTANT: ImagePicker returns a local device URI. Do not call fetch()
 * against that URI — Android/Expo can return 404 for local file URIs even
 * though the image is perfectly valid. FormData can receive the Expo
 * File object directly.
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

  // ImagePicker gives us a local file URI. Construct an Expo File directly
  // from that URI instead of fetch(imageUri). Fetching a local URI is what
  // caused the previous "Unable to read selected image (404)" error.
  let file;
  try {
    file = new File(imageUri);

    // `exists` is supported by expo-file-system's File API. Fail early with
    // a useful message if the temporary image was actually removed.
    if (!file.exists) {
      throw new Error("The selected image is no longer available on the device.");
    }
  } catch (error) {
    if (error?.message?.includes("no longer available")) {
      throw error;
    }
    throw new Error("Unable to access the selected image on the device.");
  }

  // Preserve the filename/type expected by the FastAPI UploadFile endpoint.
  // The URI-backed File itself is used as the multipart part; no Blob/fetch
  // conversion is needed.
  const uploadFile = file.name === filename && file.type === mimeType
    ? file
    : new File(imageUri, filename, { type: mimeType });

  const formData = new FormData();
  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));
  formData.append("description", description || "");
  formData.append("image", uploadFile);

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

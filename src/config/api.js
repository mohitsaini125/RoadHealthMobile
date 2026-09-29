// Backend URL used by the Expo Go app on a physical device.
// Keep the phone and development PC on the same Wi-Fi network.
const DEV_URL = "http://172.16.8.74:8000/api/v1";

export const API_BASE_URL = DEV_URL;

// Origin without /api/v1, used to resolve relative image paths returned by the API.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");

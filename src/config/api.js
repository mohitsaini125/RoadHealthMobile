// Backend URL used by the Expo Go app on a physical device.
// Phone and development PC must be on the same Wi-Fi/LAN.
//
// Override at runtime (no rebuild needed):
//   EXPO_PUBLIC_API_URL=http://<PC_LAN_IP>:8000/api/v1 npx expo start
//
// Current LAN IP of development PC:
const DEV_URL = "http://172.16.8.74:8000/api/v1";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_URL;

// Origin without /api/v1, used to resolve relative image paths returned by the API.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");

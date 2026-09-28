// Single place to configure the backend URL.
// Pick ONE, or set EXPO_PUBLIC_API_URL in a .env file.
//
//   iOS simulator / web : http://127.0.0.1:8000/api/v1
//   Android emulator    : http://10.0.2.2:8000/api/v1
//   Physical device     : http://YOUR_PC_LOCAL_IP:8000/api/v1  (same Wi-Fi)
const DEV_URL = "http://10.0.2.2:8000/api/v1";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_URL;

// Origin without /api/v1, used to resolve relative image paths returned by the API.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");

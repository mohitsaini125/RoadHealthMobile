# Road Health AI — Citizen App (Expo, JavaScript)

## Run
```bash
npm install
npx expo install --fix     # aligns package versions with your Expo SDK
npx expo start
```

## Point the app at your backend
Edit **`src/config/api.js`** (the only place the URL lives), or set `EXPO_PUBLIC_API_URL`:

| Where you run it        | URL                                   |
|-------------------------|---------------------------------------|
| Android emulator        | `http://10.0.2.2:8000/api/v1` (default) |
| iOS simulator           | `http://127.0.0.1:8000/api/v1`        |
| Physical phone (Wi-Fi)  | `http://YOUR_PC_LOCAL_IP:8000/api/v1` |

Start the backend with `python -m uvicorn app.main:app --reload --host 0.0.0.0`
(`--host 0.0.0.0` is needed for a physical device).

## Notes
- Camera/gallery use `expo-image-picker`; location uses `expo-location`; token in `expo-secure-store`.
- The app only displays backend values — no severity, priority, SLA, escalation or status logic on the client.
- Report/response field names are read tolerantly (see `src/utils/report.js`). If your backend uses
  different names, adjust that one file.

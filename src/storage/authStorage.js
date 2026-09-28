import * as SecureStore from "expo-secure-store";

const KEY = "access_token";

export async function saveToken(token) {
  await SecureStore.setItemAsync(KEY, token);
}

export async function getToken() {
  return await SecureStore.getItemAsync(KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(KEY);
}

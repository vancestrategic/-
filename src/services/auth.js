import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = "smtia_token";

export async function getToken() {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      await clearToken();
      return null;
    }

    return token.trim();
  } catch (e) {
    return null;
  }
}

export async function setToken(token) {
  if (!token || typeof token !== "string") return;

  const cleanToken = token.trim();
  const parts = cleanToken.split(".");

  if (parts.length === 3) {
    await AsyncStorage.setItem(TOKEN_KEY, cleanToken);
  }
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function getJwtPayload(token) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    // Decode base64url
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    // atob is available in React Native environment (JSC/Hermes)
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getUserFromToken(token) {
  const payload = getJwtPayload(token);
  if (!payload) return null;

  const rolesRaw =
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
    payload["role"] ??
    [];
  const roles = Array.isArray(rolesRaw) ? rolesRaw : [rolesRaw].filter(Boolean);

  return {
    id: payload.Id || payload.id || null,
    name: payload.Name || payload.name || null,
    email: payload.Email || payload.email || null,
    userName: payload.UserName || payload.userName || null,
    roles,
  };
}

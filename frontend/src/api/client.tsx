// src/api/client.ts
import { API } from "../registerform";

export async function get<T>(path: string): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.replace("/login"); // simple redirect
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

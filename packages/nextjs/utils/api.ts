export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

type Json = Record<string, unknown>;

export async function postJson<T = any>(path: string, body: Json): Promise<T> {
  const url = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error("Request failed"), { status: res.status, json });
  }
  return json as T;
}

export async function getJson<T = any>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error("Request failed"), { status: res.status, json });
  }
  return json as T;
}

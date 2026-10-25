const URL = import.meta.env.VITE_API_URL
const KEY = import.meta.env.VITE_API_KEY

export async function api(path, body) {
  let res
  try {
    res = await fetch(`${URL}/api${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'X-API-Key': KEY, ...(body && { 'Content-Type': 'application/json' }) },
      body: body && JSON.stringify(body),
    })
  } catch {
    throw new Error("Can't reach server")
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw Object.assign(new Error(data?.detail || res.statusText), { status: res.status, data })
  return data
}

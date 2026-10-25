const URL = import.meta.env.VITE_API_URL

export async function api(path, body, method) {
  let res
  try {
    res = await fetch(`${URL}/api${path}`, {
      method: method || (body ? 'POST' : 'GET'),
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body && JSON.stringify(body),
    })
  } catch {
    throw new Error("Can't reach server")
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw Object.assign(new Error(typeof data?.detail === 'string' ? data.detail : res.statusText), { status: res.status, data })
  return data
}

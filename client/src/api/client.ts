const getToken = () => localStorage.getItem("cafeteria_auth");

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path.startsWith("http") ? path : `/api${path}`, {
    ...options,
    headers,
  });
  const text = await res.text();
  let data: T | undefined;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      // non-JSON response
    }
  }
  if (!res.ok) {
    const error = (data as { error?: string })?.error ?? res.statusText;
    return { error, status: res.status, data };
  }
  return { data: data ?? (undefined as T), status: res.status };
}

export async function login(email: string, name: string) {
  return request<{ token: string; employee: { id: string; email: string; name: string } }>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ email, name }) }
  );
}

export async function getAvailability(date: string) {
  return request<{
    date: string;
    totalSeats: number;
    taken: number;
    available: number;
    takenSeatNumbers: number[];
  }>(`/availability?date=${encodeURIComponent(date)}`);
}

export async function createReservation(date: string) {
  return request<{ id: string; date: string; seatNumber: number }>("/reservations", {
    method: "POST",
    body: JSON.stringify({ date }),
  });
}

export async function getMyReservations(date?: string) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return request<Array<{ id: string; date: string; seatNumber: number }>>(`/reservations${q}`);
}

export async function cancelReservation(id: string) {
  return request(`/reservations/${id}`, { method: "DELETE" });
}

export async function getMe() {
  return request<{ id: string; email: string; name: string; location: string }>("/employees/me");
}

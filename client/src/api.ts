import type { DeckType, Participant, Session, SessionSummary } from "./types";

const API_URL = "http://localhost:3000";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, options);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Serveranfrage fehlgeschlagen");
  }

  return response.json() as Promise<T>;
}

export function getSessions() {
  return request<SessionSummary[]>("/sessions");
}

export function createSession() {
  return request<Session>("/sessions", {
    method: "POST",
  });
}

export function getSession(sessionId: string) {
  return request<Session>(`/sessions/${sessionId}`);
}

export function deleteSession(sessionId: string) {
  return request<{ message: string }>(`/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export function joinSession(
  sessionId: string,
  name: string,
  participantId?: string
) {
  return request<Participant>(`/sessions/${sessionId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, participantId }),
  });
}

export function leaveSession(sessionId: string, participantId: string) {
  return request<{ message: string }>(`/sessions/${sessionId}/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ participantId }),
  });
}

export function sendHeartbeat(sessionId: string, participantId: string) {
  return request<{ message: string }>(`/sessions/${sessionId}/heartbeat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ participantId }),
  });
}

export function vote(
  sessionId: string,
  participantId: string,
  value: string
) {
  return request<Participant>(`/sessions/${sessionId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ participantId, vote: value }),
  });
}

export function reveal(sessionId: string) {
  return request<Session>(`/sessions/${sessionId}/reveal`, {
    method: "POST",
  });
}

export function reset(sessionId: string) {
  return request<Session>(`/sessions/${sessionId}/reset`, {
    method: "POST",
  });
}

export function changeDeck(sessionId: string, deck: DeckType) {
  return request<Session>(`/sessions/${sessionId}/deck`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ deck }),
  });
}

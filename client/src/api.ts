import type { DeckType, ErrorResponse, Participant, Session, SessionSummary } from "./types";

// Relativer Pfad: Der Vite-Proxy (vite.config.ts) leitet /api an http://localhost:3000 weiter.
const API_URL = "/api";

const jsonHeaders = {
  "Content-Type": "application/json",
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, options);

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as ErrorResponse | null;
    throw new Error(data?.error ?? `Serveranfrage fehlgeschlagen (${response.status})`);
  }

  // 204 No Content (z. B. bei DELETE) hat keinen Body.
  if (response.status === 204) {
    return undefined as T;
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
  return request<void>(`/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

// Beitreten ist idempotent: Mit demselben Namen bekommt man denselben Teilnehmer zurück.
export function joinSession(sessionId: string, name: string) {
  return request<Participant>(`/sessions/${sessionId}/participants`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ name }),
  });
}

// keepalive: Der Request wird auch dann noch gesendet, wenn der Tab gerade geschlossen wird.
export function leaveSession(sessionId: string, participantId: string, keepalive = false) {
  return request<void>(`/sessions/${sessionId}/participants/${participantId}`, {
    method: "DELETE",
    keepalive,
  });
}

// value = null nimmt die Karte zurück.
export function vote(sessionId: string, participantId: string, value: string | null) {
  return request<Participant>(`/sessions/${sessionId}/participants/${participantId}/vote`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ vote: value }),
  });
}

// true = aufdecken, false = neue Runde (Server löscht alle Stimmen).
function setRevealed(sessionId: string, revealed: boolean) {
  return request<Session>(`/sessions/${sessionId}/revealed`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ revealed }),
  });
}

export function reveal(sessionId: string) {
  return setRevealed(sessionId, true);
}

export function reset(sessionId: string) {
  return setRevealed(sessionId, false);
}

export function changeDeck(sessionId: string, deck: DeckType) {
  return request<Session>(`/sessions/${sessionId}/deck`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify({ deck }),
  });
}

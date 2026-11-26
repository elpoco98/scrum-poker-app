// Diese Types passen zu den Antwort-Types des Servers (server/src/types.ts).

export type DeckType = "fibonacci" | "tshirt";

export interface Participant {
  id: string;
  name: string;
  hasVoted: boolean;
  // Bleibt null, bis die Runde aufgedeckt ist (der Server verdeckt die Stimmen).
  vote: string | null;
}

export interface Session {
  id: string;
  deck: DeckType;
  revealed: boolean;
  participants: Participant[];
}

export interface SessionSummary {
  id: string;
  participantCount: number;
}

export interface ErrorResponse {
  error: string;
}

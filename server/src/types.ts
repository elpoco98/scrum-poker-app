export type DeckType = "fibonacci" | "tshirt";

export interface Participant {
  id: string;
  name: string;
  vote: string | null;
  lastSeen: number;
}

export interface Session {
  id: string;
  participants: Participant[];
  deck: DeckType;
  revealed: boolean;
}

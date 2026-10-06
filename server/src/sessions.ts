import type { Session } from "./types.js";

export const sessions = new Map<string, Session>();

const PARTICIPANT_TIMEOUT = 15_000;

export function removeInactiveParticipants(session: Session) {
  const now = Date.now();

  session.participants = session.participants.filter(
    (participant) => now - participant.lastSeen < PARTICIPANT_TIMEOUT
  );
}

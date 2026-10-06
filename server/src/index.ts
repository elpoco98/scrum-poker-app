import express from "express";
import cors from "cors";
import { removeInactiveParticipants, sessions } from "./sessions.js";
import type { DeckType, Participant, Session } from "./types.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function createSessionId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getSession(id: string): Session | undefined {
  const session = sessions.get(id);

  if (session) {
    removeInactiveParticipants(session);
  }

  return session;
}

app.get("/", (_req, res) => {
  res.json({ message: "Scrum Poker Server läuft" });
});

app.get("/sessions", (_req, res) => {
  const sessionList = Array.from(sessions.values()).map((session) => {
    removeInactiveParticipants(session);

    return {
      id: session.id,
      participantCount: session.participants.length,
    };
  });

  res.json(sessionList);
});

app.get("/sessions/:id", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  res.json(session);
});

app.post("/sessions", (_req, res) => {
  let id = createSessionId();

  while (sessions.has(id)) {
    id = createSessionId();
  }

  const session: Session = {
    id,
    participants: [],
    deck: "fibonacci",
    revealed: false,
  };

  sessions.set(id, session);
  res.status(201).json(session);
});

app.delete("/sessions/:id", (req, res) => {
  const session = sessions.get(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  sessions.delete(req.params.id);
  res.json({ message: "Session wurde gelöscht" });
});

app.post("/sessions/:id/join", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  const name = String(req.body.name ?? "").trim();
  const requestedParticipantId = String(req.body.participantId ?? "").trim();

  if (!name) {
    return res.status(400).json({ message: "Name ist erforderlich" });
  }

  if (requestedParticipantId) {
    const existingParticipant = session.participants.find(
      (participant) => participant.id === requestedParticipantId
    );

    if (existingParticipant) {
      existingParticipant.name = name;
      existingParticipant.lastSeen = Date.now();
      return res.json(existingParticipant);
    }
  }

  const participant: Participant = {
    id: requestedParticipantId || crypto.randomUUID(),
    name,
    vote: null,
    lastSeen: Date.now(),
  };

  session.participants.push(participant);
  res.status(201).json(participant);
});

app.post("/sessions/:id/leave", (req, res) => {
  const session = sessions.get(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  const participantId = String(req.body.participantId ?? "");

  session.participants = session.participants.filter(
    (participant) => participant.id !== participantId
  );

  res.json({ message: "Teilnehmer hat die Session verlassen" });
});

app.post("/sessions/:id/heartbeat", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  const participantId = String(req.body.participantId ?? "");
  const participant = session.participants.find(
    (item) => item.id === participantId
  );

  if (!participant) {
    return res.status(404).json({ message: "Teilnehmer nicht gefunden" });
  }

  participant.lastSeen = Date.now();
  res.json({ message: "Heartbeat gespeichert" });
});

app.post("/sessions/:id/vote", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  const participantId = String(req.body.participantId ?? "");
  const vote = String(req.body.vote ?? "").trim();

  const participant = session.participants.find(
    (item) => item.id === participantId
  );

  if (!participant) {
    return res.status(404).json({ message: "Teilnehmer nicht gefunden" });
  }

  if (!vote) {
    return res.status(400).json({ message: "Vote ist erforderlich" });
  }

  const allowedVotes =
    session.deck === "fibonacci"
      ? ["1", "2", "3", "5", "8", "13", "21"]
      : ["XS", "S", "M", "L", "XL"];

  if (!allowedVotes.includes(vote)) {
    return res.status(400).json({ message: "Ungültiger Vote" });
  }

  participant.vote = vote;
  participant.lastSeen = Date.now();

  res.json(participant);
});

app.post("/sessions/:id/reveal", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  session.revealed = true;
  res.json(session);
});

app.post("/sessions/:id/reset", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  session.revealed = false;

  for (const participant of session.participants) {
    participant.vote = null;
  }

  res.json(session);
});

app.put("/sessions/:id/deck", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ message: "Session nicht gefunden" });
  }

  const deck = req.body.deck as DeckType;

  if (deck !== "fibonacci" && deck !== "tshirt") {
    return res.status(400).json({ message: "Ungültiges Deck" });
  }

  session.deck = deck;
  session.revealed = false;

  for (const participant of session.participants) {
    participant.vote = null;
  }

  res.json(session);
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

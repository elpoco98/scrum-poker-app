import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  changeDeck,
  getSession,
  joinSession,
  leaveSession,
  reset,
  reveal,
  sendHeartbeat,
  vote,
} from "../api";
import ParticipantCard from "../components/ParticipantCard";
import PokerCard from "../components/PokerCard";
import type { DeckType, Session } from "../types";

const fibonacciCards = ["1", "2", "3", "5", "8", "13", "21"];
const tshirtCards = ["XS", "S", "M", "L", "XL"];

function SessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState(() => localStorage.getItem("username")?.trim() ?? "");
  const [nameInput, setNameInput] = useState(() => localStorage.getItem("username") ?? "");

  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const participantIdRef = useRef<string | null>(null);

  const loadCurrentSession = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    try {
      setSyncing(true);
      const data = await getSession(sessionId);
      setSession(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session konnte nicht geladen werden");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !name) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function startSession() {
      try {
        setLoading(true);
        setError(null);

        const storageKey = `participantId:${sessionId}`;
        const storedParticipantId = localStorage.getItem(storageKey) ?? undefined;

        const participant = await joinSession(sessionId, name, storedParticipantId);

        if (cancelled) {
          return;
        }

        localStorage.setItem(storageKey, participant.id);
        participantIdRef.current = participant.id;
        setParticipantId(participant.id);

        const data = await getSession(sessionId);

        if (!cancelled) {
          setSession(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Beitritt fehlgeschlagen");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void startSession();

    return () => {
      cancelled = true;
    };
  }, [name, sessionId]);

  useEffect(() => {
    if (!sessionId || !participantId) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        setSyncing(true);
        await sendHeartbeat(sessionId, participantId);
        const data = await getSession(sessionId);
        setSession(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Synchronisierung fehlgeschlagen");
      } finally {
        setSyncing(false);
      }
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [participantId, sessionId]);

  useEffect(() => {
    return () => {
      if (sessionId && participantIdRef.current) {
        void leaveSession(sessionId, participantIdRef.current).catch(() => undefined);
      }
    };
  }, [sessionId]);

  const currentParticipant = session?.participants.find(
    (participant) => participant.id === participantId
  );

  const cards = session?.deck === "tshirt" ? tshirtCards : fibonacciCards;

  const resultText = useMemo(() => {
    if (!session?.revealed) {
      return null;
    }

    const votes = session.participants
      .map((participant) => participant.vote)
      .filter((item): item is string => item !== null);

    if (votes.length === 0) {
      return "Noch keine Schätzungen vorhanden.";
    }

    const unanimous =
      votes.length === session.participants.length &&
      votes.every((item) => item === votes[0]);

    if (unanimous) {
      return `Alle sind sich einig: ${votes[0]}`;
    }

    if (session.deck === "fibonacci") {
      const numbers = votes.map(Number);
      const average = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
      return `Durchschnitt: ${average.toFixed(1)}`;
    }

    const counts = new Map<string, number>();

    for (const item of votes) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }

    const mostCommon = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return `Häufigste Schätzung: ${mostCommon}`;
  }, [session]);

  async function runAction(action: () => Promise<unknown>) {
    try {
      setActionLoading(true);
      setError(null);
      await action();
      await loadCurrentSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleVote(value: string) {
    if (!sessionId || !participantId) {
      return;
    }

    await runAction(() => vote(sessionId, participantId, value));
  }

  async function handleReveal() {
    if (!sessionId) {
      return;
    }

    await runAction(() => reveal(sessionId));
  }

  async function handleReset() {
    if (!sessionId) {
      return;
    }

    await runAction(() => reset(sessionId));
  }

  async function handleDeckChange(deck: DeckType) {
    if (!sessionId) {
      return;
    }

    await runAction(() => changeDeck(sessionId, deck));
  }

  async function handleLeave() {
    if (!sessionId || !participantId) {
      navigate("/");
      return;
    }

    try {
      setActionLoading(true);
      await leaveSession(sessionId, participantId);
      localStorage.removeItem(`participantId:${sessionId}`);
      participantIdRef.current = null;
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verlassen fehlgeschlagen");
      setActionLoading(false);
    }
  }

  function handleDirectJoin() {
    const trimmedName = nameInput.trim();

    if (!trimmedName) {
      setError("Bitte gib einen Namen ein.");
      return;
    }

    localStorage.setItem("username", trimmedName);
    setName(trimmedName);
    setError(null);
  }

  if (!name) {
    return (
      <main className="page">
        <section className="panel">
          <h1>Session {sessionId}</h1>
          <p>Gib deinen Namen ein, um direkt über diesen Link beizutreten.</p>

          <label htmlFor="direct-name">Dein Name</label>
          <input
            id="direct-name"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="Zum Beispiel Vincent"
          />

          <button type="button" onClick={handleDirectJoin}>
            Session beitreten
          </button>

          {error && <p className="error">{error}</p>}
          <p><Link to="/">Zur Startseite</Link></p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page">
        <section className="panel">
          <p>Session wird geladen...</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page">
        <section className="panel">
          <h1>Session nicht verfügbar</h1>
          <p className="error">{error ?? "Session konnte nicht geladen werden."}</p>
          <Link to="/">Zur Startseite</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="panel session-header">
        <div>
          <h1>Session {session.id}</h1>
          <p>Angemeldet als {name}</p>
          {syncing && <span className="status">Synchronisiere...</span>}
        </div>

        <button
          className="danger-button"
          type="button"
          disabled={actionLoading}
          onClick={() => void handleLeave()}
        >
          Session verlassen
        </button>
      </section>

      {error && <p className="error panel">{error}</p>}
      {actionLoading && <p className="status panel">Aktion wird ausgeführt...</p>}

      <section className="panel">
        <h2>Deck</h2>
        <div className="button-row">
          <button
            type="button"
            disabled={actionLoading || session.deck === "fibonacci"}
            onClick={() => void handleDeckChange("fibonacci")}
          >
            Fibonacci
          </button>

          <button
            type="button"
            disabled={actionLoading || session.deck === "tshirt"}
            onClick={() => void handleDeckChange("tshirt")}
          >
            T-Shirt
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Teilnehmer</h2>
        <div className="participant-grid">
          {session.participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              revealed={session.revealed}
              isCurrentUser={participant.id === participantId}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Deine Schätzung</h2>
        <div className="card-grid">
          {cards.map((value) => (
            <PokerCard
              key={value}
              value={value}
              selected={currentParticipant?.vote === value}
              disabled={actionLoading || session.revealed}
              onClick={() => void handleVote(value)}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Runde</h2>
        <div className="button-row">
          <button
            type="button"
            disabled={actionLoading || session.revealed}
            onClick={() => void handleReveal()}
          >
            Karten aufdecken
          </button>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => void handleReset()}
          >
            Runde zurücksetzen
          </button>
        </div>

        {session.revealed && resultText && (
          <div className="result-box">
            <strong>{resultText}</strong>
          </div>
        )}
      </section>
    </main>
  );
}

export default SessionPage;

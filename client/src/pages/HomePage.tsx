import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession, deleteSession, getSessions } from "../api";
import type { SessionSummary } from "../types";

function HomePage() {
  const navigate = useNavigate();

  const [name, setName] = useState(() => localStorage.getItem("username") ?? "");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSessions(showMainLoading = false) {
    try {
      if (showMainLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data = await getSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadSessions(true);

    const intervalId = window.setInterval(() => {
      void loadSessions(false);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, []);

  function handleNameChange(value: string) {
    setName(value);
    localStorage.setItem("username", value);
  }

  function validateName(): boolean {
    if (!name.trim()) {
      setError("Bitte gib zuerst einen Namen ein.");
      return false;
    }

    return true;
  }

  async function handleCreateSession() {
    if (!validateName()) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const session = await createSession();
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session konnte nicht erstellt werden");
    } finally {
      setActionLoading(false);
    }
  }

  function handleJoinSession(sessionId: string) {
    if (!validateName()) {
      return;
    }

    navigate(`/sessions/${sessionId}`);
  }

  async function handleDeleteSession(sessionId: string) {
    try {
      setActionLoading(true);
      setError(null);
      await deleteSession(sessionId);
      await loadSessions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session konnte nicht gelöscht werden");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Scrum Poker</h1>
        <p>Gib deinen Namen ein und erstelle eine Session oder tritt einer offenen Session bei.</p>

        <label htmlFor="name">Dein Name</label>
        <input
          id="name"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder="Zum Beispiel Vincent"
        />

        <button
          type="button"
          disabled={actionLoading}
          onClick={() => void handleCreateSession()}
        >
          Neue Session erstellen
        </button>

        {actionLoading && <p className="status">Aktion wird ausgeführt...</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Offene Sessions</h2>
          {refreshing && <span className="status">Aktualisiere...</span>}
        </div>

        {loading ? (
          <p>Sessions werden geladen...</p>
        ) : sessions.length === 0 ? (
          <p>Momentan gibt es keine offenen Sessions.</p>
        ) : (
          <div className="session-list">
            {sessions.map((session) => (
              <div className="session-row" key={session.id}>
                <button
                  className="session-link"
                  type="button"
                  onClick={() => handleJoinSession(session.id)}
                >
                  <strong>{session.id}</strong>
                  <span>{session.participantCount} Teilnehmer</span>
                </button>

                <button
                  className="danger-button"
                  type="button"
                  disabled={actionLoading}
                  onClick={() => void handleDeleteSession(session.id)}
                >
                  Löschen
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default HomePage;

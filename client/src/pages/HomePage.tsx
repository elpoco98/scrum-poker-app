import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../components/Input'
import { Sessions } from '../components/Sessions'
import { POLL_MS } from '../config'
import { useMutation } from '../hooks/useMutation'
import { useQuery } from '../hooks/useQuery'
import type { SessionSummary, SessionView } from '../types/api'
import { loadUsername, saveUsername } from '../utils/username'
import './HomePage.css'

// Entry point: enter a name, create a session, join or delete one.
export function HomePage() {
  const navigate = useNavigate()

  // Lazy initial value: localStorage is only read on the first render.
  const [name, setName] = useState(loadUsername)
  const [validationError, setValidationError] = useState<string | null>(null)

  // The list changes all the time, so it is reloaded regularly (polling).
  const sessionsQuery = useQuery<SessionSummary[]>('/api/sessions', {
    pollMs: POLL_MS,
  })
  const createMutation = useMutation<SessionView>('POST')
  const deleteMutation = useMutation('DELETE')

  const sessions = sessionsQuery.data ?? []
  const isActionLoading = createMutation.isLoading || deleteMutation.isLoading
  const error =
    validationError ??
    createMutation.error ??
    deleteMutation.error ??
    sessionsQuery.error

  function handleNameChange(value: string) {
    setName(value)
    saveUsername(value)
    setValidationError(null)
  }

  function validateName(): boolean {
    if (name.trim() === '') {
      setValidationError('Bitte gib zuerst einen Namen ein.')
      return false
    }
    setValidationError(null)
    return true
  }

  async function handleCreateSession() {
    if (!validateName()) {
      return
    }
    // The server generates the session ID.
    const result = await createMutation.send('/api/sessions')
    if (result.error !== null) {
      return
    }
    navigate(`/sessions/${result.data.id}`)
  }

  function handleJoinSession(sessionId: string) {
    if (!validateName()) {
      return
    }
    navigate(`/sessions/${sessionId}`)
  }

  async function handleDeleteSession(sessionId: string) {
    const result = await deleteMutation.send(`/api/sessions/${sessionId}`)
    if (result.error !== null) {
      return
    }
    sessionsQuery.refetch()
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Scrum Poker</h1>
        <p>
          Gib deinen Namen ein und erstelle eine Session oder tritt einer
          offenen Session bei.
        </p>

        <label htmlFor="name">Dein Name</label>
        <Input
          id="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Zum Beispiel Vincent"
        />

        <button
          type="button"
          disabled={isActionLoading}
          onClick={handleCreateSession}
        >
          Neue Session erstellen
        </button>

        {isActionLoading && <p className="status">Aktion wird ausgeführt...</p>}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Offene Sessions</h2>
        </div>

        {sessionsQuery.isLoading ? (
          <p>Sessions werden geladen...</p>
        ) : sessions.length === 0 ? (
          <p>Momentan gibt es keine offenen Sessions.</p>
        ) : (
          <Sessions
            sessions={sessions}
            disabled={isActionLoading}
            onJoin={handleJoinSession}
            onDelete={handleDeleteSession}
          />
        )}
      </section>
    </main>
  )
}

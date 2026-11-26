import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { request } from '../api/request'
import { Input } from '../components/Input'
import { PokerTable } from '../components/PokerTable'
import type { ParticipantView } from '../types/api'
import { loadUsername, saveUsername } from '../utils/username'

// Reads the session ID from the URL and joins the session with the stored name.
// After joining, the PokerTable takes over.
export function SessionPage() {
  const { sessionId } = useParams()

  // name: the name used for joining. Empty = ask for a name first
  // (e.g. a shared link is opened for the first time).
  const [name, setName] = useState(() => loadUsername().trim())
  const [nameInput, setNameInput] = useState(loadUsername)
  const [nameError, setNameError] = useState<string | null>(null)

  const [participantId, setParticipantId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Join as soon as session ID and name are known.
  // We use request() directly here: useMutation is meant for clicks,
  // its send function changes on every render and would restart this effect.
  useEffect(() => {
    if (sessionId === undefined || name === '') {
      return
    }
    // Old responses may still arrive after the cleanup. We ignore them.
    let ignore = false

    async function join() {
      // The name is the key: the same name gets the same seat back.
      const result = await request<ParticipantView>(
        'POST',
        `/api/sessions/${sessionId}/participants`,
        { name },
      )
      if (ignore) {
        return
      }
      if (result.error !== null) {
        setJoinError(result.error)
        return
      }
      setParticipantId(result.data.id)
    }

    join()
    return () => {
      ignore = true
    }
  }, [sessionId, name])

  function handleDirectJoin() {
    const trimmedName = nameInput.trim()
    if (trimmedName === '') {
      setNameError('Bitte gib einen Namen ein.')
      return
    }
    saveUsername(trimmedName)
    setName(trimmedName)
    setNameError(null)
  }

  if (name === '') {
    return (
      <main className="page">
        <section className="panel">
          <h1>Session {sessionId}</h1>
          <p>Gib deinen Namen ein, um direkt über diesen Link beizutreten.</p>

          <label htmlFor="direct-name">Dein Name</label>
          <Input
            id="direct-name"
            value={nameInput}
            onChange={setNameInput}
            placeholder="Zum Beispiel Vincent"
          />

          <button type="button" onClick={handleDirectJoin}>
            Session beitreten
          </button>

          {nameError && <p className="error">{nameError}</p>}
          <p>
            <Link to="/">Zur Startseite</Link>
          </p>
        </section>
      </main>
    )
  }

  if (sessionId === undefined || joinError !== null) {
    return (
      <main className="page">
        <section className="panel">
          <h1>Session nicht verfügbar</h1>
          <p className="error">
            {joinError ?? 'Session konnte nicht geladen werden.'}
          </p>
          <Link to="/">Zur Startseite</Link>
        </section>
      </main>
    )
  }

  if (participantId === null) {
    return (
      <main className="page">
        <section className="panel">
          <p>Session wird geladen...</p>
        </section>
      </main>
    )
  }

  return (
    <PokerTable
      sessionId={sessionId}
      participantId={participantId}
      name={name}
    />
  )
}

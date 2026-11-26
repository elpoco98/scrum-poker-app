import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { POLL_MS } from '../config'
import { useMutation } from '../hooks/useMutation'
import { useQuery } from '../hooks/useQuery'
import type { DeckId, ParticipantView, SessionView } from '../types/api'
import { DECK_OPTIONS, DECKS } from '../utils/decks'
import { getResultText } from '../utils/result'
import { ParticipantCard } from './ParticipantCard'
import { PokerCard } from './PokerCard'
import './PokerTable.css'

type Props = {
  sessionId: string
  participantId: string
  name: string
}

// The poker table of one session. Is only rendered after joining,
// so the polling starts with a known participant ID.
export function PokerTable(props: Props) {
  const navigate = useNavigate()
  const sessionUrl = `/api/sessions/${props.sessionId}`
  const participantUrl = `${sessionUrl}/participants/${props.participantId}`

  // Single source of truth: the session state lives on the server.
  // useQuery polls it and cleans up the interval on unmount.
  const sessionQuery = useQuery<SessionView>(sessionUrl, { pollMs: POLL_MS })
  const voteMutation = useMutation<ParticipantView>('PUT')
  const revealedMutation = useMutation<SessionView>('PUT')
  const deckMutation = useMutation<SessionView>('PUT')
  const leaveMutation = useMutation('DELETE')

  // The server hides even your own vote until the reveal.
  // So the frontend remembers which card was picked.
  const [myVote, setMyVote] = useState<string | null>(null)

  // Set as soon as we left the session, so we do not send DELETE twice.
  // A ref, because changing it must not cause a new render.
  const hasLeftRef = useRef(false)

  // Strategy against "ghost participants": when the component unmounts
  // (navigation inside the app) or the tab is closed (pagehide),
  // the participant is removed on the server.
  useEffect(() => {
    function leaveQuietly() {
      if (hasLeftRef.current) {
        return
      }
      hasLeftRef.current = true
      // request() has no keepalive option. keepalive makes sure the request
      // is still sent while the tab is closing. Errors are ignored on purpose.
      fetch(participantUrl, { method: 'DELETE', keepalive: true }).catch(
        () => undefined,
      )
    }

    window.addEventListener('pagehide', leaveQuietly)
    return () => {
      window.removeEventListener('pagehide', leaveQuietly)
      leaveQuietly()
    }
  }, [participantUrl])

  const isActionLoading =
    voteMutation.isLoading ||
    revealedMutation.isLoading ||
    deckMutation.isLoading ||
    leaveMutation.isLoading

  const error =
    voteMutation.error ??
    revealedMutation.error ??
    deckMutation.error ??
    leaveMutation.error ??
    sessionQuery.error

  // newVote = null takes the card back.
  async function handleVote(newVote: string | null) {
    const result = await voteMutation.send(`${participantUrl}/vote`, {
      vote: newVote,
    })
    if (result.error !== null) {
      return
    }
    setMyVote(newVote)
    sessionQuery.refetch()
  }

  // true = reveal, false = new round (the server clears all votes).
  async function handleRevealed(revealed: boolean) {
    const result = await revealedMutation.send(`${sessionUrl}/revealed`, {
      revealed,
    })
    if (result.error !== null) {
      return
    }
    sessionQuery.refetch()
  }

  async function handleDeckChange(deck: DeckId) {
    const result = await deckMutation.send(`${sessionUrl}/deck`, { deck })
    if (result.error !== null) {
      return
    }
    sessionQuery.refetch()
  }

  async function handleLeave() {
    const result = await leaveMutation.send(participantUrl)
    if (result.error !== null) {
      return
    }
    hasLeftRef.current = true
    navigate('/')
  }

  if (sessionQuery.isLoading) {
    return (
      <main className="page">
        <section className="panel">
          <p>Session wird geladen...</p>
        </section>
      </main>
    )
  }

  const session = sessionQuery.data

  if (session === null) {
    return (
      <main className="page">
        <section className="panel">
          <h1>Session nicht verfügbar</h1>
          <p className="error">
            {error ?? 'Session konnte nicht geladen werden.'}
          </p>
          <Link to="/">Zur Startseite</Link>
        </section>
      </main>
    )
  }

  // Derived values: computed on every render, not stored in state.
  const currentParticipant = session.participants.find(
    (participant) => participant.id === props.participantId,
  )
  // If the server cleared the vote (new round, deck switch), no card is selected.
  const selectedVote = currentParticipant?.hasVoted ? myVote : null
  const cards = DECKS[session.deck]
  const resultText = getResultText(session)

  return (
    <main className="page">
      <section className="panel session-header">
        <div>
          <h1>Session {session.id}</h1>
          <p>Angemeldet als {props.name}</p>
        </div>

        <button
          className="danger-button"
          type="button"
          disabled={isActionLoading}
          onClick={handleLeave}
        >
          Session verlassen
        </button>
      </section>

      {error && <p className="error panel">{error}</p>}
      {isActionLoading && (
        <p className="status panel">Aktion wird ausgeführt...</p>
      )}

      <section className="panel">
        <h2>Deck</h2>
        <div className="button-row">
          {DECK_OPTIONS.map((deck) => (
            <button
              key={deck.id}
              type="button"
              disabled={isActionLoading || session.deck === deck.id}
              onClick={() => handleDeckChange(deck.id)}
            >
              {deck.label}
            </button>
          ))}
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
              isCurrentUser={participant.id === props.participantId}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Deine Schätzung</h2>
        <div className="card-grid">
          {cards.map((card) => (
            <PokerCard
              key={card}
              value={card}
              selected={selectedVote === card}
              disabled={isActionLoading || session.revealed}
              // Clicking the selected card again takes it back.
              onClick={() => handleVote(selectedVote === card ? null : card)}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Runde</h2>
        <div className="button-row">
          <button
            type="button"
            disabled={isActionLoading || session.revealed}
            onClick={() => handleRevealed(true)}
          >
            Karten aufdecken
          </button>

          <button
            type="button"
            disabled={isActionLoading}
            onClick={() => handleRevealed(false)}
          >
            Runde zurücksetzen
          </button>
        </div>

        {resultText !== null && (
          <div className="result-box">
            <strong>{resultText}</strong>
          </div>
        )}
      </section>
    </main>
  )
}

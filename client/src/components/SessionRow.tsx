import type { SessionSummary } from '../types/api'

type Props = {
  row: SessionSummary
  disabled: boolean
  onJoin: (sessionId: string) => void
  onDelete: (sessionId: string) => void
}

// One entry of the session list: click to join, button to delete.
export function SessionRow(props: Props) {
  return (
    <div className="session-row">
      <button
        className="session-link"
        type="button"
        onClick={() => props.onJoin(props.row.id)}
      >
        <strong>{props.row.id}</strong>
        <span>{props.row.participantCount} Teilnehmer</span>
      </button>

      <button
        className="danger-button"
        type="button"
        disabled={props.disabled}
        onClick={() => props.onDelete(props.row.id)}
      >
        Löschen
      </button>
    </div>
  )
}

import type { SessionSummary } from '../types/api'
import { SessionRow } from './SessionRow'
import './Sessions.css'

type Props = {
  sessions: SessionSummary[]
  disabled: boolean
  onJoin: (sessionId: string) => void
  onDelete: (sessionId: string) => void
}

// Shows the open sessions. The data comes from HomePage (lifting state up),
// because HomePage also needs it to reload the list after a delete.
export function Sessions(props: Props) {
  // "Raw data" -> components. The key must be stable: the session ID.
  const sessionRows = props.sessions.map((session) => (
    <SessionRow
      key={session.id}
      row={session}
      disabled={props.disabled}
      onJoin={props.onJoin}
      onDelete={props.onDelete}
    />
  ))

  return <div className="session-list">{sessionRows}</div>
}

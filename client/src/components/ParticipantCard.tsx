import type { ParticipantView } from '../types/api'
import './ParticipantCard.css'

type Props = {
  participant: ParticipantView
  revealed: boolean
  isCurrentUser: boolean
}

// One participant at the poker table.
export function ParticipantCard(props: Props) {
  let voteText = 'Noch nicht abgestimmt'

  // Before the reveal the server sends no votes, only hasVoted.
  if (props.participant.hasVoted && !props.revealed) {
    voteText = 'Karte gewählt'
  }

  if (props.participant.vote !== null && props.revealed) {
    voteText = props.participant.vote
  }

  return (
    <article className="participant-card">
      <strong>
        {props.participant.name}
        {props.isCurrentUser ? ' (Du)' : ''}
      </strong>
      <span>{voteText}</span>
    </article>
  )
}

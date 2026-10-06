import type { Participant } from "../types";

interface ParticipantCardProps {
  participant: Participant;
  revealed: boolean;
  isCurrentUser: boolean;
}

function ParticipantCard({
  participant,
  revealed,
  isCurrentUser,
}: ParticipantCardProps) {
  let voteText = "Noch nicht abgestimmt";

  if (participant.vote && !revealed) {
    voteText = "Karte gewählt";
  }

  if (participant.vote && revealed) {
    voteText = participant.vote;
  }

  return (
    <article className="participant-card">
      <strong>
        {participant.name}
        {isCurrentUser ? " (Du)" : ""}
      </strong>
      <span>{voteText}</span>
    </article>
  );
}

export default ParticipantCard;

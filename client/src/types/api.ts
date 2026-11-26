// How the server sends the data (see the server README, API overview).

export type DeckId = 'fibonacci' | 'tshirt'

export type SessionSummary = {
  id: string
  participantCount: number
}

export type ParticipantView = {
  id: string
  name: string
  hasVoted: boolean
  // Always null before reveal, even for your own card.
  vote: string | null
}

export type SessionView = {
  id: string
  deck: DeckId
  revealed: boolean
  participants: ParticipantView[]
}

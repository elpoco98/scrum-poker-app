import type { SessionView } from '../types/api'

// Computes the text that is shown after the cards are revealed.
// Derived from the session: no extra state needed.
export function getResultText(session: SessionView): string | null {
  if (!session.revealed) {
    return null
  }

  const votes = session.participants
    .map((participant) => participant.vote)
    .filter((vote): vote is string => vote !== null)

  if (votes.length === 0) {
    return 'Noch keine Schätzungen vorhanden.'
  }

  const isUnanimous =
    votes.length === session.participants.length &&
    votes.every((vote) => vote === votes[0])

  if (isUnanimous) {
    return `Alle sind sich einig: ${votes[0]}`
  }

  if (session.deck === 'fibonacci') {
    return getAverageText(votes)
  }

  return `Häufigste Schätzung: ${getMostCommonVote(votes)}`
}

function getAverageText(votes: string[]): string {
  // "?" is not a number and is not part of the average.
  const numbers = votes.filter((vote) => vote !== '?').map(Number)

  if (numbers.length === 0) {
    return 'Keine numerischen Schätzungen vorhanden.'
  }

  const sum = numbers.reduce((total, value) => total + value, 0)
  const average = sum / numbers.length
  return `Durchschnitt: ${average.toFixed(1)}`
}

// T-shirt sizes have no numeric value, so we show the most common size instead.
function getMostCommonVote(votes: string[]): string {
  const counts = new Map<string, number>()

  for (const vote of votes) {
    counts.set(vote, (counts.get(vote) ?? 0) + 1)
  }

  // Spread into a new array, so sort() does not change anything else.
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return sorted[0][0]
}

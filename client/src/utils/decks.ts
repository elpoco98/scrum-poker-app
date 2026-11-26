import type { DeckId } from '../types/api'

// Same cards as on the server (server/src/decks.ts). Cards are always strings.
export const DECKS: Record<DeckId, string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '?'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL'],
}

export type DeckOption = {
  id: DeckId
  label: string
}

// The decks the user can switch between (one button per entry).
export const DECK_OPTIONS: DeckOption[] = [
  { id: 'fibonacci', label: 'Fibonacci' },
  { id: 'tshirt', label: 'T-Shirt' },
]

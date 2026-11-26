import './PokerCard.css'

type Props = {
  value: string
  selected: boolean
  disabled: boolean
  onClick: () => void
}

// One selectable card. Knows neither the session nor the API.
export function PokerCard(props: Props) {
  return (
    <button
      className={props.selected ? 'poker-card selected' : 'poker-card'}
      disabled={props.disabled}
      onClick={props.onClick}
      type="button"
    >
      {props.value}
    </button>
  )
}

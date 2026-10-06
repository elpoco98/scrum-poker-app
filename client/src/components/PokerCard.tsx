interface PokerCardProps {
  value: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

function PokerCard({ value, selected, disabled, onClick }: PokerCardProps) {
  return (
    <button
      className={selected ? "poker-card selected" : "poker-card"}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {value}
    </button>
  );
}

export default PokerCard;

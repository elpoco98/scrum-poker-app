type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  // Optional: connects the field with a <label htmlFor="...">.
  id?: string
}

// Hides the change event: the parent component gets the text directly.
export function Input(props: Props) {
  return (
    <input
      className="input"
      id={props.id}
      value={props.value}
      placeholder={props.placeholder}
      onChange={(event) => props.onChange(event.target.value)}
    />
  )
}

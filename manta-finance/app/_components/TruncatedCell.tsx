interface TruncatedCellProps {
  text: string
  maxWidth?: string
}

export function TruncatedCell({ text, maxWidth = 'max-w-[180px]' }: TruncatedCellProps) {
  return (
    <span
      className={`block truncate ${maxWidth}`}
      title={text}
    >
      {text}
    </span>
  )
}

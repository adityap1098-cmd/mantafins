'use client'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
}

export default function DatePicker({ value, onChange, label, className }: DatePickerProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500${className ? ` ${className}` : ''}`}
    />
  )
}

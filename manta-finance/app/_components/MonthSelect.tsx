'use client'

interface MonthSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
  required?: boolean
}

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export default function MonthSelect({ value, onChange, className, required }: MonthSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded px-2 py-1 text-sm${className ? ` ${className}` : ''}`}
      required={required}
    >
      <option value="">-- Pilih bulan --</option>
      {MONTHS.map((name, index) => (
        <option key={index + 1} value={String(index + 1)}>
          {name}
        </option>
      ))}
    </select>
  )
}

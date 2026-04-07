'use client'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color?: string; dataKey?: string }>
  label?: string
  formatter?: (value: number) => string
  labelKey?: string
}

function ChartTooltip({ active, payload, label, formatter, labelKey }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const displayLabel = labelKey ?? label ?? (payload[0]?.name ?? '')

  return (
    <div
      style={{
        background: '#1a1d26',
        borderRadius: 10,
        padding: '12px 16px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        minWidth: 140,
      }}
    >
      {displayLabel && (
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            color: '#a0a3b1',
            marginBottom: 6,
            marginTop: 0,
          }}
        >
          {displayLabel}
        </p>
      )}
      {payload.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: index > 0 ? 4 : 0,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: item.color ?? '#6366f1',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 12,
              color: '#ffffff',
              flex: 1,
            }}
          >
            {item.name}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              fontWeight: 600,
              color: '#ffffff',
            }}
          >
            {formatter ? formatter(item.value) : String(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export { ChartTooltip }
export default ChartTooltip

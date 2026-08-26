import { EuiFlexGroup, EuiFlexItem, EuiText, useEuiTheme } from '@elastic/eui'

export interface DonutSlice {
  name: string
  value: string
  share: number
  color: string
}

export function IdleDonut({
  slices,
  center,
  centerLabel = 'Total idle',
  showShare = false,
}: {
  slices: DonutSlice[]
  center: string
  centerLabel?: string
  showShare?: boolean
}) {
  const { euiTheme } = useEuiTheme()
  const radius = 15.9
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <EuiFlexGroup alignItems="center" gutterSize="l">
      <EuiFlexItem grow={false}>
        <div style={{ position: 'relative', width: 144, height: 144 }}>
          <svg viewBox="0 0 42 42" width="144" height="144" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="21"
              cy="21"
              r={radius}
              fill="none"
              stroke={euiTheme.colors.lightShade}
              strokeWidth="5"
            />
            {slices.map((slice) => {
              const length = (slice.share / 100) * circumference
              const dash = `${length} ${circumference - length}`
              const currentOffset = -offset
              offset += length
              return (
                <circle
                  key={slice.name}
                  cx="21"
                  cy="21"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="5"
                  strokeDasharray={dash}
                  strokeDashoffset={currentOffset}
                >
                  <title>
                    {slice.name} — {slice.value}
                  </title>
                </circle>
              )
            })}
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <EuiText size="xs" color="subdued">
              {centerLabel}
            </EuiText>
            <EuiText>
              <strong>{center}</strong>
            </EuiText>
          </div>
        </div>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiFlexGroup direction="column" gutterSize="s">
          {slices.map((slice) => (
            <EuiFlexItem key={slice.name} grow={false}>
              <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
                <EuiFlexItem grow={false}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: slice.color,
                      display: 'inline-block',
                    }}
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiText size="s">{slice.name}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText size="s" color="subdued">
                    <code>
                      {slice.value}
                      {showShare ? ` (${Math.round(slice.share)}%)` : ''}
                    </code>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

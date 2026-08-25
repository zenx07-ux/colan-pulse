import type { ReactNode } from 'react'
import { EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui'

export function PageHeading({
  title,
  description,
  extra,
}: {
  title: string
  description?: string
  extra?: ReactNode
}) {
  return (
    <EuiFlexGroup
      alignItems="center"
      justifyContent="spaceBetween"
      gutterSize="m"
      responsive
      wrap
    >
      <EuiFlexItem>
        <EuiTitle>
          <h1 className="cp-page-title">{title}</h1>
        </EuiTitle>
        {description ? (
          <EuiText size="s" color="subdued">
            {description}
          </EuiText>
        ) : null}
      </EuiFlexItem>
      {extra ? <EuiFlexItem grow={false}>{extra}</EuiFlexItem> : null}
    </EuiFlexGroup>
  )
}

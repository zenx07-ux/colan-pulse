import type { ReactNode } from 'react'

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
    <div className="cp-incident-head">
      <div className="cp-page-lead">
        <h1 className="cp-activity-title">{title}</h1>
        {description ? <div className="cp-card-sub">{description}</div> : null}
      </div>
      {extra ? <div className="cp-incident-head__action">{extra}</div> : null}
    </div>
  )
}

import { initials } from '../utils/format'
import { avatarColor } from '../utils/avatars'

export function PersonCell({
  name,
  index = 0,
  size = 's',
}: {
  name: string
  index?: number
  size?: 's' | 'l'
}) {
  return (
    <div className="cp-person">
      <span
        className={`cp-avatar${size === 'l' ? ' cp-avatar--lg' : ''}`}
        style={{ background: avatarColor(name, index) }}
      >
        {initials(name)}
      </span>
      {size === 's' ? <span className="cp-name">{name}</span> : null}
    </div>
  )
}

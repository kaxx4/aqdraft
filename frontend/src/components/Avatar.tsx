interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Avatar = ({ src, name, size = 'md', className = '' }: AvatarProps) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }

  // Handle undefined/null name
  const safeName = name || 'User'

  // Generate initials
  const initials = safeName
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  // Generate a consistent color based on name
  const colors = [
    '[background-color:var(--accent)]',
    'bg-orange-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-teal-500'
  ]
  const colorIndex = safeName.length % colors.length
  const bgColor = colors[colorIndex]

  // Subtle 1px image outline per Principle 11 — pure-black at low
  // opacity so the avatar's edge reads cleanly against any background
  // (white card, cream feed, dark profile gradient) without picking up
  // a tinted halo. Inset so the outline doesn't expand the visual size.
  const outlineStyle = {
    outline: '1px solid rgba(0, 0, 0, 0.1)',
    outlineOffset: '-1px',
  } as const

  if (src) {
    return (
      <img
        src={src}
        alt={safeName}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
        style={outlineStyle}
        referrerPolicy="no-referrer"
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${className}`}
      style={outlineStyle}
    >
      {initials}
    </div>
  )
}

export default Avatar

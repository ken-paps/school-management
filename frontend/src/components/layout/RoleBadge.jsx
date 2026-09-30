import Badge from '../ui/Badge'

const ROLE_COLORS = {
  admin: 'emerald',
  teacher: 'sky',
  student: 'amber',
}

export default function RoleBadge({ role }) {
  if (!role) return null
  return <Badge color={ROLE_COLORS[role] || 'zinc'}>{role}</Badge>
}

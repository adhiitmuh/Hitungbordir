export default function StatCard({ label, value, sub, icon: Icon, color = 'blue' }) {
  const config = {
    blue:   { bg: 'bg-harmoni-green-tint', icon: 'text-harmoni-green', bar: 'bg-harmoni-green' },
    green:  { bg: 'bg-green-50',   icon: 'text-green-600',  bar: 'bg-green-500' },
    yellow: { bg: 'bg-amber-50',   icon: 'text-amber-600',  bar: 'bg-amber-400' },
    red:    { bg: 'bg-red-50',     icon: 'text-red-500',    bar: 'bg-red-400' },
    purple: { bg: 'bg-purple-50',  icon: 'text-purple-600', bar: 'bg-purple-400' },
  }
  const c = config[color] ?? config.blue

  return (
    <div className="card overflow-hidden relative pl-5">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${c.bar}`} />
      <div className={`inline-flex p-2 rounded-xl ${c.bg} mb-3`}>
        {Icon && <Icon size={17} className={c.icon} />}
      </div>
      <div className="text-2xl font-bold leading-tight" style={{ color: '#282828' }}>{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide mt-1" style={{ color: '#034543', opacity: 0.75 }}>{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

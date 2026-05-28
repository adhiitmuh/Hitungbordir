export default function StatCard({ label, value, sub, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="card flex items-start gap-3">
      {Icon && (
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xs text-gray-500 truncate">{label}</div>
        <div className="text-xl font-bold text-gray-800 leading-tight">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

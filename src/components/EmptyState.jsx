export default function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="text-gray-300 mb-3" />}
      <div className="font-medium text-gray-500">{title}</div>
      {desc && <div className="text-sm text-gray-400 mt-1 max-w-xs">{desc}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

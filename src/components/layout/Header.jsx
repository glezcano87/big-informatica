import { User, Calendar } from 'lucide-react'

export const Header = ({ user }) => {
  const today = new Date().toLocaleDateString('es-AR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6">
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Calendar size={16} />
        {today}
      </div>
      <div className="flex items-center gap-2">
        <User size={18} className="text-gray-400" />
        <span className="text-sm font-medium">{user?.name || 'Usuario'}</span>
      </div>
    </header>
  )
}
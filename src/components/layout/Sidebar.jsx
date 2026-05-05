import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Wrench, CreditCard, Wallet, Settings } from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/productos', icon: Package, label: 'Productos' },
  { path: '/ventas', icon: ShoppingCart, label: 'Ventas' },
  { path: '/servicios', icon: Wrench, label: 'Servicios' },
  { path: '/cobros', icon: CreditCard, label: 'Cobros' },
  { path: '/gastos', icon: Wallet, label: 'Gastos' },
  { path: '/config', icon: Settings, label: 'Configuración' },
]

export const Sidebar = () => {
  const location = useLocation()

  return (
    <aside className="w-60 bg-slate-800 text-white h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">BIG INFORMATICA</h1>
        <p className="text-xs text-slate-400">Sistema Financiero</p>
      </div>
      <nav className="p-2">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
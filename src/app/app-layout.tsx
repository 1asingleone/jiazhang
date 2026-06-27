import { Outlet, NavLink } from 'react-router-dom'
import { CircleDollarSign, BarChart3, Users } from 'lucide-react'

const navItems = [
  { to: '/', label: '记账', icon: CircleDollarSign },
  { to: '/stats', label: '统计', icon: BarChart3 },
  { to: '/family', label: '家庭', icon: Users },
]

export function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-white">
      <main className="flex-1">
        <Outlet />
      </main>
      <nav className="flex items-center justify-around border-t border-slate-200 bg-white py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex flex-col items-center gap-1 text-xs text-slate-400 transition-colors aria-[current=page]:text-blue-600"
          >
            <item.icon className="size-6" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

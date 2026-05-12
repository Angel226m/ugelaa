import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileSpreadsheet, Upload, Settings, Bell, Menu, X, PanelLeftClose, PanelLeft, LogOut as LogOutIcon, ChevronDown, UserCircle, ChevronRight, Shield, HelpCircle, Download } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../App'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', desc: 'Resumen general' },
  { to: '/personal', icon: Users, label: 'Personal', desc: 'Gestión de empleados' },
  { to: '/planillas', icon: FileSpreadsheet, label: 'Planillas', desc: 'Nóminas y pagos' },
  { to: '/importar', icon: Upload, label: 'Importar', desc: 'Importar datos' },
  { to: '/exportar', icon: Download, label: 'Exportar', desc: 'Exportar planillas' },
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) setSidebarVisible(true)
    else setSidebarVisible(false)
  }, [isMobile])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = [
    { id: 1, title: 'Nueva planilla creada', desc: 'Se registró una nueva planilla para Mayo 2026', time: 'Hace 5 min', color: 'bg-cyan-500' },
    { id: 2, title: 'Empleado agregado', desc: 'Juan Pérez fue agregado al sistema', time: 'Hace 1 hora', color: 'bg-emerald-500' },
    { id: 3, title: 'Importación completada', desc: 'Se importaron 45 registros exitosamente', time: 'Hace 3 horas', color: 'bg-amber-500' },
  ]

  const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}')
  const userName = currentUser.nombre || 'Administrador'
  const userEmail = currentUser.email || 'admin@planillas.su'
  const userInitials = userName.split(' ').map((n: string) => n.charAt(0)).join('').substring(0, 2).toUpperCase()

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('isAuthenticated')
    logout()
    navigate('/auth')
  }

  const currentPage = navItems.find(n => window.location.pathname === n.to)?.label || 'Dashboard'

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarVisible && !isMobile && (
        <aside className={`fixed inset-y-0 left-0 z-50 transition-all duration-500 ease-out ${isCollapsed ? 'w-24' : 'w-72'} bg-white/95 backdrop-blur-xl border-r border-slate-200/80 shadow-2xl`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100">
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''}`}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <FileSpreadsheet className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  {!isCollapsed && (
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">Planillas SU</h1>
                      <p className="text-xs text-slate-500">Gestión de Nómina</p>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <button onClick={() => setIsCollapsed(true)} className="p-2.5 rounded-xl transition-all hover:bg-slate-100 text-slate-500">
                    <PanelLeftClose className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {isCollapsed && (
              <div className="p-4 border-b border-slate-100">
                <button onClick={() => setIsCollapsed(false)} className="w-full flex items-center justify-center p-3 rounded-xl transition-all hover:bg-slate-100 text-slate-500">
                  <PanelLeft className="w-5 h-5" />
                </button>
              </div>
            )}

            <nav className={`flex-1 p-4 space-y-1.5 overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'text-slate-600 hover:bg-slate-100'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-100'} group-hover:scale-105 transition-transform`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.label}</p>
                          <p className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{item.desc}</p>
                        </div>
                      )}
                      {!isCollapsed && isActive && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}

              <NavLink
                to="/configuracion"
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 mt-3 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                      : 'text-slate-600 hover:bg-slate-100'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
              >
                <div className="p-2.5 rounded-xl flex-shrink-0 bg-slate-100">
                  <Settings className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Configuración</p>
                    <p className="text-xs text-slate-400">Ajustes del sistema</p>
                  </div>
                )}
              </NavLink>
            </nav>

            <div className="p-4 border-t border-slate-100">
              <div className="rounded-2xl p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {userInitials}
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                      <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600"
                >
                  <LogOutIcon className="w-4 h-4" />
                  {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {sidebarVisible && isMobile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setSidebarVisible(false)}>
          <aside className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileSpreadsheet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">Planillas SU</h1>
                    <p className="text-xs text-slate-500">Gestión de Nómina</p>
                  </div>
                </div>
                <button onClick={() => setSidebarVisible(false)} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarVisible(false)}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`
                    }
                  >
                    <div className="p-2.5 rounded-xl flex-shrink-0 bg-slate-100">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </NavLink>
                ))}
                <NavLink
                  to="/configuracion"
                  onClick={() => setSidebarVisible(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <div className="p-2.5 rounded-xl flex-shrink-0 bg-slate-100">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Configuración</p>
                    <p className="text-xs text-slate-400">Ajustes del sistema</p>
                  </div>
                </NavLink>
              </nav>

              <div className="p-4 border-t border-slate-100">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all text-red-600 hover:bg-red-50">
                  <LogOutIcon className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm">Cerrar Sesión</p>
                    <p className="text-xs text-slate-500">Salir del sistema</p>
                  </div>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className={`transition-all duration-300 ${!isMobile && !sidebarVisible ? 'lg:ml-0' : !isMobile ? (isCollapsed ? 'lg:ml-24' : 'lg:ml-72') : ''}`}>
        <header className="sticky top-0 z-30 backdrop-blur-2xl border-b transition-all duration-500 bg-white/80 border-slate-200/50 shadow-lg shadow-slate-900/5">
          <div className="flex items-center justify-between px-6 lg:px-8 h-18">
            <div className="flex items-center gap-4">
              {!sidebarVisible && !isMobile && (
                <button onClick={() => setSidebarVisible(true)} className="p-2.5 rounded-xl transition-all hover:bg-slate-100 text-slate-600" title="Abrir menú">
                  <Menu className="w-5 h-5" />
                </button>
              )}
              {isMobile && (
                <button onClick={() => setSidebarVisible(true)} className="p-2.5 rounded-xl lg:hidden transition-all hover:bg-slate-100 text-slate-600">
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div className="hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{currentPage}</h2>
                    <p className="text-xs text-slate-500">
                      {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2.5 rounded-xl transition-all hover:bg-slate-100 text-slate-500">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-3 w-96 rounded-2xl shadow-2xl border overflow-hidden z-50 bg-white border-slate-100">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <h3 className="font-bold text-base text-slate-900">Notificaciones</h3>
                      <p className="text-sm text-slate-500">{notifications.length} notificaciones sin leer</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="flex items-start gap-4 p-5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors">
                          <div className={`w-12 h-12 ${n.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Bell className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                            <p className="text-sm text-slate-500 mt-1">{n.desc}</p>
                            <p className="text-xs text-cyan-500 mt-2 font-medium">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-4 bg-slate-50 text-center">
                      <button className="text-sm text-cyan-600 font-semibold hover:underline">Ver todas las notificaciones</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-3 pl-2 rounded-2xl py-2 pr-3 transition-all hover:bg-slate-50">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {userInitials}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500">Administrador</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl shadow-2xl border overflow-hidden z-50 bg-white border-slate-100">
                    <div className="px-5 py-4 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{userName}</p>
                      <p className="text-sm text-slate-500">{userEmail}</p>
                    </div>
                    <div className="py-2">
                      {[
                        { icon: UserCircle, label: 'Mi Perfil' },
                        { icon: Settings, label: 'Configuración' },
                        { icon: Shield, label: 'Seguridad' },
                        { icon: HelpCircle, label: 'Ayuda' },
                      ].map((item, i) => (
                        <button key={i} className="w-full flex items-center gap-3 px-5 py-3 transition-all text-slate-600 hover:bg-slate-50">
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-100">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 transition-all">
                        <LogOutIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">Cerrar Sesión</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
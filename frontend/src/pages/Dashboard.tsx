import { useEffect, useState } from 'react'
import { dashboardApi } from '../services/api'
import { Link } from 'react-router-dom'
import { Users, FileSpreadsheet, Calendar, ArrowRight, Activity, Clock, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Target, Award, Zap } from 'lucide-react'

interface Resumen {
  total_personal: number
  total_planillas: number
  total_haberes: number
  total_descuentos: number
  total_liquido: number
  planillas_mes: any[]
}

export default function Dashboard() {
  const [data, setData] = useState<Resumen | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getResumen()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-cyan-600">Panel de Control</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Bienvenido de nuevo</h2>
            <p className="text-slate-500 mt-1">Resumen de tu sistema de nóminas</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, key) => (
            <div key={key} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-20 bg-slate-100 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
              </div>
              <div className="h-3 w-32 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100">
            <div className="h-6 w-40 bg-slate-100 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-24 bg-slate-100 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100">
              <div className="h-5 w-32 bg-slate-100 rounded animate-pulse mb-4"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-2xl mb-3 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentMonth = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' }).toUpperCase()

  const stats = [
    { 
      label: 'Total Personal', 
      value: data?.total_personal || 0, 
      icon: Users, 
      color: 'from-cyan-500 to-blue-500',
      trend: '+12%',
      trendUp: true,
      link: '/personal'
    },
    { 
      label: 'Planillas Creadas', 
      value: data?.total_planillas || 0, 
      icon: FileSpreadsheet, 
      color: 'from-violet-500 to-purple-500',
      trend: '+8%',
      trendUp: true,
      link: '/planillas'
    },
    { 
      label: 'Total Haberes', 
      value: formatCurrency(data?.total_haberes || 0), 
      icon: TrendingUp, 
      color: 'from-emerald-500 to-teal-500',
      trend: '+15%',
      trendUp: true
    },
    { 
      label: 'Total Descuentos', 
      value: formatCurrency(data?.total_descuentos || 0), 
      icon: TrendingDown, 
      color: 'from-rose-500 to-red-500',
      trend: '-3%',
      trendUp: false
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-cyan-600">Panel de Control</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Bienvenido de nuevo</h2>
          <p className="text-slate-500 mt-1">Resumen de tu sistema de nóminas</p>
        </div>
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${document.body.classList.contains('dark') ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} shadow-sm`}>
          <div className={`w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center`}>
            <Calendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase ${document.body.classList.contains('dark') ? 'text-slate-500' : 'text-slate-400'}`}>Fecha actual</p>
            <p className={`text-base font-bold ${document.body.classList.contains('dark') ? 'text-white' : 'text-slate-900'}`}>{currentMonth}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link
            key={idx}
            to={stat.link || '#'}
            className={`group relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${document.body.classList.contains('dark') ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</p>
              {stat.trend && (
                <div className={`flex items-center gap-1.5 ${stat.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="text-xs font-semibold">{stat.trend} vs mes anterior</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Planillas del Mes</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{data?.planillas_mes?.length || 0} registros</p>
              </div>
            </div>
            <Link to="/planillas" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {data?.planillas_mes && data.planillas_mes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-xs font-semibold uppercase tracking-wider ${document.body.classList.contains('dark') ? 'text-slate-500' : 'text-slate-400'}`}>
                    <th className="text-left py-3 px-4">Empleado</th>
                    <th className="text-left py-3 px-4">DNI</th>
                    <th className="text-right py-3 px-4">Haberes</th>
                    <th className="text-right py-3 px-4">Descuentos</th>
                    <th className="text-right py-3 px-4">Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {data.planillas_mes.slice(0, 6).map((p: any) => (
                    <tr key={p.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow">
                            {p.personal?.nombres?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{p.personal?.apellidos} {p.personal?.nombres}</p>
                            <p className={`text-xs text-slate-500 dark:text-slate-400`}>{p.personal?.puesto || 'Sin puesto'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">{p.personal?.dni || '-'}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.total_haberes)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-red-500 dark:text-red-400">{formatCurrency(p.total_descuentos)}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm shadow-md">
                          {formatCurrency(p.total_liquido)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sin planillas registradas</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Importa un archivo Excel o crea una planilla manualmente</p>
              <Link to="/importar" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl transition-all">
                <span>Importar Planilla</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Nuevo Empleado', icon: Users, color: 'from-cyan-500 to-blue-500', link: '/personal' },
                { label: 'Crear Planilla', icon: FileSpreadsheet, color: 'from-violet-500 to-purple-500', link: '/planillas' },
                { label: 'Importar Excel', icon: Activity, color: 'from-emerald-500 to-teal-500', link: '/importar' },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform shadow-lg`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex-1">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl dark:shadow-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Resumen del Mes</h3>
                <p className="text-white/70 text-sm">{currentMonth}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-white/10 rounded-xl">
                <span className="text-white/80">Pago Líquido Total</span>
                <span className="font-bold text-xl">{formatCurrency(data?.total_liquido || 0)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold">{data?.total_personal || 0}</p>
                  <p className="text-xs text-white/70">Empleados</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold">{data?.total_planillas || 0}</p>
                  <p className="text-xs text-white/70">Planillas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Metas del Mes</h4>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Planillas completadas</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{data?.planillas_mes?.length || 0}/50</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${Math.min(((data?.planillas_mes?.length || 0) / 50) * 100, 100)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Personal registrado</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{data?.total_personal || 0}/30</span>
              </div>
              <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${Math.min(((data?.total_personal || 0) / 30) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Resumen Financiero</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Total Haberes</span>
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(data?.total_haberes || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">Total Descuentos</span>
              </div>
              <span className="font-bold text-red-700 dark:text-red-400">{formatCurrency(data?.total_descuentos || 0)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm font-medium text-cyan-700 dark:text-cyan-400">Líquido a Pagar</span>
              </div>
              <span className="font-bold text-cyan-700 dark:text-cyan-400">{formatCurrency(data?.total_liquido || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white">Actividad Reciente</h4>
          </div>
          <div className="space-y-4">
            {[
              { desc: 'Planilla creada para Mayo 2026', time: 'Hace 5 min', color: 'bg-cyan-500' },
              { desc: 'Empleado agregado: Juan Pérez', time: 'Hace 1 hora', color: 'bg-emerald-500' },
              { desc: 'Importación completada', time: 'Hace 3 horas', color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 ${item.color} rounded-full mt-1.5 flex-shrink-0`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.desc}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}
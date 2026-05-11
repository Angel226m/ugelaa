import { useEffect, useState } from 'react'
import { personalApi } from '../services/api'
import { Search, Plus, Pencil, Trash2, X, User, Briefcase, Hash, Building, Tag, CheckCircle, XCircle, UserCheck, Users, ChevronLeft, ChevronRight, Filter, ArrowUpDown, SlidersHorizontal } from 'lucide-react'

interface Personal {
  id: number
  dni: string
  nombres: string
  apellidos: string
  puesto: string
  rd: string
  uu: string
  activo: boolean
}

interface PaginationData {
  data: Personal[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export default function Personal() {
  const [personal, setPersonal] = useState<Personal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'apellidos' | 'nombres' | 'dni' | 'created_at'>('apellidos')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Personal | null>(null)
  const [form, setForm] = useState({ dni: '', nombres: '', apellidos: '', puesto: '', rd: '', uu: '', activo: true })
  const [errors, setErrors] = useState<{ nombres?: string; apellidos?: string }>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    loadPersonal()
  }, [debouncedSearch, page, filterStatus, sortBy, sortOrder])

  const loadPersonal = () => {
    setLoading(true)
    personalApi.list(debouncedSearch, page, 20, sortBy, sortOrder, filterStatus === 'all' ? undefined : filterStatus === 'active')
      .then((res: { data: PaginationData }) => {
        setPersonal(res.data.data)
        setTotal(res.data.total)
        setTotalPages(res.data.total_pages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleSort = (field: 'apellidos' | 'nombres' | 'dni' | 'created_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return sortOrder === 'asc' ? <span className="text-xs font-bold text-cyan-500">↑</span> : <span className="text-xs font-bold text-cyan-500">↓</span>
  }

  

  const validateForm = () => {
    const newErrors: { nombres?: string; apellidos?: string } = {}
    if (!form.nombres.trim()) newErrors.nombres = 'El nombre es requerido'
    if (!form.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (editing) {
        await personalApi.update(editing.id, form)
      } else {
        await personalApi.create(form)
      }
      setShowModal(false)
      setEditing(null)
      setForm({ dni: '', nombres: '', apellidos: '', puesto: '', rd: '', uu: '', activo: true })
      setErrors({})
      loadPersonal()
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (p: Personal) => {
    setEditing(p)
    setForm({
      dni: p.dni || '',
      nombres: p.nombres,
      apellidos: p.apellidos,
      puesto: p.puesto || '',
      rd: p.rd || '',
      uu: p.uu || '',
      activo: p.activo
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar este empleado?')) {
      try {
        await personalApi.delete(id)
        loadPersonal()
      } catch (error) {
        console.error(error)
      }
    }
  }

  const toggleActivo = async (p: Personal) => {
    await personalApi.update(p.id, { activo: !p.activo })
    loadPersonal()
  }

  const activeCount = personal.filter(p => p.activo).length

  const getPaginationRange = () => {
    const range: number[] = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">Gestión de Empleados</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Personal</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Administra los empleados de tu organización</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setForm({ dni: '', nombres: '', apellidos: '', puesto: '', rd: '', uu: '', activo: true })
            setErrors({})
            setShowModal(true)
          }}
          className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Empleado</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Empleados</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{total}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Activos</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{activeCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Inactivos</p>
              <p className="text-3xl font-bold text-slate-400 dark:text-slate-500 mt-2">{total - activeCount}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg">
              <XCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  className="pl-12 pr-10 py-3 w-72 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-600 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                  showFilters 
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' 
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtros</span>
              </button>

              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1.5">
                {[
                  { key: 'all', label: 'Todos', count: total },
                  { key: 'active', label: 'Activos', count: activeCount, color: 'emerald' },
                  { key: 'inactive', label: 'Inactivos', count: total - activeCount, color: 'slate' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => { setFilterStatus(f.key as any); setPage(1) }}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                      filterStatus === f.key
                        ? f.color === 'emerald' ? 'bg-emerald-500 text-white shadow-sm'
                          : f.color === 'slate' ? 'bg-slate-500 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                    <span className={`px-2 py-0.5 rounded text-xs ${filterStatus === f.key ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-')
                    setSortBy(field as any)
                    setSortOrder(order as any)
                    setPage(1)
                  }}
                  className="bg-transparent text-sm font-medium text-slate-600 dark:text-slate-300 focus:outline-none"
                >
                  <option value="apellidos-asc">Apellidos A-Z</option>
                  <option value="apellidos-desc">Apellidos Z-A</option>
                  <option value="nombres-asc">Nombres A-Z</option>
                  <option value="nombres-desc">Nombres Z-A</option>
                  <option value="dni-asc">DNI ↑</option>
                  <option value="dni-desc">DNI ↓</option>
                  <option value="created_at-desc">Más recientes</option>
                  <option value="created_at-asc">Más antiguos</option>
                </select>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-sm">
                {total} empleados
              </span>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Ordenar por</label>
                  <div className="flex gap-2">
                    {['apellidos', 'nombres', 'dni', 'created_at'].map(field => (
                      <button
                        key={field}
                        onClick={() => handleSort(field as any)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                          sortBy === field
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {field === 'created_at' ? 'Fecha' : field.charAt(0).toUpperCase() + field.slice(1)}
                        {getSortIcon(field)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                <div className="w-14 h-14 bg-slate-200 dark:bg-slate-600 rounded-xl animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-32 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : personal.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hay empleados</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Comienza agregando tu primer empleado</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg">
              <Plus className="w-5 h-5" />
              <span>Agregar Empleado</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left py-4 px-6">
                    <button onClick={() => handleSort('apellidos')} className="flex items-center gap-1 hover:text-cyan-500 transition-colors">
                      Empleado {getSortIcon('apellidos')}
                    </button>
                  </th>
                  <th className="text-left py-4 px-4">
                    <button onClick={() => handleSort('dni')} className="flex items-center gap-1 hover:text-cyan-500 transition-colors">
                      DNI {getSortIcon('dni')}
                    </button>
                  </th>
                  <th className="text-left py-4 px-4">Puesto</th>
                  <th className="text-left py-4 px-4">RD</th>
                  <th className="text-left py-4 px-4">UU</th>
                  <th className="text-left py-4 px-4">Estado</th>
                  <th className="text-right py-4 px-6">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personal.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow">
                          {p.nombres?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{p.apellidos} {p.nombres}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{p.puesto || 'Sin puesto'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300">{p.dni || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{p.puesto || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded dark:text-slate-400">{p.rd || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded dark:text-slate-400">{p.uu || '-'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleActivo(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          p.activo
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {p.activo ? <><CheckCircle className="w-3.5 h-3.5" /> Activo</> : <><XCircle className="w-3.5 h-3.5" /> Inactivo</>}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(p)} className="p-2 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 transition-all" title="Editar">
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-all" title="Eliminar">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Mostrando <span className="font-semibold text-slate-700 dark:text-slate-300">{(page - 1) * 20 + 1}</span> - <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(page * 20, total)}</span> de <span className="font-semibold text-cyan-600 dark:text-cyan-400">{total}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 transition-all">
                    <ChevronLeft className="w-4 h-4" /><ChevronLeft className="w-3 h-3 -ml-2" />
                  </button>
                  {getPaginationRange().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                        page === pageNum
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 bg-gradient-to-r from-cyan-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    {editing ? <Pencil className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{editing ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
                    <p className="text-white/70 text-sm">{editing ? 'Actualiza los datos' : 'Completa los datos del empleado'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Hash className="w-4 h-4 inline mr-1" /> DNI
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={form.dni}
                    onChange={e => setForm({ ...form, dni: e.target.value })}
                    placeholder="12345678"
                    maxLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" /> Puesto
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={form.puesto}
                    onChange={e => setForm({ ...form, puesto: e.target.value })}
                    placeholder="Puesto laboral"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" /> Nombres *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border-2 ${errors.nombres ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600'} rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                  value={form.nombres}
                  onChange={e => { setForm({ ...form, nombres: e.target.value }); if (errors.nombres) setErrors({ ...errors, nombres: undefined }) }}
                  placeholder="Nombres completos"
                />
                {errors.nombres && <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">{errors.nombres}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" /> Apellidos *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border-2 ${errors.apellidos ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600'} rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                  value={form.apellidos}
                  onChange={e => { setForm({ ...form, apellidos: e.target.value }); if (errors.apellidos) setErrors({ ...errors, apellidos: undefined }) }}
                  placeholder="Apellidos completos"
                />
                {errors.apellidos && <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">{errors.apellidos}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" /> RD
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={form.rd}
                    onChange={e => setForm({ ...form, rd: e.target.value })}
                    placeholder="RD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Building className="w-4 h-4 inline mr-1" /> UU
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={form.uu}
                    onChange={e => setForm({ ...form, uu: e.target.value })}
                    placeholder="UU"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={form.activo}
                    onChange={e => setForm({ ...form, activo: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-cyan-600 dark:border-slate-500 dark:bg-slate-600"
                  />
                  <label htmlFor="activo" className="text-sm font-medium text-slate-700 dark:text-slate-300">Empleado activo</label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                  {editing ? 'Actualizar' : 'Crear Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
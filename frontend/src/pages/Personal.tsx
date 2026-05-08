import { useEffect, useState } from 'react'
import { personalApi } from '../services/api'
import { Search, Plus, Pencil, Trash2, X, User, Briefcase, Hash, Building, Tag, CheckCircle, XCircle, UserCheck, Users, ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Personal | null>(null)
  const [form, setForm] = useState({ dni: '', nombres: '', apellidos: '', puesto: '', rd: '', uu: '', activo: true })
  const [errors, setErrors] = useState<{ nombres?: string; apellidos?: string }>({})

  useEffect(() => {
    loadPersonal()
  }, [search, page])

  const loadPersonal = () => {
    setLoading(true)
    personalApi.list(search, page, 20)
      .then((res: { data: PaginationData }) => {
        setPersonal(res.data.data)
        setTotal(res.data.total)
        setTotalPages(res.data.total_pages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
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
      await personalApi.delete(id)
      loadPersonal()
    }
  }

  const toggleActivo = async (p: Personal) => {
    await personalApi.update(p.id, { activo: !p.activo })
    loadPersonal()
  }

  const activeCount = personal.filter(p => p.activo).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-600">Gestión de Empleados</span>
          </div>
          <h2 className="page-title">Personal</h2>
          <p className="text-slate-500 mt-1">Administra los empleados de tu organización</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setForm({ dni: '', nombres: '', apellidos: '', puesto: '', rd: '', uu: '', activo: true })
            setErrors({})
            setShowModal(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Empleado
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Total</p>
              <p className="stat-value mt-1">{personal.length}</p>
            </div>
            <div className="stat-icon bg-gradient-to-br from-cyan-400 to-blue-500">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Activos</p>
              <p className="stat-value mt-1 text-emerald-600">{activeCount}</p>
            </div>
            <div className="stat-icon bg-gradient-to-br from-emerald-400 to-teal-500">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="stat-label">Inactivos</p>
              <p className="stat-value mt-1 text-slate-400">{personal.length - activeCount}</p>
            </div>
            <div className="stat-icon bg-gradient-to-br from-slate-400 to-slate-500">
              <XCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                className="input pl-10 pr-8 w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'active' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Activos
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'inactive' ? 'bg-slate-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Inactivos
              </button>
            </div>
          </div>
          <span className="count-badge">{total} empleados</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="skeleton w-64 h-10 rounded-xl"></div>
                <div className="skeleton w-24 h-10 rounded-xl"></div>
              </div>
              <div className="skeleton w-28 h-8 rounded-lg"></div>
            </div>
            <div className="skeleton-card rounded-xl">
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-row">
                    <div className="skeleton skeleton-avatar"></div>
                    <div className="flex-1">
                      <div className="skeleton skeleton-text w-48"></div>
                      <div className="skeleton skeleton-text w-24"></div>
                    </div>
                    <div className="skeleton skeleton-text w-20"></div>
                    <div className="skeleton skeleton-text w-16"></div>
                    <div className="skeleton skeleton-text w-16"></div>
                    <div className="skeleton w-16 h-6 rounded-full"></div>
                    <div className="skeleton w-16 h-8 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : personal.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <User className="w-7 h-7 text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No hay empleados</h3>
            <p className="text-slate-500 mb-5">Comienza agregando tu primer empleado</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">Agregar Empleado</button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="rounded-tl-xl">Empleado</th>
                  <th>DNI</th>
                  <th>Puesto</th>
                  <th>RD</th>
                  <th>UU</th>
                  <th>Estado</th>
                  <th className="text-right rounded-tr-xl">Acción</th>
                </tr>
              </thead>
              <tbody>
                {personal.map(p => (
                  <tr key={p.id} className="hover-lift transition-smooth cursor-pointer">
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-blue hover-scale transition-smooth">
                          {p.nombres?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{p.apellidos} {p.nombres}</p>
                          <p className="text-[10px] text-slate-500">{p.puesto || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 transition-smooth">{p.dni || '-'}</span>
                    </td>
                    <td>
                      <span className="text-slate-600 text-xs">{p.puesto || '-'}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded hover:bg-slate-100 transition-smooth">{p.rd || '-'}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded hover:bg-slate-100 transition-smooth">{p.uu || '-'}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActivo(p)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                          p.activo
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover-scale'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover-scale'
                        }`}
                      >
                        {p.activo ? <><CheckCircle className="w-3 h-3" /> Activo</> : <><XCircle className="w-3 h-3" /> Inactivo</>}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-cyan-50 text-cyan-600 transition-all hover-scale" title="Editar">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all hover-scale" title="Eliminar">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Mostrando {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} de {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          page === pageNum
                            ? 'bg-cyan-500 text-white'
                            : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-cyan-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    {editing ? <Pencil className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editing ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </h3>
                    <p className="text-white/70 text-[10px]">{editing ? 'Actualiza los datos' : 'Completa los datos'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-cyan-500" /> DNI
                  </label>
                  <input
                    type="text"
                    className="input text-sm py-1.5"
                    value={form.dni}
                    onChange={e => setForm({ ...form, dni: e.target.value })}
                    placeholder="12345678"
                    maxLength={8}
                  />
                </div>
                <div>
                  <label className="label text-xs mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-cyan-500" /> Puesto
                  </label>
                  <input
                    type="text"
                    className="input text-sm py-1.5"
                    value={form.puesto}
                    onChange={e => setForm({ ...form, puesto: e.target.value })}
                    placeholder="Puesto"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-500" /> Nombres *
                </label>
                <input
                  type="text"
                  className={`input text-sm py-1.5 ${errors.nombres ? 'form-error' : ''}`}
                  value={form.nombres}
                  onChange={e => {
                    setForm({ ...form, nombres: e.target.value })
                    if (errors.nombres) setErrors({ ...errors, nombres: undefined })
                  }}
                  placeholder="Nombres"
                />
                {errors.nombres && <p className="error-text">{errors.nombres}</p>}
              </div>

              <div>
                <label className="label text-xs mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-500" /> Apellidos *
                </label>
                <input
                  type="text"
                  className={`input text-sm py-1.5 ${errors.apellidos ? 'form-error' : ''}`}
                  value={form.apellidos}
                  onChange={e => {
                    setForm({ ...form, apellidos: e.target.value })
                    if (errors.apellidos) setErrors({ ...errors, apellidos: undefined })
                  }}
                  placeholder="Apellidos"
                />
                {errors.apellidos && <p className="error-text">{errors.apellidos}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label text-xs mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-cyan-500" /> RD
                  </label>
                  <input
                    type="text"
                    className="input text-sm py-1.5"
                    value={form.rd}
                    onChange={e => setForm({ ...form, rd: e.target.value })}
                    placeholder="RD"
                  />
                </div>
                <div>
                  <label className="label text-xs mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3 text-cyan-500" /> UU
                  </label>
                  <input
                    type="text"
                    className="input text-sm py-1.5"
                    value={form.uu}
                    onChange={e => setForm({ ...form, uu: e.target.value })}
                    placeholder="UU"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={form.activo}
                    onChange={e => setForm({ ...form, activo: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-cyan-600"
                  />
                  <label htmlFor="activo" className="text-xs font-medium text-slate-700">
                    Empleado activo
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary py-1.5 px-3 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary py-1.5 px-4 text-sm">
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
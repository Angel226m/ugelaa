import { useEffect, useState } from 'react'
import { planillasApi, personalApi } from '../services/api'
import { Plus, Trash2, X, Eye, FileSpreadsheet, DollarSign, ArrowDownToLine, ArrowUpFromLine, User, Calendar, Download, ChevronLeft, ChevronRight, Search, Loader2, Pencil } from 'lucide-react'

interface Personal {
  id: number
  dni: string
  nombres: string
  apellidos: string
  puesto?: string
}

interface Planilla {
  id: number
  personal_id: number
  personal: Personal
  mes: number
  anio: number
  total_haberes: number
  total_descuentos: number
  total_liquido: number
}

interface Ingreso {
  id: number
  tipo: string
  monto: number
}

interface Descuento {
  id: number
  tipo: string
  monto: number
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const ANIOS = Array.from({ length: new Date().getFullYear() - 1990 }, (_, i) => 1991 + i).reverse()

export default function Planillas() {
  const [planillas, setPlanillas] = useState<Planilla[]>([])
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1)
  const [anio, setAnio] = useState<number>(new Date().getFullYear())
  const [showModal, setShowModal] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailPlanilla, setDetailPlanilla] = useState<any>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editPlanilla, setEditPlanilla] = useState<any>(null)
  const [form, setForm] = useState({ personal_id: 0, mes: mes, anio: anio })
  const [ingresoForm, setIngresoForm] = useState({ tipo: '', monto: '' })
  const [descuentoForm, setDescuentoForm] = useState({ tipo: '', monto: '' })
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  const [searchEmpleado, setSearchEmpleado] = useState('')
  const [searchResults, setSearchResults] = useState<Personal[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showNewEmpleado, setShowNewEmpleado] = useState(false)
  const [newEmpleadoForm, setNewEmpleadoForm] = useState({ dni: '', nombres: '', apellidos: '' })

  useEffect(() => {
    loadData()
  }, [mes, anio, page, searchTerm])

  const loadData = () => {
    setLoading(true)
    const searchMode = searchTerm.trim().length > 0
    planillasApi.list(
      searchMode ? undefined : mes,
      searchMode ? undefined : anio,
      page,
      20,
      searchTerm || undefined
    )
      .then((res: { data: { data: Planilla[], total: number, total_pages: number } }) => {
        setPlanillas(res.data.data)
        setTotal(res.data.total)
        setTotalPages(res.data.total_pages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const searchEmpleados = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await personalApi.buscar(query)
      setSearchResults(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
    setSearching(false)
  }

  const selectEmpleado = (p: Personal) => {
    setForm({ ...form, personal_id: p.id })
    setSearchEmpleado(`${p.apellidos} ${p.nombres} ${p.dni ? `(${p.dni})` : ''}`)
    setShowSearchResults(false)
  }

  const createAndSelectEmpleado = async () => {
    if (!newEmpleadoForm.nombres.trim() || !newEmpleadoForm.apellidos.trim()) {
      return
    }
    try {
      const res = await personalApi.create({ ...newEmpleadoForm, activo: true })
      const created = res.data
      setForm({ ...form, personal_id: created.id })
      setSearchEmpleado(`${created.apellidos} ${created.nombres} ${created.dni ? `(${created.dni})` : ''}`)
      setShowNewEmpleado(false)
      setNewEmpleadoForm({ dni: '', nombres: '', apellidos: '' })
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.personal_id) {
      setError('Selecciona un empleado')
      return
    }

    try {
      await planillasApi.create(form)
      setShowModal(false)
      setForm({ personal_id: 0, mes, anio })
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta planilla?')) {
      await planillasApi.delete(id)
      loadData()
    }
  }

  const handleEdit = async (id: number) => {
    const res = await planillasApi.get(id)
    setEditPlanilla(res.data)
    setShowEdit(true)
  }

  const saveEdit = async () => {
    if (!editPlanilla) return
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/planillas/${editPlanilla.id}/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal_id: editPlanilla.personal_id,
          mes: editPlanilla.mes,
          anio: editPlanilla.anio,
          ingresos: editPlanilla.ingresos,
          descuentos: editPlanilla.descuentos
        })
      })
      setShowEdit(false)
      setEditPlanilla(null)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al guardar')
    }
  }

  const deleteIngresoEdit = (id: number) => {
    if (!editPlanilla) return
    setEditPlanilla({
      ...editPlanilla,
      ingresos: editPlanilla.ingresos.filter((i: any) => i.id !== id)
    })
  }

  const deleteDescuentoEdit = (id: number) => {
    if (!editPlanilla) return
    setEditPlanilla({
      ...editPlanilla,
      descuentos: editPlanilla.descuentos.filter((d: any) => d.id !== id)
    })
  }

  const addIngresoEdit = () => {
    if (!editPlanilla) return
    setEditPlanilla({
      ...editPlanilla,
      ingresos: [...editPlanilla.ingresos, { id: 0, tipo: '', monto: 0 }]
    })
  }

  const addDescuentoEdit = () => {
    if (!editPlanilla) return
    setEditPlanilla({
      ...editPlanilla,
      descuentos: [...editPlanilla.descuentos, { id: 0, tipo: '', monto: 0 }]
    })
  }

  const viewDetail = async (id: number) => {
    const res = await planillasApi.get(id)
    setDetailPlanilla(res.data)
    setShowDetail(true)
  }

  const addIngreso = async () => {
    if (!detailPlanilla || !ingresoForm.tipo || !ingresoForm.monto) return
    const monto = parseFloat(ingresoForm.monto)
    if (isNaN(monto) || monto <= 0) return

    await fetch(`${import.meta.env.VITE_API_URL}/api/ingresos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planilla_id: detailPlanilla.id, tipo: ingresoForm.tipo, monto })
    })
    const res = await planillasApi.get(detailPlanilla.id)
    setDetailPlanilla(res.data)
    setIngresoForm({ tipo: '', monto: '' })
  }

  const addDescuento = async () => {
    if (!detailPlanilla || !descuentoForm.tipo || !descuentoForm.monto) return
    const monto = parseFloat(descuentoForm.monto)
    if (isNaN(monto) || monto <= 0) return

    await fetch(`${import.meta.env.VITE_API_URL}/api/descuentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planilla_id: detailPlanilla.id, tipo: descuentoForm.tipo, monto })
    })
    const res = await planillasApi.get(detailPlanilla.id)
    setDetailPlanilla(res.data)
    setDescuentoForm({ tipo: '', monto: '' })
  }

  const deleteIngreso = async (id: number) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/ingresos/${id}`, { method: 'DELETE' })
    const res = await planillasApi.get(detailPlanilla.id)
    setDetailPlanilla(res.data)
  }

  const deleteDescuento = async (id: number) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/descuentos/${id}`, { method: 'DELETE' })
    const res = await planillasApi.get(detailPlanilla.id)
    setDetailPlanilla(res.data)
  }

  const totalHaberes = planillas.reduce((acc, p) => acc + p.total_haberes, 0)
  const totalDescuentos = planillas.reduce((acc, p) => acc + p.total_descuentos, 0)
  const totalLiquido = planillas.reduce((acc, p) => acc + p.total_liquido, 0)

  const currentPeriod = `${MESES[mes - 1]} ${anio}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-600">Gestión de Nóminas</span>
          </div>
          <h2 className="page-title">Planillas</h2>
          <p className="text-slate-500 mt-1">Administra las nóminas de tu personal</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Planilla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Total Haberes</span>
              <div className="p-2 bg-white/20 rounded-xl">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalHaberes)}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 bg-white/20 rounded-lg text-xs font-medium">
                {planillas.length} planillas
              </span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-rose-500/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-rose-100 text-xs font-semibold uppercase tracking-wider">Total Descuentos</span>
              <div className="p-2 bg-white/20 rounded-xl">
                <ArrowUpFromLine className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalDescuentos)}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 bg-white/20 rounded-lg text-xs font-medium">
                DL20530, AFP, Otros
              </span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">Pago Líquido</span>
              <div className="p-2 bg-white/20 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalLiquido)}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 bg-white/20 rounded-lg text-xs font-medium">
                Total a pagar
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1.5 border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500 ml-1" />
              <select 
                className="input py-1.5 px-2 w-28 bg-transparent border-0 text-sm font-medium" 
                value={mes} 
                onChange={e => { setMes(Number(e.target.value)); setPage(1) }}
              >
                {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <span className="text-slate-400">|</span>
              <select 
                className="input py-1.5 px-2 w-20 bg-transparent border-0 text-sm font-medium" 
                value={anio} 
                onChange={e => { setAnio(Number(e.target.value)); setPage(1) }}
              >
                {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar empleado..."
                className="input py-2 pl-9 pr-8 text-sm w-full"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setPage(1) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">{total} planillas</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-2 py-2.5 px-4">
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="skeleton w-28 h-8 rounded-lg"></div>
                <div className="skeleton w-20 h-8 rounded-lg"></div>
              </div>
              <div className="flex gap-2">
                <div className="skeleton w-24 h-10 rounded-xl"></div>
                <div className="skeleton w-24 h-10 rounded-xl"></div>
              </div>
            </div>
            <div className="skeleton-card rounded-xl">
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton-row">
                    <div className="skeleton skeleton-avatar"></div>
                    <div className="flex-1">
                      <div className="skeleton skeleton-text w-48"></div>
                      <div className="skeleton skeleton-text w-24"></div>
                    </div>
                    <div className="skeleton skeleton-text w-20"></div>
                    <div className="skeleton skeleton-text w-20"></div>
                    <div className="skeleton skeleton-text w-24"></div>
                    <div className="skeleton w-16 h-8 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : planillas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileSpreadsheet className="w-7 h-7 text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Sin planillas</h3>
            <p className="text-slate-500 mb-5">
              {searchTerm.trim() 
                ? `No se encontraron planillas para "${searchTerm}"` 
                : `No hay planillas registradas para ${currentPeriod}`}
            </p>
            {!searchTerm.trim() && <button onClick={() => setShowModal(true)} className="btn-primary">Crear Planilla</button>}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="rounded-tl-xl">Empleado</th>
                  <th>DNI</th>
                  <th className="text-right">Haberes</th>
                  <th className="text-right">Descuentos</th>
                  <th className="text-right">Líquido</th>
                  <th className="text-center rounded-tr-xl">Acción</th>
                </tr>
              </thead>
              <tbody>
                {planillas.map(p => (
                  <tr key={p.id} className="hover-lift transition-smooth cursor-pointer">
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-blue hover-scale transition-smooth">
                          {p.personal?.nombres?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{p.personal?.apellidos} {p.personal?.nombres}</p>
                          <p className="text-[10px] text-slate-500">{p.personal?.puesto || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 hover:bg-slate-200 transition-smooth">{p.personal?.dni || '-'}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-medium text-emerald-600 text-xs">{formatCurrency(p.total_haberes)}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-medium text-red-500 text-xs">{formatCurrency(p.total_descuentos)}</span>
                    </td>
                    <td className="text-right">
                      <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-xs shadow-md">
                        {formatCurrency(p.total_liquido)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleEdit(p.id)} 
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition-all hover-scale" 
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => viewDetail(p.id)} 
                          className="p-1.5 rounded-lg hover:bg-cyan-50 text-cyan-600 transition-all hover-scale" 
                          title="Ver detalles"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all hover-scale" 
                          title="Eliminar"
                        >
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
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50"
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
                    className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50"
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
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-cyan-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Nueva Planilla</h3>
                    <p className="text-white/70 text-xs">Selecciona el empleado</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {error && (
                <div className="alert-error">
                  <X className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="relative">
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" /> Empleado *
                </label>
                {form.personal_id > 0 ? (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="text-sm text-emerald-700 flex-1">{searchEmpleado}</span>
                    <button type="button" onClick={() => { setForm({ ...form, personal_id: 0 }); setSearchEmpleado('') }} className="text-emerald-500 hover:text-emerald-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      </div>
                      <input
                        type="text"
                        className="input pl-10"
                        placeholder="Buscar por nombre o DNI..."
                        value={searchEmpleado}
                        onChange={e => {
                          setSearchEmpleado(e.target.value)
                          searchEmpleados(e.target.value)
                          setShowSearchResults(true)
                        }}
                        onFocus={() => setShowSearchResults(true)}
                      />
                    </div>
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-cyan-50 border-b border-slate-100 last:border-0"
                            onClick={() => selectEmpleado(p)}
                          >
                            <span className="text-sm font-medium text-slate-800">{p.apellidos} {p.nombres}</span>
                            <span className="text-xs text-slate-500 ml-2">{p.dni}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {showSearchResults && searchEmpleado.length >= 2 && searchResults.length === 0 && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700 mb-2">No se encontró ningún empleado</p>
                        <button
                          type="button"
                          onClick={() => { setShowNewEmpleado(true); setShowSearchResults(false) }}
                          className="text-xs text-cyan-600 hover:underline font-medium"
                        >
                          + Crear nuevo empleado
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {showNewEmpleado && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-slate-600">Nuevo empleado</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      className="input text-xs py-1.5"
                      placeholder="DNI"
                      value={newEmpleadoForm.dni}
                      onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, dni: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input text-xs py-1.5"
                      placeholder="Nombres *"
                      value={newEmpleadoForm.nombres}
                      onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, nombres: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input text-xs py-1.5"
                      placeholder="Apellidos *"
                      value={newEmpleadoForm.apellidos}
                      onChange={e => setNewEmpleadoForm({ ...newEmpleadoForm, apellidos: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={createAndSelectEmpleado}
                      disabled={!newEmpleadoForm.nombres.trim() || !newEmpleadoForm.apellidos.trim()}
                      className="text-xs bg-cyan-500 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50"
                    >
                      Crear y usar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewEmpleado(false); setNewEmpleadoForm({ dni: '', nombres: '', apellidos: '' }) }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="form-grid form-grid-2">
                <div>
                  <label className="label flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" /> Mes *
                  </label>
                  <select className="input" value={form.mes} onChange={e => setForm({ ...form, mes: Number(e.target.value) })}>
                    {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" /> Año *
                  </label>
                  <select className="input" value={form.anio} onChange={e => setForm({ ...form, anio: Number(e.target.value) })}>
                    {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Crear Planilla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && detailPlanilla && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content w-[95vw] max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {detailPlanilla.personal?.nombres?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {detailPlanilla.personal?.apellidos} {detailPlanilla.personal?.nombres}
                    </h3>
                    <p className="text-slate-400 text-xs">{detailPlanilla.personal?.puesto || '-'} | {MESES[detailPlanilla.mes - 1]} {detailPlanilla.anio}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetail(false)} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl p-3 text-white">
                  <p className="text-emerald-100 text-[10px] uppercase font-semibold">Haberes</p>
                  <p className="text-lg font-bold">{formatCurrency(detailPlanilla.total_haberes)}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-400 to-red-600 rounded-xl p-3 text-white">
                  <p className="text-rose-100 text-[10px] uppercase font-semibold">Descuentos</p>
                  <p className="text-lg font-bold">{formatCurrency(detailPlanilla.total_descuentos)}</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl p-3 text-white">
                  <p className="text-cyan-100 text-[10px] uppercase font-semibold">Líquido</p>
                  <p className="text-lg font-bold">{formatCurrency(detailPlanilla.total_liquido)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                  <h4 className="font-bold text-emerald-600 text-xs flex items-center gap-1 mb-3 pb-2 border-b border-emerald-100">
                    <ArrowDownToLine className="w-3 h-3" /> Ingresos
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {detailPlanilla.ingresos?.length === 0 ? (
                      <p className="text-slate-400 text-xs text-center py-4">Sin ingresos</p>
                    ) : (
                      detailPlanilla.ingresos?.map((i: Ingreso) => (
                        <div key={i.id} className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                          <span className="text-slate-700 text-xs">{i.tipo}</span>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-emerald-700 text-xs">{formatCurrency(i.monto)}</span>
                            <button onClick={() => deleteIngreso(i.id)} className="p-1 rounded hover:bg-red-100 text-red-400">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-1 mt-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Concepto"
                      className="input text-xs py-1 flex-1"
                      value={ingresoForm.tipo}
                      onChange={e => setIngresoForm({ ...ingresoForm, tipo: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="S/"
                      className="input text-xs py-1 w-16"
                      value={ingresoForm.monto}
                      onChange={e => setIngresoForm({ ...ingresoForm, monto: e.target.value })}
                    />
                    <button
                      onClick={addIngreso}
                      disabled={!ingresoForm.tipo || !ingresoForm.monto}
                      className="px-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                  <h4 className="font-bold text-red-600 text-xs flex items-center gap-1 mb-3 pb-2 border-b border-red-100">
                    <ArrowUpFromLine className="w-3 h-3" /> Descuentos
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {detailPlanilla.descuentos?.length === 0 ? (
                      <p className="text-slate-400 text-xs text-center py-4">Sin descuentos</p>
                    ) : (
                      detailPlanilla.descuentos?.map((d: Descuento) => (
                        <div key={d.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                          <span className="text-slate-700 text-xs">{d.tipo}</span>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-red-700 text-xs">{formatCurrency(d.monto)}</span>
                            <button onClick={() => deleteDescuento(d.id)} className="p-1 rounded hover:bg-red-200 text-red-400">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-1 mt-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Concepto"
                      className="input text-xs py-1 flex-1"
                      value={descuentoForm.tipo}
                      onChange={e => setDescuentoForm({ ...descuentoForm, tipo: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="S/"
                      className="input text-xs py-1 w-16"
                      value={descuentoForm.monto}
                      onChange={e => setDescuentoForm({ ...descuentoForm, monto: e.target.value })}
                    />
                    <button
                      onClick={addDescuento}
                      disabled={!descuentoForm.tipo || !descuentoForm.monto}
                      className="px-2 bg-red-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEdit && editPlanilla && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content w-[95vw] max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Editar Planilla</h3>
                    <p className="text-white/70 text-xs">{editPlanilla.personal?.apellidos} {editPlanilla.personal?.nombres}</p>
                  </div>
                </div>
                <button onClick={() => setShowEdit(false)} className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="label text-xs">Mes</label>
                  <select 
                    className="input text-sm"
                    value={editPlanilla.mes}
                    onChange={e => setEditPlanilla({...editPlanilla, mes: Number(e.target.value)})}
                  >
                    {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Año</label>
                  <select 
                    className="input text-sm"
                    value={editPlanilla.anio}
                    onChange={e => setEditPlanilla({...editPlanilla, anio: Number(e.target.value)})}
                  >
                    {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <span className="text-lg font-bold text-emerald-600">
                    Líquido: {formatCurrency((editPlanilla.ingresos?.reduce((s: number, i: any) => s + (i.monto || 0), 0) || 0) - (editPlanilla.descuentos?.reduce((s: number, d: any) => s + (d.monto || 0), 0) || 0))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-emerald-100">
                    <h4 className="font-bold text-emerald-600 text-xs">Ingresos</h4>
                    <button onClick={addIngresoEdit} className="text-xs text-emerald-600 hover:underline">+ Agregar</button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editPlanilla.ingresos?.map((ing: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="input text-xs py-1 flex-1"
                          value={ing.tipo}
                          onChange={e => {
                            const newIng = [...editPlanilla.ingresos]
                            newIng[idx].tipo = e.target.value
                            setEditPlanilla({...editPlanilla, ingresos: newIng})
                          }}
                          placeholder="Concepto"
                        />
                        <input
                          type="number"
                          className="input text-xs py-1 w-20"
                          value={ing.monto}
                          onChange={e => {
                            const newIng = [...editPlanilla.ingresos]
                            newIng[idx].monto = parseFloat(e.target.value) || 0
                            setEditPlanilla({...editPlanilla, ingresos: newIng})
                          }}
                          placeholder="Monto"
                        />
                        {ing.id > 0 ? (
                          <button onClick={() => deleteIngresoEdit(ing.id)} className="p-1 text-red-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <button onClick={() => setEditPlanilla({...editPlanilla, ingresos: editPlanilla.ingresos.filter((_: any, i: number) => i !== idx)})} className="p-1 text-red-400 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-red-100">
                    <h4 className="font-bold text-red-600 text-xs">Descuentos</h4>
                    <button onClick={addDescuentoEdit} className="text-xs text-red-600 hover:underline">+ Agregar</button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editPlanilla.descuentos?.map((desc: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="input text-xs py-1 flex-1"
                          value={desc.tipo}
                          onChange={e => {
                            const newDesc = [...editPlanilla.descuentos]
                            newDesc[idx].tipo = e.target.value
                            setEditPlanilla({...editPlanilla, descuentos: newDesc})
                          }}
                          placeholder="Concepto"
                        />
                        <input
                          type="number"
                          className="input text-xs py-1 w-20"
                          value={desc.monto}
                          onChange={e => {
                            const newDesc = [...editPlanilla.descuentos]
                            newDesc[idx].monto = parseFloat(e.target.value) || 0
                            setEditPlanilla({...editPlanilla, descuentos: newDesc})
                          }}
                          placeholder="Monto"
                        />
                        {desc.id > 0 ? (
                          <button onClick={() => deleteDescuentoEdit(desc.id)} className="p-1 text-red-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        ) : (
                          <button onClick={() => setEditPlanilla({...editPlanilla, descuentos: editPlanilla.descuentos.filter((_: any, i: number) => i !== idx)})} className="p-1 text-red-400 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowEdit(false)} className="btn-secondary">Cancelar</button>
              <button onClick={saveEdit} className="btn-primary">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
}
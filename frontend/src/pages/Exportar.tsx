import { useState, useCallback } from 'react'
import { personalApi } from '../services/api'
import { Search, Download, FileSpreadsheet, User, Calendar, X, Printer, Hash, CheckCircle, XCircle, Eye, RefreshCw, Table, BarChart3, CalendarDays, Trash2, LayoutGrid } from 'lucide-react'

interface Personal {
  id: number
  dni: string
  nombres: string
  apellidos: string
  puesto?: string
  rd?: string
  uu?: string
  activo: boolean
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

interface Planilla {
  id: number
  personal_id: number
  mes: number
  anio: number
  total_haberes: number
  total_descuentos: number
  total_liquido: number
  ingresos?: Ingreso[]
  descuentos?: Descuento[]
}

interface PlanillaResponse {
  personal: {
    id: number
    dni: string
    nombres: string
    apellidos: string
    puesto?: string
    rd?: string
    uu?: string
  }
  planillas: Planilla[]
  total_haberes: number
  total_descuentos: number
  total_liquido: number
  cantidad: number
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Exportar() {
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState<Personal[]>([])
  const [selectedPerson, setSelectedPerson] = useState<Personal | null>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searching, setSearching] = useState(false)

  const [selectedMes, setSelectedMes] = useState<number | null>(null)
  const [selectedAnio, setSelectedAnio] = useState<number>(new Date().getFullYear())
  const [exportAll, setExportAll] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [planillasData, setPlanillasData] = useState<Planilla[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [selectedPlanilla, setSelectedPlanilla] = useState<Planilla | null>(null)
  const [allPlanillas, setAllPlanillas] = useState<Planilla[]>([])
  const [loadingAll, setLoadingAll] = useState(false)

  const [periodosData, setPeriodosData] = useState<{años: number[], meses: Record<number, number[]>, total: number} | null>(null)
  const [loadingPeriodos, setLoadingPeriodos] = useState(false)

  const loadPeriodos = useCallback(async (personalId: number) => {
    setLoadingPeriodos(true)
    try {
      console.log('Cargando períodos para personal:', personalId)
      const res = await personalApi.getPeriodos(personalId)
      console.log('Períodos cargados:', res.data)
      setPeriodosData(res.data)
    } catch (e) {
      console.error('Error loading periodos:', e)
      setPeriodosData(null)
    }
    setLoadingPeriodos(false)
  }, [])

  const loadAllPlanillas = useCallback(async (personalId: number) => {
    setLoadingAll(true)
    setPlanillasData([])
    setAllPlanillas([])
    setShowPreview(false)
    
    try {
      console.log('Cargando planillas para personal:', personalId)
      const res = await personalApi.exportar(personalId, undefined, undefined)
      const data: PlanillaResponse = res.data
      console.log('Planillas cargadas:', data)
      if (data.planillas) {
        setAllPlanillas(data.planillas)
        setPlanillasData(data.planillas)
        setShowPreview(true)
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingAll(false)
  }, [])

  const searchEmpleados = async (query: string) => {
    if (!query || query.length < 2) return
    setSearching(true)
    try {
      const res = await personalApi.buscar(query, 10)
      setSearchResults(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
    setSearching(false)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (value.length >= 2) {
      setTimeout(() => searchEmpleados(value), 300)
    } else {
      setSearchResults([])
    }
  }

  const selectPerson = (p: Personal) => {
    setSelectedPerson(p)
    setSearchInput(`${p.apellidos} ${p.nombres}`)
    setShowSearchResults(false)
    setSearchResults([])
    setPlanillasData([])
    setAllPlanillas([])
    setShowPreview(false)
    setSelectedPlanilla(null)
    setPeriodosData(null)
    loadPeriodos(p.id)
    loadAllPlanillas(p.id)
  }

  const clearSelection = () => {
    setSelectedPerson(null)
    setSearchInput('')
    setPlanillasData([])
    setAllPlanillas([])
    setShowPreview(false)
    setSelectedPlanilla(null)
    setSelectedMes(null)
    setSelectedAnio(new Date().getFullYear())
    setExportAll(true)
    setPeriodosData(null)
  }

  const loadPlanillas = async () => {
    if (!selectedPerson) return

    setLoadingAll(true)
    setPlanillasData([])
    setAllPlanillas([])
    setShowPreview(false)
    
    try {
      const res = await personalApi.exportar(selectedPerson.id, undefined, undefined)
      const data: PlanillaResponse = res.data
      if (data.planillas) {
        setAllPlanillas(data.planillas)
        setPlanillasData(data.planillas)
        setShowPreview(true)
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingAll(false)
  }

  const generateExcel = async () => {
    if (!selectedPerson || planillasData.length === 0) return

    setExporting(true)
    
    // Generate a comprehensive HTML that can be opened in Excel
    const htmlContent = generateHTML()
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Planilla_${selectedPerson.apellidos}_${selectedPerson.nombres}_${new Date().toISOString().split('T')[0]}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setExporting(false)
  }

  const generateHTML = () => {
    if (!selectedPerson) return ''
    const totalHaberes = planillasData.reduce((s, p) => s + (p.total_haberes || 0), 0)
    const totalDescuentos = planillasData.reduce((s, p) => s + (p.total_descuentos || 0), 0)
    const totalLiquido = planillasData.reduce((s, p) => s + (p.total_liquido || 0), 0)

    let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #0ea5e9; color: white; }
  .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 20px; }
  .section-title { background: #f0f9ff; padding: 10px; font-weight: bold; color: #0ea5e9; }
  .total-row { background: #f0fdf4; font-weight: bold; }
  .negative { color: #dc2626; }
  .positive { color: #16a34a; }
  .period-header { background: #f8fafc; font-weight: bold; }
</style>
</head>
<body>
<div class="header">
  <h1>PLANILLA DE REMUNERACIONES</h1>
  <p>Sistema de Gestión Planillas SU</p>
</div>

<h2>DATOS DEL EMPLEADO</h2>
<table>
<tr><th>Apellidos</th><td>${selectedPerson.apellidos}</td></tr>
<tr><th>Nombres</th><td>${selectedPerson.nombres}</td></tr>
<tr><th>DNI</th><td>${selectedPerson.dni || 'N/A'}</td></tr>
<tr><th>Puesto</th><td>${selectedPerson.puesto || 'N/A'}</td></tr>
<tr><th>RD</th><td>${selectedPerson.rd || 'N/A'}</td></tr>
<tr><th>UU</th><td>${selectedPerson.uu || 'N/A'}</td></tr>
</table>

<h2>RESUMEN GENERAL</h2>
<table>
<tr><th>Total Períodos</th><td>${planillasData.length}</td></tr>
<tr><th>Total Haberes</th><td class="positive">S/ ${totalHaberes.toFixed(2)}</td></tr>
<tr><th>Total Descuentos</th><td class="negative">S/ ${totalDescuentos.toFixed(2)}</td></tr>
<tr><th>Líquido Total</th><td class="positive"><strong>S/ ${totalLiquido.toFixed(2)}</strong></td></tr>
</table>

<h2>DETALLE DE PLANILLAS</h2>
`

    planillasData.forEach((planilla) => {
      const mesNombre = MESES[planilla.mes - 1]
      
      html += `
<table>
<tr class="period-header"><th colspan="3">${mesNombre} - ${planilla.anio}</th></tr>
<tr><th colspan="3" style="background:#f0f9ff">INGRESOS Y HABERES</th></tr>
<tr><th>Concepto</th><th>Tipo</th><th>Monto</th></tr>
`
      
      if (planilla.ingresos && planilla.ingresos.length > 0) {
        planilla.ingresos.forEach(ing => {
          html += `<tr><td>${ing.tipo}</td><td>Ingreso</td><td class="positive">S/ ${ing.monto.toFixed(2)}</td></tr>`
        })
      }
      
      html += `<tr class="total-row"><td colspan="2">Subtotal Haberes</td><td class="positive">S/ ${planilla.total_haberes.toFixed(2)}</td></tr>`
      
      html += `
<tr><th colspan="3" style="background:#fef2f2">DESCUENTOS Y DEDUCCIONES</th></tr>
<tr><th>Concepto</th><th>Tipo</th><th>Monto</th></tr>
`
      
      if (planilla.descuentos && planilla.descuentos.length > 0) {
        planilla.descuentos.forEach(desc => {
          html += `<tr><td>${desc.tipo}</td><td>Descuento</td><td class="negative">S/ ${desc.monto.toFixed(2)}</td></tr>`
        })
      }
      
      html += `
<tr class="total-row"><td colspan="2">Subtotal Descuentos</td><td class="negative">S/ ${planilla.total_descuentos.toFixed(2)}</td></tr>
<tr class="total-row"><td colspan="2"><strong>Líquido del Período</strong></td><td class="positive"><strong>S/ ${planilla.total_liquido.toFixed(2)}</strong></td></tr>
</table>
`
    })

    html += `
<p style="margin-top:20px;color:#666;font-size:12px">
Exportado el: ${new Date().toLocaleString('es-PE')} | Sistema Planillas SU
</p>
</body>
</html>
`

    return html
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Download className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Exportación de Datos</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Exportar Planillas</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Exporta las planillas de un empleado en formato Excel</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="section-card hover-lift transition-smooth">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Seleccionar Empleado</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Busca por nombre o número de DNI</p>
              </div>
              {selectedPerson && (
                <button onClick={clearSelection} className="ml-auto text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                {searching ? (
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <input
                type="text"
                className={`w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-700 border-2 ${selectedPerson ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-600'} rounded-2xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base`}
                placeholder="Buscar empleados por nombre o DNI..."
                value={searchInput}
                onChange={e => { handleSearchChange(e.target.value); setShowSearchResults(true); if (!e.target.value) setSelectedPerson(null) }}
                onFocus={() => setShowSearchResults(true)}
                disabled={!!selectedPerson}
              />
              {selectedPerson && (
                <button
                  onClick={clearSelection}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-red-500 p-1.5"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-72 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="w-full text-left px-5 py-4 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border-b border-slate-100 dark:border-slate-700 last:border-0 flex items-center gap-4 transition-colors"
                      onClick={() => selectPerson(p)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {p.nombres?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-white">{p.apellidos} {p.nombres}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Hash className="w-3 h-3" /> {p.dni || 'Sin DNI'}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <User className="w-3 h-3" /> {p.puesto || 'Sin puesto'}
                          </span>
                        </div>
                      </div>
                      <div>
                        {p.activo ? (
                          <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Activo
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full text-xs font-semibold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Inactivo
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedPerson && (
              <div className="mt-5 p-5 bg-gradient-to-r from-emerald-50 via-cyan-50 to-blue-50 dark:from-emerald-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-cyan-500/20">
                    {selectedPerson.nombres?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white text-xl">{selectedPerson.apellidos}, {selectedPerson.nombres}</p>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Hash className="w-4 h-4 text-cyan-500" /> {selectedPerson.dni || 'Sin DNI'}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <User className="w-4 h-4 text-violet-500" /> {selectedPerson.puesto || 'Sin puesto'}
                      </span>
                      {selectedPerson.rd && (
                        <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          RD: {selectedPerson.rd}
                        </span>
                      )}
                      {selectedPerson.uu && (
                        <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          UU: {selectedPerson.uu}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedPerson.activo ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/30">
                        <CheckCircle className="w-4 h-4" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-400 text-white rounded-xl font-semibold text-sm">
                        <XCircle className="w-4 h-4" /> Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="section-card hover-lift transition-smooth">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Seleccionar Período</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {periodosData ? `${periodosData.total} planilla${periodosData.total !== 1 ? 's' : ''} encontrada${periodosData.total !== 1 ? 's' : ''}` : 'Elige el rango de tiempo a exportar'}
                </p>
              </div>
              {periodosData && (
                <button
                  onClick={() => { loadAllPlanillas(selectedPerson!.id); setExportAll(true); setSelectedMes(null); }}
                  className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              )}
            </div>

            {loadingPeriodos ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-500">Cargando períodos...</span>
              </div>
            ) : periodosData && periodosData.total > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${exportAll ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-cyan-400'}`}>
                    <input
                      type="radio"
                      name="periodo"
                      checked={exportAll}
                      onChange={() => { setExportAll(true); setSelectedMes(null); setPlanillasData(allPlanillas); }}
                      className="w-5 h-5 text-cyan-500"
                    />
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-white">Todos los registros</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Exportar todo el historial completo ({periodosData.total} planillas)</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${!exportAll ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-cyan-400'}`}>
                    <input
                      type="radio"
                      name="periodo"
                      checked={!exportAll}
                      onChange={() => setExportAll(false)}
                      className="w-5 h-5 text-cyan-500"
                    />
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-white">Período específico</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Seleccionar año y mes específico</p>
                    </div>
                  </label>
                </div>

                {!exportAll && (
<div className="mt-5 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Año</label>
                      <select
                        value={selectedAnio}
                        onChange={e => { setSelectedAnio(Number(e.target.value)); setSelectedMes(null); }}
                        className="input"
                      >
                        {periodosData?.años.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mes</label>
                      <select
                        value={selectedMes || ''}
                        onChange={e => setSelectedMes(e.target.value ? Number(e.target.value) : null)}
                        className="input"
                      >
                        <option value="">Todos los meses</option>
                        {(periodosData?.meses[selectedAnio] || []).map(m => (
                          <option key={m} value={m}>{MESES[m - 1]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const filtered = allPlanillas.filter(p => 
                        p.anio === selectedAnio && (selectedMes ? p.mes === selectedMes : true)
                      )
                      setPlanillasData(filtered)
                    }}
                    className="mt-4 w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Filtrar Período
                  </button>
</div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecciona un empleado para ver sus períodos disponibles</p>
              </div>
            )}

            {periodosData && periodosData.total === 0 && selectedPerson && (
              <div className="text-center py-8 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p>Este empleado no tiene planillas registradas</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedPerson && (
              <button
                onClick={() => loadAllPlanillas(selectedPerson.id)}
                disabled={loadingAll}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {loadingAll ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Actualizar Planillas</span>
              </button>
            )}
            <button
              onClick={generateExcel}
              disabled={!selectedPerson || planillasData.length === 0 || exporting}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Exportar Excel</span>
            </button>
          </div>

          {showPreview && planillasData.length > 0 && (
            <div className="section-card">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resultados</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{planillasData.length} planilla{planillasData.length > 1 ? 's' : ''} encontrada{planillasData.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Haberes</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(planillasData.reduce((s, p) => s + (p.total_haberes || 0), 0))}</p>
                  </div>
                  <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">Total Descuentos</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">{formatCurrency(planillasData.reduce((s, p) => s + (p.total_descuentos || 0), 0))}</p>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl">
                    <p className="text-xs text-white/80 font-medium">Líquido Total</p>
                    <p className="text-lg font-bold">{formatCurrency(planillasData.reduce((s, p) => s + (p.total_liquido || 0), 0))}</p>
                  </div>
                </div>
              </div>

              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planillasData.map((planilla, idx) => (
                    <div 
                      key={planilla.id} 
                      onClick={() => setSelectedPlanilla(selectedPlanilla?.id === planilla.id ? null : planilla)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${selectedPlanilla?.id === planilla.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-cyan-400'}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{MESES[planilla.mes - 1]} {planilla.anio}</p>
                            <p className="text-xs text-slate-500">Planilla #{planilla.id}</p>
                          </div>
                        </div>
                        <Eye className={`w-5 h-5 ${selectedPlanilla?.id === planilla.id ? 'text-cyan-500' : 'text-slate-400'}`} />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Haberes</p>
                          <p className="font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(planilla.total_haberes)}</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Descuentos</p>
                          <p className="font-bold text-red-700 dark:text-red-300">{formatCurrency(planilla.total_descuentos)}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                          <p className="text-xs text-white/80 font-medium">Líquido</p>
                          <p className="font-bold text-white">{formatCurrency(planilla.total_liquido)}</p>
                        </div>
                      </div>
                      
                      {selectedPlanilla?.id === planilla.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Ingresos ({planilla.ingresos?.length || 0})</p>
                            <div className="flex flex-wrap gap-1">
                              {planilla.ingresos?.slice(0, 3).map((ing, i) => (
                                <span key={i} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs">{ing.tipo}</span>
                              ))}
                              {planilla.ingresos && planilla.ingresos.length > 3 && (
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded text-xs">+{planilla.ingresos.length - 3}</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">Descuentos ({planilla.descuentos?.length || 0})</p>
                            <div className="flex flex-wrap gap-1">
                              {planilla.descuentos?.slice(0, 3).map((desc, i) => (
                                <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">{desc.tipo}</span>
                              ))}
                              {planilla.descuentos && planilla.descuentos.length > 3 && (
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded text-xs">+{planilla.descuentos.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                        <th className="text-left py-3 px-4">#</th>
                        <th className="text-left py-3 px-4">Período</th>
                        <th className="text-right py-3 px-4">Haberes</th>
                        <th className="text-right py-3 px-4">Descuentos</th>
                        <th className="text-right py-3 px-4">Ingresos</th>
                        <th className="text-right py-3 px-4">Descuentos</th>
                        <th className="text-right py-3 px-4">Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planillasData.map((p, idx) => (
                        <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">{idx + 1}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{MESES[p.mes - 1]} {p.anio}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(p.total_haberes)}</span>
                            <p className="text-xs text-slate-400">{p.ingresos?.length || 0} conceptos</p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-red-500 dark:text-red-400">{formatCurrency(p.total_descuentos)}</span>
                            <p className="text-xs text-slate-400">{p.descuentos?.length || 0} conceptos</p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {p.ingresos?.slice(0, 2).map((ing, i) => (
                                <span key={i} className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs">{ing.tipo.substring(0,8)}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {p.descuentos?.slice(0, 2).map((desc, i) => (
                                <span key={i} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-xs">{desc.tipo.substring(0,8)}</span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold text-sm">
                              {formatCurrency(p.total_liquido)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <td colSpan={2} className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">TOTALES</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(planillasData.reduce((s, p) => s + (p.total_haberes || 0), 0))}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-red-500 dark:text-red-400">
                          {formatCurrency(planillasData.reduce((s, p) => s + (p.total_descuentos || 0), 0))}
                        </td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-right font-bold text-cyan-600 dark:text-cyan-400">
                          {formatCurrency(planillasData.reduce((s, p) => s + (p.total_liquido || 0), 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {showPreview && planillasData.length === 0 && (
            <div className="section-card text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sin planillas</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">No se encontraron planillas para el período seleccionado</p>
              <button 
                onClick={() => { setExportAll(true); loadPlanillas() }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Ver todos los registros
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Excel Completo</h3>
                <p className="text-white/70 text-sm">Formato profesional</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/70 mt-0.5" />
                <p className="text-white/80">Datos completos del empleado</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/70 mt-0.5" />
                <p className="text-white/80">Detalle de cada período</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/70 mt-0.5" />
                <p className="text-white/80">Todos los ingresos y descuentos</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-white/70 mt-0.5" />
                <p className="text-white/80">Totales y resumen general</p>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Printer className="w-4 h-4 text-cyan-500" />
              Estructura del Excel
            </h3>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-2">
              <p className="text-cyan-400 font-semibold">📋 ENCABEZADO</p>
              <p>• Datos del empleado</p>
              <p>• Período de exportación</p>
              <p className="text-emerald-400 font-semibold mt-3">💰 INGRESOS</p>
              <p>• Concepto por línea</p>
              <p>• Montos detallados</p>
              <p className="text-red-400 font-semibold mt-3">📉 DESCUENTOS</p>
              <p>• Concepto por línea</p>
              <p>• Montos detallados</p>
              <p className="text-cyan-400 font-semibold mt-3">📊 RESUMEN</p>
              <p>• Totales por período</p>
              <p>• Total general</p>
            </div>
          </div>

          <div className="section-card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Guía rápida</h3>
            <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">1</span>
                </div>
                <p>Busca al empleado por nombre o DNI</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">2</span>
                </div>
                <p>Selecciona el período a exportar</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">3</span>
                </div>
                <p>Haz clic en "Vista Previa" para verificar</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">4</span>
                </div>
                <p>Usa "Exportar Excel" para descargar</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Nota</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Haz clic en cada card para ver el detalle de ingresos y descuentos de cada planilla.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Calendar, Users, LayoutList, FileType, ArrowRight, HelpCircle, AlertTriangle, Copy, X, CheckSquare } from 'lucide-react'

const MESES = [
  { v: 1, l: 'Enero' }, { v: 2, l: 'Febrero' }, { v: 3, l: 'Marzo' },
  { v: 4, l: 'Abril' }, { v: 5, l: 'Mayo' }, { v: 6, l: 'Junio' },
  { v: 7, l: 'Julio' }, { v: 8, l: 'Agosto' }, { v: 9, l: 'Septiembre' },
  { v: 10, l: 'Octubre' }, { v: 11, l: 'Noviembre' }, { v: 12, l: 'Diciembre' },
]

const currentYear = new Date().getFullYear()
const ANIOS = Array.from({ length: currentYear - 1989 }, (_, i) => 1990 + i).reverse()

export default function Importar() {
  const [file, setFile] = useState<File | null>(null)
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1)
  const [anio, setAnio] = useState<number>(currentYear)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [duplicados, setDuplicados] = useState<any[]>([])
  const [totalDuplicados, setTotalDuplicados] = useState(0)
  const [showDuplicados, setShowDuplicados] = useState(false)
  const [preImportData, setPreImportData] = useState<any>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [multiples, setMultiples] = useState<any[]>([])
  const [hasMultiples, setHasMultiples] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      acceptFile(selected)
      validarArchivo(selected)
    }
  }

  const acceptFile = (f: File) => {
    if (!f.name.match(/\.(xlsx|xls)$/i)) {
      setError('Solo archivos Excel (.xlsx, .xls)')
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
    setDuplicados([])
    setTotalDuplicados(0)
    setShowDuplicados(false)
  }

  const validarArchivo = async (f: File) => {
    setValidating(true)
    setDuplicados([])
    setTotalDuplicados(0)
    setShowDuplicados(false)
    setMultiples([])
    setHasMultiples(false)

    try {
      const formData = new FormData()
      formData.append('file', f)
      formData.append('mes', String(mes))
      formData.append('anio', String(anio))
      const response = await fetch('/python/validate-excel', { method: 'POST', body: formData })
      const data = await response.json()
      console.log('Validación:', data)
      if (response.ok) {
        const dupList = data.duplicados || []
        setDuplicados(dupList)
        setTotalDuplicados(data.total_duplicados || 0)
        if (dupList.length > 0) {
          setShowDuplicados(true)
        }
        setMultiples(data.multiples || [])
        setHasMultiples(data.has_multiples || false)
        setPreImportData(data)
        setShowConfirmModal(true)
      }
    } catch (err) {
      console.error('Error validación:', err)
    } finally {
      setValidating(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) {
      acceptFile(f)
      validarArchivo(f)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setShowConfirmModal(false)
    setUploading(true)
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mes', String(mes))
      formData.append('anio', String(anio))

      const response = await fetch('/python/process-excel', { method: 'POST', body: formData })

      const data = await response.json()
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || `Error ${response.status}`)
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setUploading(false)
      setIsLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!preImportData) return
    setShowConfirmModal(false)
    setUploading(true)
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file!)
      formData.append('mes', String(mes))
      formData.append('anio', String(anio))

      const response = await fetch('/python/process-excel', { method: 'POST', body: formData })
      const data = await response.json()
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || `Error ${response.status}`)
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setUploading(false)
      setIsLoading(false)
    }
  }

  const handleCancelImport = () => {
    setShowConfirmModal(false)
    setPreImportData(null)
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setDuplicados([])
    setTotalDuplicados(0)
    setShowDuplicados(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Upload className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Importación de Datos</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Importar Planilla</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Carga archivos Excel para importar nóminas masivamente</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="section-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="skeleton w-10 h-10 rounded-xl"></div>
                <div>
                  <div className="skeleton skeleton-text w-32"></div>
                  <div className="skeleton skeleton-text w-24"></div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="skeleton w-full h-12 rounded-xl"></div>
                <div className="skeleton w-full h-12 rounded-xl"></div>
              </div>
            </div>
            <div className="section-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="skeleton w-10 h-10 rounded-xl"></div>
                <div>
                  <div className="skeleton skeleton-text w-32"></div>
                  <div className="skeleton skeleton-text w-24"></div>
                </div>
              </div>
              <div className="skeleton skeleton-card rounded-xl h-40"></div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="section-card">
              <div className="skeleton skeleton-text w-32 mb-4"></div>
              <div className="skeleton skeleton-card rounded-xl h-48"></div>
            </div>
            <div className="section-card">
              <div className="skeleton skeleton-text w-32 mb-4"></div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton skeleton-text h-10 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const mesNombre = MESES.find(m => m.v === mes)?.l ?? ''

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Upload className="w-5 h-5 text-cyan-500" />
          <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Importación de Datos</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Importar Planilla</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Carga archivos Excel para importar nóminas masivamente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="section-card hover-lift transition-smooth">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Seleccionar Período</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mes y año de la planilla</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Mes</label>
                <select
                  value={mes}
                  onChange={e => setMes(Number(e.target.value))}
                  className="input"
                >
                  {MESES.map(m => (
                    <option key={m.v} value={m.v}>{m.l}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Año</label>
                <select
                  value={anio}
                  onChange={e => setAnio(Number(e.target.value))}
                  className="input"
                >
                  {ANIOS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="section-card hover-lift transition-smooth">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl hover-scale transition-smooth">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Subir Archivo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Arrastra el archivo o haz clic para seleccionar</p>
              </div>
            </div>

            <div
              className={`upload-zone relative overflow-hidden hover-lift transition-smooth ${dragging ? 'upload-zone-active' : file ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <FileSpreadsheet className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB - {mesNombre} {anio}</p>
                    {validating && (
                      <p className="text-xs text-cyan-500 dark:text-cyan-400 flex items-center gap-1 mt-1">
                        <span className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></span>
                        Verificando duplicados...
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">Arrastra el archivo aquí</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">o haz clic para seleccionar - .xlsx, .xls</p>
                </div>
              )}
            </div>

            {showDuplicados && duplicados.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800 dark:text-amber-300">Detectados {totalDuplicados} duplicado(s) en el archivo</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">Se encontraron empleados repetidos. Revisa antes de importar.</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {duplicados.map((dup, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-amber-700">
                      <Copy className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      {dup.tipo === 'dni' ? (
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            DNI duplicado: <span className="font-mono">{dup.dni}</span>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{dup.nombres?.join(' y ')}</p>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{dup.nombre}</p>
                          {dup.dni && <p className="text-xs text-slate-500 dark:text-slate-400">DNI: {dup.dni}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="alert-error mt-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {showConfirmModal && preImportData && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCancelImport}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-5 bg-gradient-to-r from-cyan-500 to-blue-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <CheckSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Confirmar Importación</h3>
                        <p className="text-white/70 text-sm">{mesNombre} {anio}</p>
                      </div>
                    </div>
                    <button onClick={handleCancelImport} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 text-center border border-cyan-100 dark:border-cyan-800">
                      <Users className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{preImportData.total_empleados || 0}</p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400">Total trabajadores</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-100 dark:border-emerald-800">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{preImportData.total_empleados || 0}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Planillas a crear</p>
                    </div>
                  </div>

                  {duplicados.length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <p className="font-semibold text-amber-700 dark:text-amber-300">{duplicados.length} duplicado(s) detectado(s)</p>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {duplicados.map((dup, idx) => (
                          <div key={idx} className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2 bg-white dark:bg-slate-700 p-2 rounded-lg border border-amber-100 dark:border-amber-700">
                            <Copy className="w-4 h-4 flex-shrink-0" />
                            {dup.tipo === 'dni' ? (
                              <span>DNI <span className="font-mono font-semibold">{dup.dni}</span> ({dup.nombres?.join(', ')})</span>
                            ) : (
                              <span>{dup.nombre}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasMultiples && multiples.length > 0 && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-600 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <p className="font-bold text-red-700 dark:text-red-300 text-base">Trabajador con múltiples planillas diferentes</p>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-3">Se encontró un trabajador con más de una planilla y distinto pago neto. ¿Deseas continuar?</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {multiples.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-red-200 dark:border-red-700">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                                <FileSpreadsheet className="w-5 h-5 text-red-500" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{m.nombre}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">DNI: {m.dni || 'Sin DNI'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600 dark:text-red-400 font-mono">S/ {m.liquido?.toFixed(2)}</p>
                              {m.diferencia > 0.01 && (
                                <p className="text-xs text-amber-600 dark:text-amber-400">Diferencia: S/ {m.diferencia?.toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Solo se creará <strong>1 planilla</strong> por trabajador/mes</li>
                      <li>Si ya existe una planilla para el mismo trabajador y mes, se actualizará</li>
                      <li>Los ingresos y descuentos existentes serán reemplazados</li>
                    </ul>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700 flex justify-end gap-3">
                  <button onClick={handleCancelImport} className="px-5 py-3 bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-500 transition-all border border-slate-200 dark:border-slate-500">
                    Cancelar
                  </button>
                  <button onClick={handleConfirmImport} className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Confirmar Importación
                  </button>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="section-card bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">Importación Exitosa!</h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">Período: {mesNombre} {anio}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Bloques', value: result.personal ?? result.personal_count ?? 0, icon: Users },
                  { label: 'Creados', value: result.personal_creados ?? 0, icon: CheckCircle },
                  { label: 'Planillas', value: result.planillas_creadas ?? 0, icon: FileSpreadsheet },
                  { label: 'Total', value: result.planillas ?? result.planillas_count ?? 0, icon: LayoutList },
                ].map(({ label, value, icon: Icon }, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800 text-center">
                    <Icon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
              {result.errores && result.errores.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Advertencias ({result.errores.length})</p>
                  <ul className="text-sm text-amber-600 dark:text-amber-500 space-y-1">
                    {result.errores.slice(0, 5).map((e: string, i: number) => <li key={i}>- {e}</li>)}
                  </ul>
                </div>
              )}
              {result.total_duplicados > 0 && (
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Archivos con duplicados detectados: {result.total_duplicados}</p>
                  </div>
                  <div className="space-y-1">
                    {result.duplicados.map((d: any, i: number) => (
                      <p key={i} className="text-sm text-orange-600 dark:text-orange-400">
                        - {d.tipo === 'dni' ? `DNI ${d.dni}` : d.nombre}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {file && (
            <div className="flex gap-3 mt-4">
              <button onClick={resetForm} className="btn-secondary">Limpiar</button>
            </div>
          )}
          <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary flex items-center gap-2 mt-4 disabled:opacity-50">
            <Upload className="w-4 h-4" /> Importar - {mesNombre} {anio}
          </button>
        </div>

        <div className="space-y-5">
          <div className="section-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <LayoutList className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Formato Excel</h3>
            </div>
            <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-1">
              <div className="flex gap-2 text-slate-500 border-b border-slate-700 pb-2 mb-2">
                <span className="w-8">Col A</span>
                <span className="w-16">Col B</span>
                <span className="w-16">Col C</span>
                <span className="flex-1">Col D</span>
              </div>
              <p className="text-violet-400">HABERES</p>
              <p><span className="text-slate-500">|</span> Apellidos <span className="text-slate-500">|</span> DETALLE <span className="text-slate-500">|</span> MES</p>
              <p><span className="text-slate-500">|</span> Nombres <span className="text-slate-500">|</span> BASICA <span className="text-slate-500">|</span> 0.03</p>
              <p><span className="text-slate-500">|</span> <span className="text-slate-600">|</span> PERSONAL <span className="text-slate-500">|</span> 0.01</p>
              <p className="text-red-400 mt-2">DSCTOS</p>
              <p><span className="text-slate-500">|</span> <span className="text-slate-600">|</span> DL20530 <span className="text-slate-500">|</span> 3.80</p>
              <div className="flex gap-2 mt-2 pt-2 border-t border-slate-700">
                <span className="text-emerald-400">TOTAL</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">153.92</span>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Estructura de Datos</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Nombre', desc: 'Columna B - Nombres' },
                { label: 'Puesto', desc: 'Columna B - Puesto' },
                { label: 'DNI', desc: 'Columna B - DNI' },
                { label: 'Ingresos', desc: 'Sección HABERES' },
                { label: 'Descuentos', desc: 'Sección DSCTOS' },
              ].map(({ label, desc }, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <h3 className="font-bold text-white mb-2">¿Necesitas ayuda?</h3>
            <p className="text-sm text-white/80 mb-4">Descarga nuestra plantilla de ejemplo para facilitar la importación</p>
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
              <FileType className="w-4 h-4" />
              Descargar Plantilla
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
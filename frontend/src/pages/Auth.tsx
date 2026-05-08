import { useState } from 'react'
import { useAuth } from '../App'
import { LogIn, Lock, FileSpreadsheet, AlertCircle } from 'lucide-react'

export default function Auth() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      if (formData.usuario === 'admin' && formData.password === 'admin') {
        login()
      } else {
        setError('Credenciales incorrectas. Usa: admin / admin')
        setIsLoading(false)
      }
    }, 800)
  }

  if (isLoading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-sky-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-500/30 animate-pulse">
              <FileSpreadsheet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Sistema de Planillas</h1>
            <p className="text-slate-500 mt-2">Verificando credenciales...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-500/30">
            <FileSpreadsheet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Sistema de Planillas</h1>
          <p className="text-slate-500 mt-2">Gestión de personal y nóminas</p>
        </div>

        <div className="card shadow-2xl border-2 border-sky-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-500 rounded-xl flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Iniciar Sesión</h2>
              <p className="text-slate-500 text-xs">Accede al sistema</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label flex items-center gap-2">
                <span className="w-5 h-5 bg-sky-100 rounded-full flex items-center justify-center text-xs font-bold text-sky-600">U</span>
                Usuario
              </label>
              <input
                type="text"
                className="input"
                placeholder="admin"
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-500" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-xs text-center">
              <span className="font-semibold">Credenciales de acceso:</span><br />
              Usuario: <code className="bg-amber-100 px-1 rounded">admin</code> | Contraseña: <code className="bg-amber-100 px-1 rounded">admin</code>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          © 2024 Sistema de Planillas
        </p>
      </div>
    </div>
  )
}
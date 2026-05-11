import { useState } from 'react'
import { useAuth } from '../App'
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle, ChevronRight, Lock, Mail, User, Sparkles, Shield, Zap, FileSpreadsheet } from 'lucide-react'
import api from '../services/api'

export default function Auth() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {}
    if (!formData.email.trim()) errors.email = 'El correo es requerido'
    else if (!validateEmail(formData.email)) errors.email = 'Correo inválido'
    if (!formData.password) errors.password = 'La contraseña es requerida'
    else if (formData.password.length < 4) errors.password = 'Mínimo 4 caracteres'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return

    setStep('loading')
    setIsLoading(true)

    try {
      const response = await api.post('/api/usuarios/login', {
        email: formData.email,
        password: formData.password,
      })
      
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
        localStorage.setItem('user_data', JSON.stringify(response.data.user || {}))
        setStep('success')
        setTimeout(() => login(), 1200)
      }
    } catch (err: any) {
      setStep('form')
      setError(err.response?.data?.error || 'Credenciales incorrectas. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setFormData({ email: 'admin@planillas.su', password: 'admin123' })
    setError('')
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-md w-full px-6">
          <div className="relative mb-10">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/40 mx-auto animate-pulse-soft">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="absolute -inset-6 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-[2.5rem] opacity-30 blur-3xl animate-pulse"></div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-3">Verificando acceso</h2>
          <p className="text-blue-300 mb-8">Validando credenciales de usuario</p>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-cyan-400 font-medium">Por favor espera</span>
          </div>
          
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-md w-full px-6">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 mx-auto mb-8 animate-float">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-3">¡Bienvenido!</h2>
          <p className="text-emerald-300">Acceso concedido. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptLTQtNHYyaC0ydi0yaDJ6bTgtOGgydjJoLTJ2LTJ6bS04IDhoMnYyaC0ydi0yek0zMiAyNnYyaC0ydi0yaDJ6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-16 w-full max-w-2xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <FileSpreadsheet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white tracking-tight">Planillas<span className="text-cyan-400">SU</span></h1>
                <p className="text-xl text-blue-300 font-light">Sistema de Gestión de Nómina</p>
              </div>
            </div>
            <p className="text-blue-200/80 text-lg leading-relaxed max-w-lg">
              Administra tu personal, planillas y pagos de manera eficiente y segura
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: Zap, title: 'Gestión Integral', desc: 'Administra personal, planillas y pagos en un solo lugar', color: 'from-cyan-500 to-blue-500' },
              { icon: FileSpreadsheet, title: 'Importación Masiva', desc: 'Importa datos desde Excel de forma rápida y segura', color: 'from-violet-500 to-purple-500' },
              { icon: Shield, title: 'Reportes Detallados', desc: 'Genera reportes y estadísticas en tiempo real', color: 'from-emerald-500 to-teal-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-5 p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-blue-200/70 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-gradient-to-br ${i===1?'from-cyan-400 to-cyan-500':i===2?'from-blue-400 to-blue-500':'from-indigo-400 to-indigo-500'} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{['A','B','C'][i-1]}</span>
                </div>
              ))}
            </div>
            <p className="text-blue-200/60 text-sm">Únete a +150 usuarios que confían en PlanillasSU</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-100/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100/50 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Planillas<span className="text-cyan-600">SU</span></h1>
            <p className="text-slate-500 mt-2">Sistema de Gestión de Nómina</p>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Bienvenido de nuevo</h2>
            <p className="text-slate-500">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200/50 rounded-2xl flex items-center gap-4 animate-shake shadow-lg shadow-red-500/10">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-red-700 font-medium flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className={`relative transition-all duration-300 ${focusedField === 'email' || formData.email ? 'scale-[1.02]' : ''}`}>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5 ml-1">Correo electrónico</label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${focusedField === 'email' ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30' : 'bg-slate-100'}`}>
                  <Mail className={`w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <input
                  type="email"
                  className={`w-full pl-16 pr-5 py-4 bg-white border-2 ${fieldErrors.email ? 'border-red-300 bg-red-50' : focusedField === 'email' ? 'border-cyan-400 bg-white shadow-lg shadow-cyan-500/10' : 'border-slate-200 bg-slate-50'} rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-base`}
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFieldErrors({ ...fieldErrors, email: undefined }); setError('') }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              {fieldErrors.email && <p className="mt-2.5 text-sm text-red-600 font-medium ml-1">{fieldErrors.email}</p>}
            </div>

            {/* Password Field */}
            <div className={`relative transition-all duration-300 ${focusedField === 'password' || formData.password ? 'scale-[1.02]' : ''}`}>
              <label className="block text-sm font-semibold text-slate-700 mb-2.5 ml-1">Contraseña</label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${focusedField === 'password' ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30' : 'bg-slate-100'}`}>
                  <Lock className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full pl-16 pr-16 py-4 bg-white border-2 ${fieldErrors.password ? 'border-red-300 bg-red-50' : focusedField === 'password' ? 'border-cyan-400 bg-white shadow-lg shadow-cyan-500/10' : 'border-slate-200 bg-slate-50'} rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-base`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setFieldErrors({ ...fieldErrors, password: undefined }); setError('') }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-600 transition-colors p-1.5 hover:bg-cyan-50 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-2.5 text-sm text-red-600 font-medium ml-1">{fieldErrors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-2" />
                <span className="text-sm text-slate-600">Recordarme</span>
              </label>
              <button type="button" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 text-base disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl border border-slate-200/50">
            <p className="text-sm text-slate-500 font-medium text-center mb-4">¿No tienes acceso? Contacta al administrador</p>
            <button
              onClick={handleDemoLogin}
              className="w-full py-3.5 bg-white border-2 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 text-slate-700 font-semibold rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2 group hover:shadow-lg"
            >
              <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Usar credenciales de prueba</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/50">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4" />
              <p className="text-center text-sm">
                © {new Date().getFullYear()} Planillas SU — Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
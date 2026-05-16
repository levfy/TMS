import { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import {
  LayoutDashboard, ClipboardList, Users, Truck,
  BarChart3, LogOut, Plus, X, ChevronRight,
  Package, RefreshCw, CheckCircle, XCircle,
  MapPin, Weight, DollarSign, Phone, CreditCard,
  Car, Menu, Search, Filter, Eye, Edit2, Trash2,
  ArrowRight, Clock, TrendingUp, AlertCircle, Building2
} from 'lucide-react'

const api = axios.create({ baseURL: 'http://localhost:3000' })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('kd_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

type Page = 'login' | 'register' | 'dashboard' | 'orders' | 'drivers' | 'vehicles' | 'reports' | 'profile'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Черновик', PUBLISHED: 'Опубликована', ASSIGNED: 'Назначена',
  IN_TRANSIT: 'В пути', DELIVERED: 'Доставлена', COMPLETED: 'Выполнена', CANCELLED: 'Отменена'
}
const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 border border-gray-200',
  PUBLISHED: 'bg-blue-50 text-blue-700 border border-blue-200',
  ASSIGNED: 'bg-purple-50 text-purple-700 border border-purple-200',
  IN_TRANSIT: 'bg-amber-50 text-amber-700 border border-amber-200',
  DELIVERED: 'bg-teal-50 text-teal-700 border border-teal-200',
  COMPLETED: 'bg-green-50 text-green-700 border border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200'
}
const STATUS_NEXT: Record<string, string> = {
  DRAFT: 'PUBLISHED', PUBLISHED: 'ASSIGNED', ASSIGNED: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED', DELIVERED: 'COMPLETED'
}
const STATUS_NEXT_LABEL: Record<string, string> = {
  DRAFT: 'Опубликовать', PUBLISHED: 'Назначить', ASSIGNED: 'Отправить',
  IN_TRANSIT: 'Доставить', DELIVERED: 'Завершить'
}
const DRIVER_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border border-green-200',
  ON_TRIP: 'bg-amber-50 text-amber-700 border border-amber-200',
  INACTIVE: 'bg-gray-100 text-gray-600 border border-gray-200'
}
const DRIVER_STATUS_LABEL: Record<string, string> = { ACTIVE: 'Свободен', ON_TRIP: 'В рейсе', INACTIVE: 'Неактивен' }
const VEHICLE_STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'bg-green-50 text-green-700 border border-green-200',
  ON_TRIP: 'bg-amber-50 text-amber-700 border border-amber-200',
  MAINTENANCE: 'bg-red-50 text-red-700 border border-red-200'
}
const VEHICLE_STATUS_LABEL: Record<string, string> = { AVAILABLE: 'Свободна', ON_TRIP: 'В рейсе', MAINTENANCE: 'На ТО' }

const fmt = (n: any) => n ? Number(n).toLocaleString('ru-RU') + ' ₸' : '—'
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'
const initials = (f: string, l: string) => ((f?.[0] || '') + (l?.[0] || '')).toUpperCase()

// ── UI Components ─────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${color}`}>{label}</span>
}

function Input({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400" {...props} />
    </div>
  )
}

function Select({ label, options, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" {...props}>
        <option value="">Не выбрано</option>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Modal({ title, onClose, onSubmit, children, wide }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition">Отмена</button>
          <button onClick={onSubmit} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">Сохранить</button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', amber: 'bg-amber-500',
    purple: 'bg-purple-500', red: 'bg-red-500', teal: 'bg-teal-500'
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

function EmptyState({ icon: Icon, title, action, onAction }: any) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="text-base font-medium text-gray-700 mb-1">{title}</h3>
      {action && <button onClick={onAction} className="mt-4 text-sm text-blue-600 hover:underline">{action}</button>}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [token, setToken] = useState(localStorage.getItem('kd_token') || '')
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [orders, setOrders] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const [modal, setModal] = useState('')
  const [form, setForm] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const f = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }))

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [o, d, v, s] = await Promise.all([
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/drivers').catch(() => ({ data: [] })),
        api.get('/vehicles').catch(() => ({ data: [] })),
        api.get('/orders/stats').catch(() => ({ data: {} })),
      ])
      setOrders(Array.isArray(o.data) ? o.data : [])
      setDrivers(Array.isArray(d.data) ? d.data : [])
      setVehicles(Array.isArray(v.data) ? v.data : [])
      setStats(s.data)
    } catch { }
    setLoading(false)
  }, [])

  useEffect(() => { if (token) { setPage('dashboard'); loadAll() } }, [token])

  async function doLogin() {
    if (!form.email || !form.password) return toast.error('Заполните все поля')
    setSubmitting(true)
    try {
      const r = await api.post('/auth/login', { email: form.email, password: form.password })
      localStorage.setItem('kd_token', r.data.accessToken)
      setToken(r.data.accessToken); setUser(r.data.user); setForm({})
      toast.success('Добро пожаловать!')
    } catch { toast.error('Неверный email или пароль') }
    setSubmitting(false)
  }

  async function doRegister() {
    const required = ['email', 'phone', 'password', 'firstName', 'lastName', 'companyName', 'bin']
    if (required.some(k => !form[k])) return toast.error('Заполните все обязательные поля')
    if (!/^\+7\d{10}$/.test(form.phone)) return toast.error('Телефон: +77001234567')
    if (!/^\d{12}$/.test(form.bin)) return toast.error('БИН: 12 цифр')
    setSubmitting(true)
    try {
      const r = await api.post('/auth/register', form)
      localStorage.setItem('kd_token', r.data.accessToken)
      setToken(r.data.accessToken); setUser(r.data.user); setForm({})
      toast.success('Компания зарегистрирована!')
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Ошибка регистрации') }
    setSubmitting(false)
  }

  function logout() {
    localStorage.removeItem('kd_token')
    setToken(''); setUser(null); setPage('login'); setForm({})
  }

  async function createOrder() {
    if (!form.fromCity || !form.toCity || !form.cargoName) return toast.error('Маршрут и груз обязательны')
    setSubmitting(true)
    try {
      await api.post('/orders', { ...form, cargoWeight: form.cargoWeight ? Number(form.cargoWeight) : undefined, price: form.price ? Number(form.price) : undefined })
      toast.success('Заявка создана'); setModal(''); setForm({}); loadAll()
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Ошибка') }
    setSubmitting(false)
  }

  async function createDriver() {
    if (!form.firstName || !form.lastName || !form.phone || !form.iin) return toast.error('Заполните обязательные поля')
    setSubmitting(true)
    try {
      await api.post('/drivers', form)
      toast.success('Водитель добавлен'); setModal(''); setForm({}); loadAll()
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Ошибка') }
    setSubmitting(false)
  }

  async function createVehicle() {
    if (!form.brand || !form.model || !form.plateNumber) return toast.error('Заполните обязательные поля')
    setSubmitting(true)
    try {
      await api.post('/vehicles', { ...form, capacity: form.capacity ? Number(form.capacity) : undefined })
      toast.success('ТС добавлено'); setModal(''); setForm({}); loadAll()
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Ошибка') }
    setSubmitting(false)
  }

  async function assignOrder() {
    if (!selectedOrder) return
    setSubmitting(true)
    try {
      if (form.driverId || form.vehicleId) {
        await api.put(`/orders/${selectedOrder.id}/assign`, { driverId: form.driverId, vehicleId: form.vehicleId })
      }
      toast.success('Назначено'); setModal(''); setForm({}); setSelectedOrder(null); loadAll()
    } catch { toast.error('Ошибка') }
    setSubmitting(false)
  }

  async function nextStatus(order: any) {
    const next = STATUS_NEXT[order.status]
    if (!next) return
    try {
      await api.put(`/orders/${order.id}/status`, { status: next })
      toast.success(STATUS_LABEL[next]); loadAll()
    } catch { toast.error('Ошибка') }
  }

  async function cancelOrder(order: any) {
    try {
      await api.put(`/orders/${order.id}/status`, { status: 'CANCELLED' })
      toast.success('Заявка отменена'); loadAll()
    } catch { toast.error('Ошибка') }
  }

  const driverName = (id?: string) => { const d = drivers.find(x => x.id === id); return d ? d.firstName + ' ' + d.lastName : '—' }
  const vehicleName = (id?: string) => { const v = vehicles.find(x => x.id === id); return v ? v.brand + ' ' + v.model + ' · ' + v.plateNumber : '—' }

  const filteredOrders = orders.filter(o => {
    const matchSearch = !search || [o.fromCity, o.toCity, o.cargoName].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const NAV = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'orders', label: 'Заявки', icon: ClipboardList, count: orders.filter(o => o.status === 'IN_TRANSIT').length },
    { id: 'drivers', label: 'Водители', icon: Users },
    { id: 'vehicles', label: 'Транспорт', icon: Truck },
    { id: 'reports', label: 'Аналитика', icon: BarChart3 },
    { id: 'profile', label: 'Профиль', icon: Building2 },
  ]

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!token) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Package size={30} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">KazDispatch</h1>
          <p className="text-blue-300 text-sm mt-1">TMS для рынка Казахстана</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          {page === 'login' ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Вход в систему</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-blue-200 mb-1.5">Email</label>
                  <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="admin@company.kz" value={form.email || ''}
                    onChange={e => f('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-200 mb-1.5">Пароль</label>
                  <input type="password" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="••••••••" value={form.password || ''}
                    onChange={e => f('password', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doLogin()} />
                </div>
                <button onClick={doLogin} disabled={submitting}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-lg shadow-blue-500/30 mt-2">
                  {submitting ? 'Входим...' : 'Войти →'}
                </button>
              </div>
              <p className="text-center text-sm text-blue-300 mt-6">
                Нет аккаунта?{' '}
                <button onClick={() => { setPage('register'); setForm({}) }} className="text-white font-semibold hover:underline">Зарегистрироваться</button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Регистрация компании</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[['firstName', 'Имя *', 'Айнур'], ['lastName', 'Фамилия *', 'Бекова']].map(([k, l, p]) => (
                    <div key={k}>
                      <label className="block text-xs font-medium text-blue-200 mb-1">{l}</label>
                      <input className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder={p} value={form[k] || ''} onChange={e => f(k, e.target.value)} />
                    </div>
                  ))}
                </div>
                {[['email', 'Email *', 'admin@company.kz', 'email'], ['phone', 'Телефон *', '+77001234567', 'tel'], ['password', 'Пароль *', 'Минимум 8 символов', 'password'], ['companyName', 'Название компании *', 'ТОО Транслогистик', 'text'], ['bin', 'БИН (12 цифр) *', '123456789012', 'text']].map(([k, l, p, t]) => (
                  <div key={k}>
                    <label className="block text-xs font-medium text-blue-200 mb-1">{l}</label>
                    <input type={t} className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder={p} value={form[k] || ''} onChange={e => f(k, e.target.value)} />
                  </div>
                ))}
                <button onClick={doRegister} disabled={submitting}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-lg shadow-blue-500/30 mt-2">
                  {submitting ? 'Регистрируем...' : 'Зарегистрироваться →'}
                </button>
              </div>
              <p className="text-center text-sm text-blue-300 mt-4">
                Уже есть аккаунт?{' '}
                <button onClick={() => { setPage('login'); setForm({}) }} className="text-white font-semibold hover:underline">Войти</button>
              </p>
            </>
          )}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )

  // ── Main Layout ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 shadow-xl lg:shadow-none`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
            <Package size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">KazDispatch</div>
            <div className="text-xs text-gray-400">TMS Platform</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon, count }: any) => (
            <button key={id} onClick={() => { setPage(id as Page); setSidebarOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition
                ${page === id ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
              <div className="flex items-center gap-3">
                <Icon size={17} />
                {label}
              </div>
              {count > 0 && <span className="bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user ? initials(user.firstName || '', user.lastName || '') : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{user ? user.firstName + ' ' + user.lastName : 'Пользователь'}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email || ''}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition">
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-gray-600"><Menu size={22} /></button>
            <h2 className="text-base font-semibold text-gray-900">{NAV.find(n => n.id === page)?.label}</h2>
          </div>
          <button onClick={loadAll} disabled={loading} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline text-xs">Обновить</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-6">

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && (
            <div className="space-y-6 max-w-6xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ClipboardList} label="Всего заявок" value={stats?.total ?? orders.length} color="blue" />
                <StatCard icon={Truck} label="В пути" value={stats?.inTransit ?? orders.filter(o => o.status === 'IN_TRANSIT').length} color="amber" />
                <StatCard icon={CheckCircle} label="Выполнено" value={stats?.completed ?? orders.filter(o => o.status === 'COMPLETED').length} color="green" />
                <StatCard icon={DollarSign} label="Выручка" value={fmt(stats?.totalRevenue ?? 0)} color="purple" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <h3 className="font-semibold text-gray-800">Последние заявки</h3>
                    <button onClick={() => setPage('orders')} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">Все <ChevronRight size={13} /></button>
                  </div>
                  {orders.length === 0
                    ? <EmptyState icon={ClipboardList} title="Заявок пока нет" action="Создать заявку" onAction={() => { setPage('orders'); setModal('order') }} />
                    : <div className="divide-y divide-gray-50">
                        {orders.slice(0, 6).map(o => (
                          <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium text-gray-800">{o.fromCity}</span>
                                <ArrowRight size={13} className="text-gray-300 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-800">{o.toCity}</span>
                              </div>
                              <div className="text-xs text-gray-400">{o.cargoName} {o.cargoWeight ? '· ' + o.cargoWeight + 'т' : ''}</div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Badge label={STATUS_LABEL[o.status]} color={STATUS_COLOR[o.status]} />
                              <span className="text-xs text-gray-400 hidden sm:block">{fmt(o.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                  }
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Ресурсы</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Users size={15} className="text-blue-500" />Водителей</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{drivers.length}</span>
                          <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{drivers.filter(d => d.status === 'ACTIVE').length} своб.</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Truck size={15} className="text-green-500" />Транспорта</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{vehicles.length}</span>
                          <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{vehicles.filter(v => v.status === 'AVAILABLE').length} своб.</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600"><AlertCircle size={15} className="text-amber-500" />В пути</div>
                        <span className="font-bold text-gray-900">{orders.filter(o => o.status === 'IN_TRANSIT').length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-800 mb-4">Статусы</h3>
                    <div className="space-y-2.5">
                      {['IN_TRANSIT', 'ASSIGNED', 'DRAFT', 'COMPLETED'].map(s => {
                        const count = orders.filter(o => o.status === s).length
                        const pct = orders.length ? Math.round(count / orders.length * 100) : 0
                        return (
                          <div key={s}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">{STATUS_LABEL[s]}</span>
                              <span className="font-semibold text-gray-700">{count}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: pct + '%' }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {page === 'orders' && (
            <div className="space-y-4 max-w-7xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Поиск по городу или грузу..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">Все статусы</option>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={() => { setModal('order'); setForm({}) }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm whitespace-nowrap">
                  <Plus size={16} /> Новая заявка
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {filteredOrders.length === 0
                  ? <EmptyState icon={ClipboardList} title="Заявок не найдено" action="Создать заявку" onAction={() => { setModal('order'); setForm({}) }} />
                  : <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Маршрут</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Груз</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Водитель / ТС</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Сумма</th>
                          <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Действия</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50 transition">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5 font-medium text-gray-800">
                                  <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                                  {o.fromCity}
                                  <ArrowRight size={13} className="text-gray-300" />
                                  {o.toCity}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">{fmtDate(o.createdAt)}</div>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="text-gray-700">{o.cargoName}</div>
                                {o.cargoWeight && <div className="text-xs text-gray-400">{o.cargoWeight} т</div>}
                              </td>
                              <td className="px-5 py-3.5 hidden md:table-cell">
                                <div className="text-xs text-gray-600">{driverName(o.driverId)}</div>
                                <div className="text-xs text-gray-400">{vehicleName(o.vehicleId)}</div>
                              </td>
                              <td className="px-5 py-3.5">
                                <Badge label={STATUS_LABEL[o.status]} color={STATUS_COLOR[o.status]} />
                              </td>
                              <td className="px-5 py-3.5 hidden sm:table-cell">
                                <span className="font-medium text-gray-700">{fmt(o.price)}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1">
                                  {STATUS_NEXT[o.status] && (
                                    <button onClick={() => nextStatus(o)}
                                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-medium transition whitespace-nowrap">
                                      {STATUS_NEXT_LABEL[o.status]}
                                    </button>
                                  )}
                                  <button onClick={() => { setSelectedOrder(o); setForm({ driverId: o.driverId, vehicleId: o.vehicleId }); setModal('assign') }}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Назначить">
                                    <Edit2 size={14} />
                                  </button>
                                  {o.status !== 'CANCELLED' && o.status !== 'COMPLETED' && (
                                    <button onClick={() => cancelOrder(o)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Отменить">
                                      <XCircle size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                }
              </div>
            </div>
          )}

          {/* ── DRIVERS ── */}
          {page === 'drivers' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex justify-end">
                <button onClick={() => { setModal('driver'); setForm({}) }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                  <Plus size={16} /> Добавить водителя
                </button>
              </div>
              {drivers.length === 0
                ? <div className="bg-white rounded-2xl border border-gray-100"><EmptyState icon={Users} title="Водителей пока нет" /></div>
                : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drivers.map(d => (
                      <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-blue-200">
                              {initials(d.firstName, d.lastName)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{d.firstName} {d.lastName}</div>
                              <Badge label={DRIVER_STATUS_LABEL[d.status] || d.status} color={DRIVER_STATUS_COLOR[d.status] || 'bg-gray-100 text-gray-600'} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-500"><Phone size={13} className="text-gray-300" />{d.phone}</div>
                          <div className="flex items-center gap-2 text-gray-500"><CreditCard size={13} className="text-gray-300" />ИИН: {d.iin}</div>
                          {d.licenseCategory && <div className="flex items-center gap-2 text-gray-500"><Car size={13} className="text-gray-300" />Категория: {d.licenseCategory}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── VEHICLES ── */}
          {page === 'vehicles' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex justify-end">
                <button onClick={() => { setModal('vehicle'); setForm({}) }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                  <Plus size={16} /> Добавить ТС
                </button>
              </div>
              {vehicles.length === 0
                ? <div className="bg-white rounded-2xl border border-gray-100"><EmptyState icon={Truck} title="Транспорта пока нет" /></div>
                : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map(v => (
                      <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-sm shadow-green-200">
                            <Truck size={22} className="text-white" />
                          </div>
                          <Badge label={VEHICLE_STATUS_LABEL[v.status] || v.status} color={VEHICLE_STATUS_COLOR[v.status] || 'bg-gray-100 text-gray-600'} />
                        </div>
                        <div className="font-semibold text-gray-900 text-base mb-1">{v.brand} {v.model}</div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2 text-gray-500"><CreditCard size={13} className="text-gray-300" />{v.plateNumber}</div>
                          {v.bodyType && <div className="flex items-center gap-2 text-gray-500"><Car size={13} className="text-gray-300" />{v.bodyType}</div>}
                          {v.capacity && <div className="flex items-center gap-2 text-gray-500"><Weight size={13} className="text-gray-300" />{v.capacity} тонн</div>}
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── REPORTS ── */}
          {page === 'reports' && (
            <div className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ClipboardList} label="Всего заявок" value={stats?.total ?? orders.length} color="blue" />
                <StatCard icon={CheckCircle} label="Выполнено" value={stats?.completed ?? 0} color="green" />
                <StatCard icon={XCircle} label="Отменено" value={stats?.cancelled ?? 0} color="red" />
                <StatCard icon={TrendingUp} label="Выручка" value={fmt(stats?.totalRevenue ?? 0)} color="purple" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-5">Распределение по статусам</h3>
                  <div className="space-y-4">
                    {Object.entries(STATUS_LABEL).map(([key, label]) => {
                      const count = orders.filter(o => o.status === key).length
                      const pct = orders.length ? Math.round(count / orders.length * 100) : 0
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-semibold text-gray-800">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500" style={{ width: pct + '%' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Ресурсы компании</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Водителей всего', value: drivers.length, icon: Users, color: 'text-blue-500' },
                        { label: 'Свободных водителей', value: drivers.filter(d => d.status === 'ACTIVE').length, icon: Users, color: 'text-green-500' },
                        { label: 'Транспортных средств', value: vehicles.length, icon: Truck, color: 'text-teal-500' },
                        { label: 'Свободного транспорта', value: vehicles.filter(v => v.status === 'AVAILABLE').length, icon: Truck, color: 'text-green-500' },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-2.5">
                            <Icon size={16} className={color} />
                            <span className="text-sm text-gray-600">{label}</span>
                          </div>
                          <span className="font-bold text-gray-900 text-lg">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Средний чек</h3>
                    <div className="text-3xl font-bold text-gray-900">
                      {fmt(stats?.completed > 0 ? (stats?.totalRevenue ?? 0) / stats.completed : 0)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">за выполненную заявку</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {page === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-5">Профиль пользователя</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm shadow-blue-200">
                    {user ? initials(user.firstName || '', user.lastName || '') : 'U'}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                    <Badge label={user?.role || 'COMPANY_ADMIN'} color="bg-blue-50 text-blue-700 border border-blue-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div><div className="text-xs text-gray-400 mb-1">Всего заявок</div><div className="text-2xl font-bold text-gray-900">{orders.length}</div></div>
                  <div><div className="text-xs text-gray-400 mb-1">Выполнено</div><div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'COMPLETED').length}</div></div>
                  <div><div className="text-xs text-gray-400 mb-1">Водителей</div><div className="text-2xl font-bold text-gray-900">{drivers.length}</div></div>
                  <div><div className="text-xs text-gray-400 mb-1">Транспорт</div><div className="text-2xl font-bold text-gray-900">{vehicles.length}</div></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Быстрые действия</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Новая заявка', icon: ClipboardList, action: () => { setPage('orders'); setModal('order'); setForm({}) } },
                    { label: 'Добавить водителя', icon: Users, action: () => { setPage('drivers'); setModal('driver'); setForm({}) } },
                    { label: 'Добавить ТС', icon: Truck, action: () => { setPage('vehicles'); setModal('vehicle'); setForm({}) } },
                    { label: 'Аналитика', icon: BarChart3, action: () => setPage('reports') },
                  ].map(({ label, icon: Icon, action }) => (
                    <button key={label} onClick={action}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-left">
                      <Icon size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ── */}
      {modal === 'order' && (
        <Modal title="Новая заявка" onClose={() => setModal('')} onSubmit={createOrder}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Откуда (город) *" placeholder="Алматы" value={form.fromCity || ''} onChange={(e: any) => f('fromCity', e.target.value)} />
            <Input label="Куда (город) *" placeholder="Астана" value={form.toCity || ''} onChange={(e: any) => f('toCity', e.target.value)} />
          </div>
          <Input label="Название груза *" placeholder="Стройматериалы, оборудование..." value={form.cargoName || ''} onChange={(e: any) => f('cargoName', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Вес (тонн)" type="number" step="0.1" placeholder="10" value={form.cargoWeight || ''} onChange={(e: any) => f('cargoWeight', e.target.value)} />
            <Input label="Стоимость (₸)" type="number" placeholder="250000" value={form.price || ''} onChange={(e: any) => f('price', e.target.value)} />
          </div>
          {drivers.length > 0 && (
            <Select label="Назначить водителя" value={form.driverId || ''} onChange={(e: any) => f('driverId', e.target.value)}
              options={drivers.filter(d => d.status === 'ACTIVE').map(d => ({ value: d.id, label: d.firstName + ' ' + d.lastName }))} />
          )}
          {vehicles.length > 0 && (
            <Select label="Назначить транспорт" value={form.vehicleId || ''} onChange={(e: any) => f('vehicleId', e.target.value)}
              options={vehicles.filter(v => v.status === 'AVAILABLE').map(v => ({ value: v.id, label: v.brand + ' ' + v.model + ' (' + v.plateNumber + ')' }))} />
          )}
          <Input label="Примечания" placeholder="Дополнительная информация..." value={form.notes || ''} onChange={(e: any) => f('notes', e.target.value)} />
        </Modal>
      )}

      {modal === 'assign' && selectedOrder && (
        <Modal title={`Назначить: ${selectedOrder.fromCity} → ${selectedOrder.toCity}`} onClose={() => { setModal(''); setSelectedOrder(null) }} onSubmit={assignOrder}>
          <div className="p-3 bg-gray-50 rounded-xl mb-2">
            <div className="text-xs text-gray-500 mb-1">Груз</div>
            <div className="text-sm font-medium text-gray-800">{selectedOrder.cargoName} {selectedOrder.cargoWeight ? '· ' + selectedOrder.cargoWeight + ' т' : ''}</div>
          </div>
          <Select label="Водитель" value={form.driverId || ''} onChange={(e: any) => f('driverId', e.target.value)}
            options={drivers.map(d => ({ value: d.id, label: d.firstName + ' ' + d.lastName + ' · ' + DRIVER_STATUS_LABEL[d.status] }))} />
          <Select label="Транспортное средство" value={form.vehicleId || ''} onChange={(e: any) => f('vehicleId', e.target.value)}
            options={vehicles.map(v => ({ value: v.id, label: v.brand + ' ' + v.model + ' · ' + v.plateNumber + ' · ' + VEHICLE_STATUS_LABEL[v.status] }))} />
        </Modal>
      )}

      {modal === 'driver' && (
        <Modal title="Новый водитель" onClose={() => setModal('')} onSubmit={createDriver}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Имя *" placeholder="Асан" value={form.firstName || ''} onChange={(e: any) => f('firstName', e.target.value)} />
            <Input label="Фамилия *" placeholder="Усенов" value={form.lastName || ''} onChange={(e: any) => f('lastName', e.target.value)} />
          </div>
          <Input label="Телефон *" placeholder="+77012345678" value={form.phone || ''} onChange={(e: any) => f('phone', e.target.value)} />
          <Input label="ИИН *" placeholder="890101300123" value={form.iin || ''} onChange={(e: any) => f('iin', e.target.value)} />
          <Input label="Номер водительского удостоверения" placeholder="12AB345678" value={form.licenseNumber || ''} onChange={(e: any) => f('licenseNumber', e.target.value)} />
          <Input label="Категория прав" placeholder="C, CE" value={form.licenseCategory || ''} onChange={(e: any) => f('licenseCategory', e.target.value)} />
        </Modal>
      )}

      {modal === 'vehicle' && (
        <Modal title="Новое транспортное средство" onClose={() => setModal('')} onSubmit={createVehicle}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Марка *" placeholder="Scania" value={form.brand || ''} onChange={(e: any) => f('brand', e.target.value)} />
            <Input label="Модель *" placeholder="R450" value={form.model || ''} onChange={(e: any) => f('model', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Гос. номер *" placeholder="A123BC" value={form.plateNumber || ''} onChange={(e: any) => f('plateNumber', e.target.value)} />
            <Input label="Год выпуска" type="number" placeholder="2020" value={form.year || ''} onChange={(e: any) => f('year', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Тип кузова" placeholder="Фура, Рефрижератор..." value={form.bodyType || ''} onChange={(e: any) => f('bodyType', e.target.value)} />
            <Input label="Грузоподъёмность (т)" type="number" placeholder="20" value={form.capacity || ''} onChange={(e: any) => f('capacity', e.target.value)} />
          </div>
          <Input label="VIN номер" placeholder="XTA..." value={form.vin || ''} onChange={(e: any) => f('vin', e.target.value)} />
        </Modal>
      )}

      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import axios from 'axios'
import {
  LayoutDashboard, ClipboardList, Users, Truck,
  BarChart3, LogOut, Plus, X, ChevronRight,
  Package, RefreshCw, CheckCircle, XCircle,
  MapPin, Weight, DollarSign, Phone, CreditCard,
  Car, Menu
} from 'lucide-react'

// ── API ──────────────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: 'http://localhost:3000' })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('kd_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

// ── Types ────────────────────────────────────────────────────────────────────
type Page = 'login' | 'register' | 'dashboard' | 'orders' | 'drivers' | 'vehicles' | 'reports'
interface Order { id: string; fromCity: string; toCity: string; cargoName: string; cargoWeight?: number; price?: number; status: string; driverId?: string; vehicleId?: string; createdAt: string }
interface Driver { id: string; firstName: string; lastName: string; phone: string; iin: string; licenseCategory: string; status: string }
interface Vehicle { id: string; brand: string; model: string; plateNumber: string; bodyType: string; capacity: number; status: string }

// ── Constants ────────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Черновик', PUBLISHED: 'Опубликована', ASSIGNED: 'Назначена',
  IN_TRANSIT: 'В пути', DELIVERED: 'Доставлена', COMPLETED: 'Выполнена', CANCELLED: 'Отменена'
}
const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600', PUBLISHED: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-purple-100 text-purple-700', IN_TRANSIT: 'bg-yellow-100 text-yellow-700',
  DELIVERED: 'bg-teal-100 text-teal-700', COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700'
}
const STATUS_NEXT: Record<string, string> = {
  DRAFT: 'PUBLISHED', PUBLISHED: 'ASSIGNED', ASSIGNED: 'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED', DELIVERED: 'COMPLETED'
}
const DRIVER_STATUS: Record<string, string> = { ACTIVE: 'Свободен', ON_TRIP: 'В рейсе', INACTIVE: 'Неактивен' }
const DRIVER_STATUS_COLOR: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-700', ON_TRIP: 'bg-yellow-100 text-yellow-700', INACTIVE: 'bg-gray-100 text-gray-600' }
const VEHICLE_STATUS: Record<string, string> = { AVAILABLE: 'Свободна', ON_TRIP: 'В рейсе', MAINTENANCE: 'На ТО' }
const VEHICLE_STATUS_COLOR: Record<string, string> = { AVAILABLE: 'bg-green-100 text-green-700', ON_TRIP: 'bg-yellow-100 text-yellow-700', MAINTENANCE: 'bg-red-100 text-red-700' }

const fmt = (n: any) => n ? Number(n).toLocaleString('ru-RU') + ' ₸' : '—'
const initials = (f: string, l: string) => ((f?.[0] || '') + (l?.[0] || '')).toUpperCase()

// ── Components ───────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
}

function Input({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" {...props} />
    </div>
  )
}

function Select({ label, options, ...props }: any) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...props}>
        <option value="">Выберите...</option>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Modal({ title, onClose, onSubmit, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Отмена</button>
          <button onClick={onSubmit} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Сохранить</button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color = 'text-blue-600' }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-gray-50 ${color}`}><Icon size={22} /></div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [token, setToken] = useState(localStorage.getItem('kd_token') || '')
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)

  const [modal, setModal] = useState('')
  const [form, setForm] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)

  const f = (key: string, val: any) => setForm((p: any) => ({ ...p, [key]: val }))

  const loadAll = useCallback(async () => {
    setLoadingData(true)
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
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (token) { setPage('dashboard'); loadAll() }
  }, [token])

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
    if (required.some(k => !form[k])) return toast.error('Заполните все поля')
    setSubmitting(true)
    try {
      const r = await api.post('/auth/register', {
        email: form.email, phone: form.phone, password: form.password,
        firstName: form.firstName, lastName: form.lastName,
        companyName: form.companyName, bin: form.bin
      })
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
    if (!form.fromCity || !form.toCity || !form.cargoName) return toast.error('Заполните обязательные поля')
    setSubmitting(true)
    try {
      await api.post('/orders', form)
      toast.success('Заявка создана'); setModal(''); setForm({}); loadAll()
    } catch { toast.error('Ошибка создания заявки') }
    setSubmitting(false)
  }

  async function createDriver() {
    if (!form.firstName || !form.lastName || !form.phone || !form.iin) return toast.error('Заполните обязательные поля')
    setSubmitting(true)
    try {
      await api.post('/drivers', form)
      toast.success('Водитель добавлен'); setModal(''); setForm({}); loadAll()
    } catch { toast.error('Ошибка') }
    setSubmitting(false)
  }

  async function createVehicle() {
    if (!form.brand || !form.model || !form.plateNumber) return toast.error('Заполните обязательные поля')
    setSubmitting(true)
    try {
      await api.post('/vehicles', form)
      toast.success('ТС добавлено'); setModal(''); setForm({}); loadAll()
    } catch { toast.error('Ошибка') }
    setSubmitting(false)
  }

  async function nextStatus(order: Order) {
    const next = STATUS_NEXT[order.status]
    if (!next) return toast('Финальный статус')
    try {
      await api.put(`/orders/${order.id}/status`, { status: next })
      toast.success('Статус: ' + STATUS_LABEL[next]); loadAll()
    } catch { toast.error('Ошибка') }
  }

  const driverName = (id?: string) => { const d = drivers.find(x => x.id === id); return d ? d.firstName + ' ' + d.lastName : '—' }
  const vehicleName = (id?: string) => { const v = vehicles.find(x => x.id === id); return v ? v.brand + ' ' + v.plateNumber : '—' }

  const NAV = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'orders', label: 'Заявки', icon: ClipboardList },
    { id: 'drivers', label: 'Водители', icon: Users },
    { id: 'vehicles', label: 'Транспорт', icon: Truck },
    { id: 'reports', label: 'Аналитика', icon: BarChart3 },
  ]

  // ── Auth pages ──────────────────────────────────────────────────────────────
  if (!token) {
    if (page === 'login') return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Package size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">KazDispatch</h1>
            <p className="text-gray-500 text-sm mt-1">Платформа управления транспортом</p>
          </div>
          <div className="space-y-4">
            <Input label="Email" type="email" placeholder="admin@company.kz" value={form.email || ''} onChange={(e: any) => f('email', e.target.value)} />
            <Input label="Пароль" type="password" placeholder="••••••••" value={form.password || ''} onChange={(e: any) => f('password', e.target.value)}
              onKeyDown={(e: any) => e.key === 'Enter' && doLogin()} />
            <button onClick={doLogin} disabled={submitting}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition">
              {submitting ? 'Входим...' : 'Войти'}
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Нет аккаунта?{' '}
            <button onClick={() => { setPage('register'); setForm({}) }} className="text-blue-600 hover:underline font-medium">Зарегистрироваться</button>
          </p>
        </div>
        <Toaster position="top-right" />
      </div>
    )

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3">
              <Package size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Регистрация компании</h1>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Имя *" placeholder="Айнур" value={form.firstName || ''} onChange={(e: any) => f('firstName', e.target.value)} />
              <Input label="Фамилия *" placeholder="Исаков" value={form.lastName || ''} onChange={(e: any) => f('lastName', e.target.value)} />
            </div>
            <Input label="Email *" type="email" placeholder="admin@company.kz" value={form.email || ''} onChange={(e: any) => f('email', e.target.value)} />
            <Input label="Телефон *" placeholder="+77001234567" value={form.phone || ''} onChange={(e: any) => f('phone', e.target.value)} />
            <Input label="Пароль *" type="password" placeholder="Минимум 8 символов" value={form.password || ''} onChange={(e: any) => f('password', e.target.value)} />
            <Input label="Название компании *" placeholder="ТОО Транслогистик" value={form.companyName || ''} onChange={(e: any) => f('companyName', e.target.value)} />
            <Input label="БИН (12 цифр) *" placeholder="123456789012" value={form.bin || ''} onChange={(e: any) => f('bin', e.target.value)} />
            <button onClick={doRegister} disabled={submitting}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition">
              {submitting ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Уже есть аккаунт?{' '}
            <button onClick={() => { setPage('login'); setForm({}) }} className="text-blue-600 hover:underline font-medium">Войти</button>
          </p>
        </div>
        <Toaster position="top-right" />
      </div>
    )
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200`}>
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Package size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">KazDispatch</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setPage(id as Page); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${page === id ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
              {user ? initials(user.firstName, user.lastName) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user ? user.firstName + ' ' + user.lastName : 'Пользователь'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition">
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700"><Menu size={22} /></button>
            <h2 className="text-base font-semibold text-gray-900">
              {NAV.find(n => n.id === page)?.label || 'KazDispatch'}
            </h2>
          </div>
          <button onClick={loadAll} disabled={loadingData} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <RefreshCw size={16} className={loadingData ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Обновить</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ClipboardList} label="Всего заявок" value={stats?.total ?? orders.length} color="text-blue-600" />
                <StatCard icon={Truck} label="В пути" value={stats?.inTransit ?? orders.filter(o => o.status === 'IN_TRANSIT').length} color="text-yellow-600" />
                <StatCard icon={CheckCircle} label="Выполнено" value={stats?.completed ?? orders.filter(o => o.status === 'COMPLETED').length} color="text-green-600" />
                <StatCard icon={Users} label="Водителей" value={drivers.length} color="text-purple-600" />
              </div>

              <div className="bg-white rounded-xl border border-gray-100">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Последние заявки</h3>
                  <button onClick={() => setPage('orders')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">Все <ChevronRight size={14} /></button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Заявок пока нет</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Маршрут</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Груз</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Статус</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Сумма</th>
                      </tr></thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-5 py-3 font-medium">{o.fromCity} → {o.toCity}</td>
                            <td className="px-5 py-3 text-gray-600">{o.cargoName}</td>
                            <td className="px-5 py-3"><Badge label={STATUS_LABEL[o.status]} color={STATUS_COLOR[o.status]} /></td>
                            <td className="px-5 py-3 text-gray-600">{fmt(o.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Транспорт</h3>
                  {vehicles.slice(0, 4).map(v => (
                    <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"><Car size={16} className="text-gray-500" /></div>
                        <div><div className="text-sm font-medium">{v.brand} {v.model}</div><div className="text-xs text-gray-500">{v.plateNumber}</div></div>
                      </div>
                      <Badge label={VEHICLE_STATUS[v.status]} color={VEHICLE_STATUS_COLOR[v.status]} />
                    </div>
                  ))}
                  {vehicles.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Нет транспорта</p>}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Водители</h3>
                  {drivers.slice(0, 4).map(d => (
                    <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">{initials(d.firstName, d.lastName)}</div>
                        <div><div className="text-sm font-medium">{d.firstName} {d.lastName}</div><div className="text-xs text-gray-500">{d.phone}</div></div>
                      </div>
                      <Badge label={DRIVER_STATUS[d.status]} color={DRIVER_STATUS_COLOR[d.status]} />
                    </div>
                  ))}
                  {drivers.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Нет водителей</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {page === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => { setModal('order'); setForm({}) }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Plus size={16} /> Новая заявка
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {orders.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Заявок пока нет</p>
                    <button onClick={() => { setModal('order'); setForm({}) }} className="mt-4 text-blue-600 hover:underline text-sm">Создать первую заявку</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Маршрут</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Груз</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Водитель</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Машина</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Статус</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Сумма</th>
                        <th className="px-5 py-3"></th>
                      </tr></thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-5 py-3">
                              <div className="font-medium">{o.fromCity}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{o.toCity}</div>
                            </td>
                            <td className="px-5 py-3">
                              <div>{o.cargoName}</div>
                              {o.cargoWeight && <div className="text-xs text-gray-400">{o.cargoWeight} т</div>}
                            </td>
                            <td className="px-5 py-3 text-gray-600">{driverName(o.driverId)}</td>
                            <td className="px-5 py-3 text-gray-600">{vehicleName(o.vehicleId)}</td>
                            <td className="px-5 py-3"><Badge label={STATUS_LABEL[o.status]} color={STATUS_COLOR[o.status]} /></td>
                            <td className="px-5 py-3 text-gray-600">{fmt(o.price)}</td>
                            <td className="px-5 py-3">
                              {STATUS_NEXT[o.status] && (
                                <button onClick={() => nextStatus(o)}
                                  className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded-md whitespace-nowrap">
                                  → {STATUS_LABEL[STATUS_NEXT[o.status]]}
                                </button>
                              )}
                              {o.status === 'COMPLETED' && <CheckCircle size={16} className="text-green-500" />}
                              {o.status === 'CANCELLED' && <XCircle size={16} className="text-red-400" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DRIVERS ── */}
          {page === 'drivers' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => { setModal('driver'); setForm({}) }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Plus size={16} /> Добавить водителя
                </button>
              </div>
              {drivers.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
                  <Users size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Водителей пока нет</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map(d => (
                    <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                          {initials(d.firstName, d.lastName)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{d.firstName} {d.lastName}</div>
                          <Badge label={DRIVER_STATUS[d.status] || d.status} color={DRIVER_STATUS_COLOR[d.status] || 'bg-gray-100 text-gray-600'} />
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" />{d.phone}</div>
                        <div className="flex items-center gap-2"><CreditCard size={14} className="text-gray-400" />ИИН: {d.iin}</div>
                        {d.licenseCategory && <div className="flex items-center gap-2"><Car size={14} className="text-gray-400" />Кат: {d.licenseCategory}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── VEHICLES ── */}
          {page === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button onClick={() => { setModal('vehicle'); setForm({}) }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Plus size={16} /> Добавить ТС
                </button>
              </div>
              {vehicles.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400">
                  <Truck size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Транспорта пока нет</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map(v => (
                    <div key={v.id} className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                          <Truck size={24} className="text-green-600" />
                        </div>
                        <Badge label={VEHICLE_STATUS[v.status] || v.status} color={VEHICLE_STATUS_COLOR[v.status] || 'bg-gray-100 text-gray-600'} />
                      </div>
                      <div className="font-semibold text-gray-900 text-base mb-1">{v.brand} {v.model}</div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2"><CreditCard size={14} className="text-gray-400" />{v.plateNumber}</div>
                        {v.bodyType && <div className="flex items-center gap-2"><Car size={14} className="text-gray-400" />{v.bodyType}</div>}
                        {v.capacity && <div className="flex items-center gap-2"><Weight size={14} className="text-gray-400" />{v.capacity} тонн</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {page === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ClipboardList} label="Всего заявок" value={stats?.total ?? orders.length} color="text-blue-600" />
                <StatCard icon={CheckCircle} label="Выполнено" value={stats?.completed ?? 0} color="text-green-600" />
                <StatCard icon={XCircle} label="Отменено" value={stats?.cancelled ?? 0} color="text-red-500" />
                <StatCard icon={DollarSign} label="Выручка" value={fmt(stats?.totalRevenue ?? 0)} color="text-yellow-600" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Статусы заявок</h3>
                  <div className="space-y-3">
                    {Object.entries(STATUS_LABEL).map(([key, label]) => {
                      const count = orders.filter(o => o.status === key).length
                      const pct = orders.length ? Math.round(count / orders.length * 100) : 0
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{label}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: pct + '%' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Ресурсы</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3"><Users size={18} className="text-blue-500" /><span className="text-sm font-medium">Водители</span></div>
                      <span className="text-2xl font-bold text-gray-900">{drivers.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3"><Truck size={18} className="text-green-500" /><span className="text-sm font-medium">Транспорт</span></div>
                      <span className="text-2xl font-bold text-gray-900">{vehicles.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3"><Truck size={18} className="text-yellow-500" /><span className="text-sm font-medium">В рейсе</span></div>
                      <span className="text-2xl font-bold text-gray-900">{vehicles.filter(v => v.status === 'ON_TRIP').length}</span>
                    </div>
                  </div>
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
            <Input label="Откуда *" placeholder="Алматы" value={form.fromCity || ''} onChange={(e: any) => f('fromCity', e.target.value)} />
            <Input label="Куда *" placeholder="Астана" value={form.toCity || ''} onChange={(e: any) => f('toCity', e.target.value)} />
          </div>
          <Input label="Груз *" placeholder="Стройматериалы" value={form.cargoName || ''} onChange={(e: any) => f('cargoName', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Вес (тонн)" type="number" placeholder="10" value={form.cargoWeight || ''} onChange={(e: any) => f('cargoWeight', e.target.value)} />
            <Input label="Стоимость (₸)" type="number" placeholder="250000" value={form.price || ''} onChange={(e: any) => f('price', e.target.value)} />
          </div>
          {drivers.length > 0 && (
            <Select label="Водитель" value={form.driverId || ''} onChange={(e: any) => f('driverId', e.target.value)}
              options={drivers.map(d => ({ value: d.id, label: d.firstName + ' ' + d.lastName }))} />
          )}
          {vehicles.length > 0 && (
            <Select label="Транспорт" value={form.vehicleId || ''} onChange={(e: any) => f('vehicleId', e.target.value)}
              options={vehicles.map(v => ({ value: v.id, label: v.brand + ' ' + v.model + ' (' + v.plateNumber + ')' }))} />
          )}
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
          <Input label="Категория прав" placeholder="C, CE" value={form.licenseCategory || ''} onChange={(e: any) => f('licenseCategory', e.target.value)} />
        </Modal>
      )}

      {modal === 'vehicle' && (
        <Modal title="Новое ТС" onClose={() => setModal('')} onSubmit={createVehicle}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Марка *" placeholder="Scania" value={form.brand || ''} onChange={(e: any) => f('brand', e.target.value)} />
            <Input label="Модель *" placeholder="R450" value={form.model || ''} onChange={(e: any) => f('model', e.target.value)} />
          </div>
          <Input label="Гос. номер *" placeholder="A123BC" value={form.plateNumber || ''} onChange={(e: any) => f('plateNumber', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Тип кузова" placeholder="Фура" value={form.bodyType || ''} onChange={(e: any) => f('bodyType', e.target.value)} />
            <Input label="Грузоподъёмность (т)" type="number" placeholder="20" value={form.capacity || ''} onChange={(e: any) => f('capacity', e.target.value)} />
          </div>
        </Modal>
      )}

      <Toaster position="top-right" />
    </div>
  )
}

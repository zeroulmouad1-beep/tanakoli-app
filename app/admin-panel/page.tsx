"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, LogOut, Bus, Users, Wallet, Search,
  ChevronRight, Loader2, AlertCircle, CheckCircle2,
  Activity, TrendingUp, UserCheck, RefreshCw, X,
  MapPin, Clock,
} from "lucide-react"
import { db } from "@/lib/firebase"
import {
  collection, onSnapshot, doc, updateDoc,
  increment, serverTimestamp,
} from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"

const ADMIN_PHONES = ["0775453629"]

const FleetMap = dynamic(
  () => import("./fleet-map").then((m) => ({ default: m.AdminFleetMap })),
  { ssr: false, loading: () => <div className="h-[320px] w-full animate-pulse rounded-2xl bg-slate-800" /> }
)

interface UserRecord {
  id: string
  fullName?: string
  phone?: string
  Phone?: string
  balance?: number
  wholesaleBalance?: number
  role?: string
}

interface BusRecord {
  id: string
  latitude?: number
  longitude?: number
  lastUpdated?: { toDate?: () => Date } | null
  name?: string
  current_route_id?: string
}

type Tab = "fleet" | "finance" | "users"

const TABS: { id: Tab; label: string; icon: typeof Bus }[] = [
  { id: "fleet", label: "الأسطول", icon: Bus },
  { id: "finance", label: "المالية", icon: Wallet },
  { id: "users", label: "المستخدمون", icon: Users },
]

function timeSince(lastUpdated: BusRecord["lastUpdated"]): string {
  if (!lastUpdated?.toDate) return "غير معروف"
  const secs = Math.floor((Date.now() - lastUpdated.toDate().getTime()) / 1000)
  if (secs < 60) return `منذ ${secs} ث`
  if (secs < 3600) return `منذ ${Math.floor(secs / 60)} د`
  return `منذ ${Math.floor(secs / 3600)} س`
}

function isLive(lastUpdated: BusRecord["lastUpdated"]): boolean {
  if (!lastUpdated?.toDate) return false
  return Date.now() - lastUpdated.toDate().getTime() < 5 * 60 * 1000
}

export default function AdminPanelPage() {
  const { session, isLoading } = useAuth()
  const router = useRouter()

  const isAdmin = !isLoading && ADMIN_PHONES.includes(session?.phone ?? "")

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    router.replace("/login")
    return null
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
          <Shield className="h-10 w-10 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white">غير مصرح بالدخول</h1>
        <p className="text-sm text-slate-400">هذه اللوحة مخصصة للمسؤولين فقط</p>
        <button
          onClick={() => router.replace("/")}
          className="mt-2 rounded-xl bg-slate-800 px-6 py-3 text-sm font-medium text-white"
        >
          العودة للرئيسية
        </button>
      </div>
    )
  }

  return <AdminDashboard onExit={() => router.replace("/")} />
}

function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("fleet")
  const [users, setUsers] = useState<UserRecord[]>([])
  const [buses, setBuses] = useState<BusRecord[]>([])
  const [busCount, setBusCount] = useState(0)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "Buses"), (snap) => {
      const list: BusRecord[] = []
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<BusRecord, "id">) }))
      setBuses(list)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list: UserRecord[] = []
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<UserRecord, "id">) }))
      setUsers(list)
      setLoadingUsers(false)
    })
    return () => unsub()
  }, [])

  const drivers = useMemo(() => users.filter((u) => u.role === "driver"), [users])
  const passengers = useMemo(() => users.filter((u) => u.role !== "driver"), [users])
  const totalBalance = useMemo(() => users.reduce((s, u) => s + (u.balance ?? 0), 0), [users])
  const totalWholesale = useMemo(() => drivers.reduce((s, d) => s + (d.wholesaleBalance ?? 0), 0), [drivers])

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Fixed Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">لوحة الإدارة</h1>
              <p className="text-[10px] text-slate-400">Admin Control Center</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
          >
            <LogOut className="h-4 w-4" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      <main className="px-4 pb-12 pt-20">
        {/* Quick Stats Bar */}
        <motion.div
          className="mb-5 grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {[
            { label: "حافلات نشطة", value: busCount, icon: Bus, color: "text-primary" },
            { label: "إجمالي المستخدمين", value: users.length, icon: UserCheck, color: "text-blue-400" },
            { label: "الرصيد الكلي", value: `${totalBalance.toLocaleString("ar-DZ")} د`, icon: TrendingUp, color: "text-amber-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl bg-slate-800 p-3 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <stat.icon className={`mx-auto mb-1 h-5 w-5 ${stat.color}`} />
              <p className="text-sm font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Bar */}
        <motion.div
          className="mb-5 flex rounded-2xl bg-slate-800 p-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "fleet" && (
            <FleetTab key="fleet" buses={buses} busCount={busCount} onBusCount={setBusCount} />
          )}
          {activeTab === "finance" && (
            <FinanceTab
              key="finance"
              drivers={drivers}
              totalBalance={totalBalance}
              totalWholesale={totalWholesale}
              loading={loadingUsers}
            />
          )}
          {activeTab === "users" && (
            <UsersTab key="users" passengers={passengers} loading={loadingUsers} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function FleetTab({
  buses,
  busCount,
  onBusCount,
}: {
  buses: BusRecord[]
  busCount: number
  onBusCount: (n: number) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Live Map */}
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-white">خريطة الأسطول المباشرة</span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {busCount} نشط
          </span>
        </div>
        <div className="h-[320px]">
          <FleetMap onBusCount={onBusCount} />
        </div>
      </div>

      {/* Bus Cards */}
      <div className="rounded-2xl bg-slate-800 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <Bus className="h-4 w-4 text-primary" />
          قائمة الحافلات
        </h3>
        {buses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Bus className="mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">لا توجد حافلات مسجلة</p>
          </div>
        ) : (
          <div className="space-y-2">
            {buses.map((bus, i) => {
              const live = isLive(bus.lastUpdated)
              return (
                <motion.div
                  key={bus.id}
                  className="flex items-center gap-3 rounded-xl bg-slate-700/50 p-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${live ? "bg-primary/20" : "bg-slate-600/40"}`}>
                    <Bus className={`h-4 w-4 ${live ? "text-primary" : "text-slate-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{bus.name ?? bus.id}</p>
                    {bus.latitude && bus.longitude && (
                      <p className="text-[10px] text-slate-500" dir="ltr">
                        {bus.latitude.toFixed(4)}, {bus.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <div className="text-left">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${live ? "bg-primary/20 text-primary" : "bg-slate-700 text-slate-500"}`}>
                      {live ? "● مباشر" : "○ غير نشط"}
                    </span>
                    <p className="mt-0.5 text-right text-[10px] text-slate-600">
                      {timeSince(bus.lastUpdated)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function FinanceTab({
  drivers,
  totalBalance,
  totalWholesale,
  loading,
}: {
  drivers: UserRecord[]
  totalBalance: number
  totalWholesale: number
  loading: boolean
}) {
  const [refillTarget, setRefillTarget] = useState<UserRecord | null>(null)
  const [refillAmount, setRefillAmount] = useState("")
  const [refillState, setRefillState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [refillMsg, setRefillMsg] = useState("")

  const handleRefill = useCallback(async () => {
    const amount = parseInt(refillAmount)
    if (!refillTarget || !amount || amount <= 0) return
    setRefillState("loading")
    try {
      await updateDoc(doc(db, "users", refillTarget.id), {
        wholesaleBalance: increment(amount),
        lastRefilled: serverTimestamp(),
      })
      setRefillState("success")
      setRefillMsg(`تم شحن ${amount} د.ج لـ ${refillTarget.fullName ?? refillTarget.id}`)
      setTimeout(() => { setRefillTarget(null); setRefillState("idle"); setRefillAmount("") }, 2000)
    } catch (e) {
      setRefillState("error")
      setRefillMsg(e instanceof Error ? e.message : "حدث خطأ")
    }
  }, [refillTarget, refillAmount])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* System Overview */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-700 p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
          <span className="font-bold text-primary-foreground">نظرة مالية شاملة</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "رصيد المسافرين الكلي", value: `${totalBalance.toLocaleString("ar-DZ")} د.ج` },
            { label: "رصيد الجملة للسائقين", value: `${totalWholesale.toLocaleString("ar-DZ")} د.ج` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-primary-foreground/10 p-3">
              <p className="text-xs text-primary-foreground/70">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-primary-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Driver List */}
      <div className="rounded-2xl bg-slate-800 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <UserCheck className="h-4 w-4 text-primary" />
          السائقون ({drivers.length})
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : drivers.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">لا يوجد سائقون مسجلون</p>
        ) : (
          <div className="space-y-2">
            {drivers.map((driver, i) => (
              <motion.div
                key={driver.id}
                className="flex items-center gap-3 rounded-xl bg-slate-700/50 p-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{driver.fullName ?? driver.id}</p>
                  <p className="text-xs text-slate-500" dir="ltr">{driver.Phone ?? driver.phone ?? driver.id}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-400">{(driver.wholesaleBalance ?? 0).toLocaleString("ar-DZ")} د.ج</p>
                  <p className="text-[10px] text-slate-600">رصيد الجملة</p>
                </div>
                <button
                  onClick={() => { setRefillTarget(driver); setRefillAmount(""); setRefillState("idle") }}
                  className="mr-1 flex items-center gap-1 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
                >
                  <RefreshCw className="h-3 w-3" />
                  شحن
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Refill Modal */}
      <AnimatePresence>
        {refillTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) { setRefillTarget(null); setRefillState("idle") } }}
          >
            <motion.div
              className="w-full max-w-md rounded-t-3xl bg-slate-900 p-6 pb-10"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">شحن رصيد السائق</h2>
                <button onClick={() => { setRefillTarget(null); setRefillState("idle") }} className="rounded-full bg-slate-800 p-2 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white">{refillTarget.fullName ?? refillTarget.id}</p>
                  <p className="text-xs text-slate-500">رصيد حالي: {(refillTarget.wholesaleBalance ?? 0).toLocaleString("ar-DZ")} د.ج</p>
                </div>
              </div>

              {refillState === "success" ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                  <p className="font-medium text-white">{refillMsg}</p>
                </div>
              ) : refillState === "error" ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <p className="text-sm text-red-400">{refillMsg}</p>
                  <button onClick={() => setRefillState("idle")} className="mt-1 text-xs text-slate-400 underline">حاول مجدداً</button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="mb-2 block text-sm text-slate-400">المبلغ (د.ج)</label>
                    <input
                      type="number"
                      value={refillAmount}
                      onChange={(e) => setRefillAmount(e.target.value)}
                      placeholder="أدخل المبلغ"
                      className="w-full rounded-xl bg-slate-800 px-4 py-3 text-right text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-primary"
                      dir="rtl"
                    />
                    <div className="mt-2 flex gap-2">
                      {[500, 1000, 2000, 5000].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setRefillAmount(preset.toString())}
                          className="flex-1 rounded-lg bg-slate-700 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-600"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleRefill}
                    disabled={!refillAmount || parseInt(refillAmount) <= 0 || refillState === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-primary-foreground disabled:opacity-50"
                  >
                    {refillState === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                    <span>{refillState === "loading" ? "جاري الشحن…" : "تأكيد الشحن"}</span>
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function UsersTab({ passengers, loading }: { passengers: UserRecord[]; loading: boolean }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return passengers
    return passengers.filter(
      (u) =>
        (u.fullName ?? "").toLowerCase().includes(q) ||
        (u.Phone ?? u.phone ?? u.id).includes(q)
    )
  }, [passengers, query])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Search */}
      <div className="flex items-center gap-3 rounded-2xl bg-slate-800 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث بالاسم أو رقم الهاتف…"
          className="flex-1 bg-transparent text-right text-sm text-white placeholder-slate-600 outline-none"
          dir="rtl"
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X className="h-4 w-4 text-slate-500" />
          </button>
        )}
      </div>

      {/* User List */}
      <div className="rounded-2xl bg-slate-800 p-4">
        <h3 className="mb-3 flex items-center justify-between text-sm font-bold text-white">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            المسافرون
          </span>
          <span className="text-xs font-normal text-slate-500">{filtered.length} مستخدم</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500">
            <Users className="mb-2 h-10 w-10 opacity-40" />
            <p className="text-sm">{query ? "لا توجد نتائج" : "لا يوجد مستخدمون"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((user, i) => (
              <motion.div
                key={user.id}
                className="flex items-center gap-3 rounded-xl bg-slate-700/50 p-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                  {(user.fullName ?? "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user.fullName ?? "مستخدم"}</p>
                  <p className="text-[10px] text-slate-500" dir="ltr">{user.Phone ?? user.phone ?? user.id}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-primary">{(user.balance ?? 0).toLocaleString("ar-DZ")} د.ج</p>
                  <p className="text-[10px] text-slate-600">الرصيد</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import { LayoutGrid, FileText, Settings as SettingsIcon, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { auth } from "@/firebase"
import { signOut } from "firebase/auth"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Settings from "@/components/settings"
import Navbar from "@/components/navbar"

type FormItem = {
  _id: string
  title: string
  createdAt: string
}

type SubmissionItem = {
  _id: string
  name?: string
  email?: string
  createdAt: string
}

type SectionKey = "dashboard" | "forms" | "settings"

export default function AdminDashboardPage() {
  const [forms, setForms] = useState<FormItem[]>([])
  const [selectedForm, setSelectedForm] = useState<FormItem | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard")
  const [stats, setStats] = useState<{ totalForms: number; totalSubmissions?: number; activeUsers?: number }>({
    totalForms: 0,
  })

  const mainRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchForms = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/forms")
      if (!res.ok) throw new Error("Failed to load forms")
      const response = await res.json()
      const data = response.data || response as FormItem[]
      setForms(data)
      setStats((s) => ({ ...s, totalForms: data.length }))
    } catch (e: any) {
      setError(e?.message ?? "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial load of forms
    fetchForms()
  }, [])

  // Refresh forms when page becomes visible (e.g., coming back from form builder)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchForms()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    // animate container mount
    if (!mainRef.current) return
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
    )
  }, [])

  useEffect(() => {
    // animate view switch
    const target = selectedForm ? tableRef.current : listRef.current
    if (!target) return
    gsap.fromTo(
      target,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" },
    )
  }, [selectedForm])

  useEffect(() => {
    const target = document.getElementById(`section-${activeSection}`)
    if (!target) return
    gsap.fromTo(target, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" })
  }, [activeSection])

  const filteredForms = useMemo(() => {
    if (!search) return forms
    const q = search.toLowerCase()
    return forms.filter((f) => f.title?.toLowerCase().includes(q))
  }, [forms, search])

  const handleViewSubmissions = async (form: FormItem) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/forms/${form._id}/submissions`)
      if (!res.ok) throw new Error("Failed to load submissions")
      const response = await res.json()
      const data = response.data?.submissions || response.submissions || response as SubmissionItem[]
      setSubmissions(data)
      setSelectedForm(form)
    } catch (e: any) {
      setError(e?.message ?? "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToForms = () => {
    setSelectedForm(null)
    setSubmissions([])
  }

  const handleDeleteForm = async (formId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/forms?id=${formId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete form")
      setForms((prev) => prev.filter((f) => f._id !== formId))
      if (selectedForm?._id === formId) handleBackToForms()
    } catch (e: any) {
      setError(e?.message ?? "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => 
    signOut(auth)
      .then(() => {
        toast.success("Signed out successfully")
        router.push("/")
      })
      .catch((err) => toast.error(err.message || "Logout failed"))

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div ref={mainRef} className="mx-auto grid min-h-screen w-full grid-cols-1 md:grid-cols-[240px_1fr] pt-16">
        {/* Sidebar */}
        <aside className="bg-gradient-to-b from-black to-neutral-900 text-white flex flex-col pt-4">
          <div className="flex h-16 items-center px-5 font-semibold tracking-tight">Formify Admin</div>
          <nav className="space-y-1 px-3 pb-6 flex-1">
            <SidebarLink
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Dashboard"
              active={activeSection === "dashboard"}
              onClick={() => {
                setSelectedForm(null)
                setActiveSection("dashboard")
              }}
            />
            <SidebarLink
              icon={<FileText className="h-4 w-4" />}
              label="Forms"
              active={activeSection === "forms"}
              onClick={() => setActiveSection("forms")}
            />
            <SidebarLink
              icon={<SettingsIcon className="h-4 w-4" />}
              label="Settings"
              active={activeSection === "settings"}
              onClick={() => {
                setSelectedForm(null)
                setActiveSection("settings")
              }}
            />
          </nav>
          <div className="p-3 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main */}
        <section className="relative bg-white pt-4">
          <header className="flex items-center justify-between border-b border-black/10 px-6 py-4">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold md:text-2xl">
                {selectedForm
                  ? selectedForm.title
                  : activeSection === "dashboard"
                  ? "Dashboard"
                  : activeSection === "forms"
                  ? "Forms"
                  : "Settings"}
              </h1>
              <p className="text-xs text-black/60 md:text-sm">
                {selectedForm
                  ? "Viewing submissions"
                  : activeSection === "dashboard"
                  ? "Overview and quick stats"
                  : activeSection === "forms"
                  ? "All your forms at a glance"
                  : "Configure your workspace"}
              </p>
            </div>
            {!selectedForm && activeSection === "forms" && (
              <div className="hidden items-center gap-2 md:flex">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search forms..."
                  className="w-56 border-black/20"
                />
              </div>
            )}
          </header>

          {/* Content */}
          <div className="px-4 py-6 md:px-6">
            {/* Dashboard Section */}
            {activeSection === "dashboard" && (
              <div id="section-dashboard" className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard title="Total Forms" value={stats.totalForms} />
                  <StatCard title="Total Submissions" value={stats.totalSubmissions ?? "—"} />
                  <StatCard title="Active Users" value={stats.activeUsers ?? "—"} />
                </div>
                <Card className="rounded-2xl border-black/10 p-6 shadow-sm">
                  <div className="text-sm text-black/70">
                    Welcome to your dashboard. Use the sidebar to manage forms and settings.
                  </div>
                </Card>
              </div>
            )}

            {/* Forms Section */}
            {activeSection === "forms" && !selectedForm && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Forms</h2>
                  <Button
                    onClick={fetchForms}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <div ref={listRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading && <PlaceholderCard>Loading forms...</PlaceholderCard>}
                {error && <PlaceholderCard>{error}</PlaceholderCard>}
                {!isLoading && !error && filteredForms.length === 0 && (
                  <PlaceholderCard>No forms found</PlaceholderCard>
                )}
                {filteredForms.map((form, idx) => (
                  <Card
                    key={form._id}
                    className="flex flex-col gap-4 rounded-2xl border-black/10 p-5 shadow-sm transition-transform duration-200 hover:scale-[1.01] hover:shadow-md"
                    ref={(el) => {
                      if (el) {
                        gsap.fromTo(
                          el,
                          { opacity: 0, y: 10 },
                          { opacity: 1, y: 0, delay: 0.03 * idx, duration: 0.25, ease: "power2.out" },
                        )
                      }
                    }}
                  >
                    <div className="space-y-1">
                      <div className="line-clamp-2 text-base font-semibold md:text-lg">{form.title || "Untitled"}</div>
                      <div className="text-xs text-black/60">
                        Created {new Date(form.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Button onClick={() => handleViewSubmissions(form)} className="h-9 px-3 bg-blue-600 hover:bg-blue-700">
                        View Submissions
                      </Button>
                      <Button variant="outline" className="h-9 px-3 border-blue-200 text-blue-700 hover:bg-blue-50">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9 px-3 border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteForm(form._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
                </div>
              </div>
            )}

            {/* Submissions view (within Forms section) */}
            {activeSection === "forms" && selectedForm && (
              <div ref={tableRef} className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" className="h-9 px-3 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={handleBackToForms}>
                    Back to Forms
                  </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-black/10">
                  <div className="max-h-[60vh] overflow-auto">
                    <table className="min-w-full divide-y divide-black/10">
                      <thead className="bg-black/5">
                        <tr>
                          <Th className="w-[30%]">Name</Th>
                          <Th className="w-[30%]">Email</Th>
                          <Th className="w-[40%]">Submitted At</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10 bg-white">
                        {isLoading && (
                          <tr>
                            <Td colSpan={3}>Loading submissions...</Td>
                          </tr>
                        )}
                        {error && (
                          <tr>
                            <Td colSpan={3}>{error}</Td>
                          </tr>
                        )}
                        {!isLoading && !error && submissions.length === 0 && (
                          <tr>
                            <Td colSpan={3}>No submissions yet</Td>
                          </tr>
                        )}
                        {submissions.map((s) => (
                          <tr key={s._id} className="hover:bg-black/2.5">
                            <Td>{s.name || "-"}</Td>
                            <Td>{s.email || "-"}</Td>
                            <Td>{new Date(s.createdAt).toLocaleString()}</Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <div id="section-settings">
                <Settings />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function SidebarLink({ label, active, icon, onClick }: { label: string; active?: boolean; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2",
        active
          ? "bg-white/10 text-white ring-1 ring-blue-500/40 shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
          : "text-white/80 hover:bg-white/10 hover:text-white",
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card className="rounded-2xl border-black/10 p-6 shadow-sm transition-transform duration-200 hover:scale-[1.01] hover:shadow-md">
      <div className="text-xs font-medium uppercase tracking-wide text-blue-700/80">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{String(value)}</div>
    </Card>
  )
}

function PlaceholderCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border-black/10 p-6 text-sm text-black/70">{children}</Card>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-black/60",
        className,
      )}
    >
      {children}
    </th>
  )
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return <td className="px-4 py-3 text-sm text-black/80" colSpan={colSpan}>{children}</td>
}



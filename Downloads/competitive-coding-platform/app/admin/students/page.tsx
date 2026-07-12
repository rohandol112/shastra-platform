"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffGuard } from "@/components/admin-guard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Users,
  Upload,
  Search,
  Loader2,
  Plus,
  GraduationCap,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  KeyRound,
} from "lucide-react"
import { useAuthStore, isAdminRole } from "@/lib/stores/auth-store"
import {
  collegesApi,
  ApiError,
  type College,
  type StudentRow,
  type Pagination,
  type BulkImportResult,
} from "@/lib/api"

interface ParsedStudent {
  uid: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

// Accepts CSV with a header row (uid,firstName,lastName,email,phone in any
// order) or headerless rows where the first column is the UID.
function parseStudentsCsv(text: string): { students: ParsedStudent[]; problems: string[] } {
  const problems: string[] = []
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return { students: [], problems: ["File is empty"] }

  const splitLine = (line: string) => line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""))

  const headerCells = splitLine(lines[0]).map((c) => c.toLowerCase().replace(/[^a-z]/g, ""))
  const knownHeaders = ["uid", "userid", "rollno", "roll", "firstname", "lastname", "name", "email", "phone"]
  const hasHeader = headerCells.some((c) => knownHeaders.includes(c))

  let idx = { uid: 0, firstName: 1, lastName: 2, email: 3, phone: 4 }
  if (hasHeader) {
    const find = (...names: string[]) => {
      const i = headerCells.findIndex((c) => names.includes(c))
      return i
    }
    idx = {
      uid: Math.max(0, find("uid", "userid", "rollno", "roll")),
      firstName: find("firstname", "name"),
      lastName: find("lastname"),
      email: find("email"),
      phone: find("phone"),
    }
  }

  const students: ParsedStudent[] = []
  const seen = new Set<string>()
  const dataLines = hasHeader ? lines.slice(1) : lines

  dataLines.forEach((line, i) => {
    const cells = splitLine(line)
    const uid = cells[idx.uid]?.trim()
    if (!uid) {
      problems.push(`Row ${i + 1}: missing UID`)
      return
    }
    if (seen.has(uid.toLowerCase())) {
      problems.push(`Row ${i + 1}: duplicate UID "${uid}"`)
      return
    }
    seen.add(uid.toLowerCase())

    const email = idx.email >= 0 ? cells[idx.email]?.trim() : undefined
    students.push({
      uid,
      firstName: idx.firstName >= 0 ? cells[idx.firstName]?.trim() || undefined : undefined,
      lastName: idx.lastName >= 0 ? cells[idx.lastName]?.trim() || undefined : undefined,
      email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
      phone: idx.phone >= 0 ? cells[idx.phone]?.trim() || undefined : undefined,
    })
  })

  return { students, problems }
}

export default function StudentsPageWrapper() {
  return (
    <StaffGuard>
      <StudentsPage />
    </StaffGuard>
  )
}

function StudentsPage() {
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = isAdminRole(user)

  // College state
  const [colleges, setColleges] = useState<College[]>([])
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("")
  const [newCollege, setNewCollege] = useState({ name: "", code: "" })
  const [collegeDialogOpen, setCollegeDialogOpen] = useState(false)
  const [creatingCollege, setCreatingCollege] = useState(false)

  // Import state
  const [csvText, setCsvText] = useState("")
  const [sharedPassword, setSharedPassword] = useState("")
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)

  // Students list state
  const [students, setStudents] = useState<StudentRow[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [listLoading, setListLoading] = useState(false)

  const parsed = useMemo(() => (csvText.trim() ? parseStudentsCsv(csvText) : null), [csvText])

  // Load colleges for super admins (staff are pinned to their own college)
  useEffect(() => {
    if (!isSuperAdmin) return
    collegesApi
      .list()
      .then((data) => {
        setColleges(data.colleges)
        if (data.colleges.length > 0 && !selectedCollegeId) setSelectedCollegeId(data.colleges[0].id)
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load colleges"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin])

  const effectiveCollegeId = isSuperAdmin ? selectedCollegeId : (user?.collegeId ?? "")

  const loadStudents = useCallback(async () => {
    if (!effectiveCollegeId && isSuperAdmin) return
    setListLoading(true)
    try {
      const data = await collegesApi.students({
        page,
        limit: 50,
        search: search || undefined,
        collegeId: isSuperAdmin ? effectiveCollegeId : undefined,
      })
      setStudents(data.students)
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load students")
    } finally {
      setListLoading(false)
    }
  }, [effectiveCollegeId, isSuperAdmin, page, search])

  useEffect(() => {
    const t = setTimeout(loadStudents, search ? 400 : 0)
    return () => clearTimeout(t)
  }, [loadStudents, search])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (typeof text === "string") setCsvText(text)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleCreateCollege = async () => {
    if (!newCollege.name.trim() || !newCollege.code.trim()) {
      toast.error("Name and code are required")
      return
    }
    setCreatingCollege(true)
    try {
      const created = await collegesApi.create({
        name: newCollege.name.trim(),
        code: newCollege.code.trim().toLowerCase(),
      })
      setColleges((prev) => [created, ...prev])
      setSelectedCollegeId(created.id)
      setCollegeDialogOpen(false)
      setNewCollege({ name: "", code: "" })
      toast.success(`College "${created.name}" created`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create college")
    } finally {
      setCreatingCollege(false)
    }
  }

  const handleImport = async () => {
    if (!parsed || parsed.students.length === 0) {
      toast.error("Add student rows first (upload or paste CSV)")
      return
    }
    if (sharedPassword.length < 6) {
      toast.error("Shared password must be at least 6 characters")
      return
    }
    if (isSuperAdmin && !effectiveCollegeId) {
      toast.error("Select a college first")
      return
    }

    setImporting(true)
    setImportResult(null)
    try {
      const result = await collegesApi.bulkStudents({
        collegeId: isSuperAdmin ? effectiveCollegeId : undefined,
        password: sharedPassword,
        students: parsed.students,
      })
      setImportResult(result)
      toast.success(`Imported ${result.created} students (${result.skipped} already existed)`)
      setCsvText("")
      loadStudents()
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        toast.error(`${err.message}: ${err.errors[0].field} — ${err.errors[0].message}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : "Import failed")
      }
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
                <p className="text-muted-foreground">
                  Bulk-import students — UID becomes the login id, one shared password for the batch
                </p>
              </div>
            </div>

            {isSuperAdmin && (
              <Button variant="outline" onClick={() => setCollegeDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New College
              </Button>
            )}
          </div>

          {/* College picker (super admin only) */}
          {isSuperAdmin && (
            <div className="mb-6">
              <Label className="mb-2 block text-sm text-muted-foreground">College</Label>
              {colleges.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No colleges yet — create one to start importing students.
                </p>
              ) : (
                <Select value={selectedCollegeId} onValueChange={(v) => { setSelectedCollegeId(v); setPage(1) }}>
                  <SelectTrigger className="w-[320px] border-border/50 bg-card/50 text-foreground">
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.code}) — {c.studentCount ?? 0} students
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Import card */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  Import Students
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                    <Upload className="h-4 w-4" />
                    Upload CSV
                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <span className="text-xs text-muted-foreground">or paste rows below</span>
                </div>

                <Textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={"uid,firstName,lastName,email\nTCET101,Aarav,Sharma,aarav@college.edu\nTCET102,Diya,Patel,"}
                  rows={8}
                  className="border-input bg-background font-mono text-sm text-foreground"
                />

                {parsed && (
                  <div className="rounded-lg border border-border bg-background p-3 text-sm">
                    <p className="text-foreground">
                      <CheckCircle2 className="mr-1 inline h-4 w-4 text-success" />
                      {parsed.students.length} students ready to import
                    </p>
                    {parsed.problems.length > 0 && (
                      <div className="mt-2 text-xs text-warning">
                        <AlertTriangle className="mr-1 inline h-3 w-3" />
                        {parsed.problems.length} rows skipped: {parsed.problems.slice(0, 3).join("; ")}
                        {parsed.problems.length > 3 && ` … +${parsed.problems.length - 3} more`}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-foreground">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    Shared password (same for every student in this batch)
                  </Label>
                  <Input
                    type="text"
                    value={sharedPassword}
                    onChange={(e) => setSharedPassword(e.target.value)}
                    placeholder="e.g. Tcet@2026"
                    className="border-input bg-background font-mono text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Students sign in with <span className="font-mono">collegecode_uid</span> + this password, and can
                    change it later from their profile.
                  </p>
                </div>

                <Button onClick={handleImport} disabled={importing || !parsed?.students.length} className="w-full">
                  {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {importing ? "Importing…" : `Import ${parsed?.students.length ?? 0} Students`}
                </Button>

                {importResult && (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm">
                    <p className="font-medium text-foreground">
                      Imported {importResult.created} · Skipped {importResult.skipped} (already existed) · Failed{" "}
                      {importResult.failed}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{importResult.loginHint}</p>
                    {importResult.errors.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-xs text-destructive">
                        {importResult.errors.slice(0, 5).map((e) => (
                          <li key={e.uid}>
                            {e.uid}: {e.reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students list */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  Students
                  {pagination && (
                    <Badge variant="secondary" className="ml-2 bg-secondary/50">
                      {pagination.total}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by UID or name…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="border-input bg-background pl-9 text-foreground"
                  />
                </div>

                {listLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : students.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No students yet — import your first batch.
                  </p>
                ) : (
                  <div className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
                    {students.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-mono font-medium text-foreground">{s.uid ?? s.username}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[s.firstName, s.lastName].filter(Boolean).join(" ") || "—"}
                            {s.email ? ` · ${s.email}` : ""}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            s.isActive
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-destructive/30 bg-destructive/10 text-destructive"
                          }
                        >
                          {s.isActive ? "active" : "disabled"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-3 text-sm">
                    <button
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    <span className="text-muted-foreground">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Create college dialog */}
      <Dialog open={collegeDialogOpen} onOpenChange={setCollegeDialogOpen}>
        <DialogContent className="border-border/50 bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create College</DialogTitle>
            <DialogDescription>
              The code prefixes every student username (e.g. code "tcet" → login "tcet_TCET101").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground">Name</Label>
              <Input
                value={newCollege.name}
                onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                placeholder="Thakur College of Engineering"
                className="border-input bg-background text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Code</Label>
              <Input
                value={newCollege.code}
                onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value.toLowerCase() })}
                placeholder="tcet"
                className="border-input bg-background font-mono text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollegeDialogOpen(false)} disabled={creatingCollege}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollege} disabled={creatingCollege}>
              {creatingCollege && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

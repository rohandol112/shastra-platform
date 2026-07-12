// API client for the SHASTRA coding-platform backend.
// All shapes below mirror the Express backend (coding-platform) responses.

// By default all requests go through the Next.js same-origin proxy (/backend →
// BACKEND_URL, see next.config.mjs). That avoids CORS entirely and lets an
// HTTPS frontend (e.g. Vercel) talk to the plain-HTTP backend without the
// browser blocking mixed content. Set NEXT_PUBLIC_API_URL to call it directly.
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "/backend").replace(/\/+$/, "")
const API_BASE = API_ORIGIN + "/api"

// ---------- Shared types ----------

export interface FieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  status: number
  errors?: FieldError[]
  retryAfter?: number

  constructor(status: number, message: string, errors?: FieldError[], retryAfter?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
    this.retryAfter = retryAfter
  }
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD"
export type UserRole = "USER" | "ADMIN" | "MODERATOR" | "COLLEGE_ADMIN" | "TEACHER"
export type ContestStatus = "DRAFT" | "SCHEDULED" | "RUNNING" | "ENDED" | "CANCELLED"
export type ContestType = "PUBLIC" | "PRIVATE" | "COLLEGE"
export type SubmissionStatus =
  | "QUEUED"
  | "RUNNING"
  | "COMPILE_ERROR"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "MEMORY_LIMIT_EXCEEDED"
  | "ACCEPTED"
  | "PARTIAL"
  | "FAILED"

export interface AuthUser {
  id: string
  username: string
  email: string | null
  phone?: string | null
  firstName: string | null
  lastName: string | null
  avatar?: string | null
  role: UserRole
  gender?: string | null
  collegeName?: string | null
  isActive?: boolean
  isVerified?: boolean
  createdAt?: string
  collegeId?: string | null
  uid?: string | null
}

export interface College {
  id: string
  name: string
  code: string
  isActive: boolean
  createdAt: string
  studentCount?: number
  staffCount?: number
}

export interface StudentRow {
  id: string
  uid: string | null
  username: string
  email: string | null
  phone: string | null
  firstName: string | null
  lastName: string | null
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface BulkImportResult {
  created: number
  skipped: number
  failed: number
  total: number
  errors: { uid: string; reason: string }[]
  loginHint: string
}

export interface ProblemListItem {
  id: string
  title: string
  slug: string
  difficulty: Difficulty
  tags: string[]
  timeLimit: number
  memoryLimit: number
  createdAt: string
  totalSubmissions: number
  acceptedCount: number
  acceptanceRate: number
  isSolved?: boolean
}

export interface SampleTestCase {
  id: string
  input: string
  expectedOutput: string
  explanation?: string | null
  orderIndex: number
}

export interface ProblemExample {
  input: string
  output: string
  explanation?: string
}

export interface ProblemDetail {
  id: string
  title: string
  slug: string
  difficulty: Difficulty
  tags: string[]
  statement: string
  inputFormat?: string | null
  outputFormat?: string | null
  constraints?: string | null
  examples?: ProblemExample[] | null
  hints?: string | null
  timeLimit: number
  memoryLimit: number
  sampleTestCases: SampleTestCase[]
  hasEditorial: boolean
  hintsAvailable: number
  totalSubmissions: number
  acceptedCount: number
  acceptanceRate: number
  userSolved: boolean
  userAttempts: number
}

export interface ContestListItem {
  id: string
  title: string
  slug: string
  description: string
  startTime: string
  endTime: string
  duration: number
  type: ContestType
  status: ContestStatus
  maxParticipants?: number | null
  registrationDeadline?: string | null
  participantCount: number
  problemCount: number
}

export interface ContestProblemItem {
  problemId: string
  title: string
  slug: string
  difficulty: Difficulty
  points: number
  bonusPoints: number
  orderIndex: number
  timeLimit: number
  memoryLimit: number
  solvedCount: number
}

export interface ContestDetail extends ContestListItem {
  rules?: string | null
  prizes?: string | null
  problems: ContestProblemItem[]
  isRegistered: boolean
  isFinished: boolean
  userRank: number | null
  userScore: number
}

export interface LeaderboardUser {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  avatar?: string | null
}

export interface ContestLeaderboardEntry {
  rank: number
  user: LeaderboardUser
  score: number
  penalty: number
  problemsSolved: number
  lastSubmissionAt: string | null
}

export interface GlobalLeaderboardEntry {
  rank: number
  user: LeaderboardUser
  problemsSolved: number
  totalScore: number
  contestsParticipated: number
}

export interface SubmissionSummary {
  id: string
  status: SubmissionStatus
  language: string
  time?: number | null
  memory?: number | null
  score?: number | null
  createdAt: string
  judgedAt?: string | null
  problem?: { id: string; title: string; slug: string; difficulty?: Difficulty }
}

export interface SubmissionDetail extends SubmissionSummary {
  userId: string
  problemId: string
  contestId?: string | null
  code?: string
  stdout?: string | null
  stderr?: string | null
  compileOutput?: string | null
  testCaseResults?: { testCaseId: string; status: string; time?: number; memory?: number }[] | null
  isOwner?: boolean
  contest?: { id: string; title: string; slug: string } | null
}

export interface RunResult {
  runId: string
  status: string
  language: string
  time: number
  memory: number
  stdout: string | null
  stderr: string | null
  compilationError: string | null
}

export interface MyStatistics {
  totalSubmissions: number
  acceptedSubmissions: number
  problemsSolved: number
  contestsParticipated: number
  acceptanceRate: number
}

export interface MyProfile extends AuthUser {
  statistics: MyStatistics
  recentSubmissions: SubmissionSummary[]
}

export interface ActivityDay {
  date: string
  submissions: number
  accepted: number
}

export interface UserRank {
  globalRank: number | null
  totalUsers: number
  score: number
  problemsSolved: number
  percentile: number
}

export interface PublicProfile {
  username: string
  firstName: string | null
  lastName: string | null
  avatar?: string | null
  memberSince: string
  statistics: {
    problemsSolved: number
    totalSubmissions: number
    contestsParticipated: number
    easyProblems: number
    mediumProblems: number
    hardProblems: number
  }
  recentSubmissions: {
    problemTitle: string
    problemSlug: string
    difficulty: Difficulty
    status: SubmissionStatus
    language: string
    createdAt: string
  }[]
}

// ---------- Admin (dashboard) types ----------

export interface AdminUser {
  id: string
  email: string | null
  username: string
  firstName: string | null
  lastName: string | null
  phone?: string | null
  role: UserRole
  isActive: boolean
  isVerified: boolean
  lastLoginAt: string | null
  createdAt: string
  submissionCount?: number
  contestCount?: number
  // raw shape the backend actually sends on the list endpoint — normalized
  // into submissionCount/contestCount by adminApi.users() below
  _count?: { submissions?: number; contestParticipations?: number }
}

export interface AdminAnalytics {
  users: { total: number; active: number }
  problems: { total: number; published: number }
  contests: { total: number; active: number }
  submissions: { total: number; today: number }
  recentUsers: { id: string; username: string; email: string; createdAt: string }[]
  popularProblems: {
    id: string
    title: string
    slug: string
    submissionCount: number
    _count?: { submissions?: number }
  }[]
  upcomingContests: { id: string; title: string; startTime: string }[]
}

export interface AdminProblem {
  id: string
  title: string
  slug: string
  difficulty: Difficulty
  tags?: string[]
  isPublic: boolean
  submissionCount?: number
  createdAt: string
  _count?: { submissions?: number; testCases?: number }
}

export interface AdminTestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
  points: number
  orderIndex: number
}

export interface AdminSubmissionUser {
  id: string
  email: string | null
  username: string
  firstName: string | null
  lastName: string | null
}

export interface AdminSubmissionProblem {
  id: string
  title: string
  slug: string
  difficulty: Difficulty
  timeLimit?: number
  memoryLimit?: number
}

export interface TestCaseResult {
  testCaseId: string
  status: string
  time: number
  memory: number
  points: number
}

export interface AdminSubmissionListItem {
  id: string
  userId: string
  problemId: string
  contestId: string | null
  language: string
  status: SubmissionStatus
  score: number | null
  time: number | null
  memory: number | null
  createdAt: string
  judgedAt: string | null
  user: AdminSubmissionUser
  problem: AdminSubmissionProblem
}

export interface AdminSubmissionDetail extends AdminSubmissionListItem {
  code: string
  stdout: string | null
  stderr: string | null
  compileOutput: string | null
  testCaseResults: TestCaseResult[] | null
}

// ---------- Core fetch helper ----------

let authToken: string | null = null

/** Called by the auth store whenever the token changes. */
export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken() {
  return authToken
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  query?: Record<string, string | number | boolean | undefined | null>
  signal?: AbortSignal
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal } = options

  let url = `${API_BASE}${path}`
  if (query) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value))
      }
    }
    const qs = params.toString()
    if (qs) url += `?${qs}`
  }

  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.")
  }

  let payload: any = null
  try {
    payload = await response.json()
  } catch {
    // non-JSON response (e.g. 502 from proxy)
  }

  if (!response.ok) {
    const message =
      payload?.message || `Request failed with status ${response.status}`
    throw new ApiError(response.status, message, payload?.errors, payload?.data?.retryAfter)
  }

  return (payload?.data ?? payload) as T
}

// ---------- Auth ----------

export const authApi = {
  register(data: {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    username?: string
    phone?: string
  }) {
    return request<{ user: AuthUser; token: string }>("/portal/auth/jwt/register", {
      method: "POST",
      body: data,
    })
  },

  login(identifier: string, password: string) {
    return request<{ user: AuthUser; token: string }>("/portal/auth/jwt/login", {
      method: "POST",
      body: { identifier, password },
    })
  },

  profile() {
    return request<AuthUser>("/portal/auth/jwt/profile")
  },

  changePassword(oldPassword: string, newPassword: string, confirmNewPassword: string) {
    return request<void>("/portal/auth/jwt/change-password", {
      method: "PUT",
      body: { oldPassword, newPassword, confirmNewPassword },
    })
  },
}

// ---------- Problems ----------

export const problemsApi = {
  list(params: {
    page?: number
    limit?: number
    difficulty?: Difficulty
    tags?: string
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {}) {
    return request<{ problems: ProblemListItem[]; pagination: Pagination }>("/portal/problems", {
      query: params,
    })
  },

  bySlug(slug: string) {
    return request<ProblemDetail>(`/portal/problems/${encodeURIComponent(slug)}`)
  },

  async tags() {
    // Backend wraps this as { tags: [...] }, not a bare array.
    const result = await request<{ tags: { tag: string; count: number }[] }>("/portal/problems/tags")
    return result.tags
  },

  solved() {
    return request<{ count: number; problemIds: string[] }>("/portal/problems/solved")
  },
}

// ---------- Contests ----------

export const contestsApi = {
  list(params: {
    page?: number
    limit?: number
    status?: ContestStatus
    type?: ContestType
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {}) {
    return request<{ contests: ContestListItem[]; pagination: Pagination }>("/portal/contests", {
      query: params,
    })
  },

  bySlug(slug: string) {
    return request<ContestDetail>(`/portal/contests/${encodeURIComponent(slug)}`)
  },

  register(contestId: string) {
    return request<unknown>(`/portal/contests/${contestId}/register`, { method: "POST" })
  },

  unregister(contestId: string) {
    return request<unknown>(`/portal/contests/${contestId}/register`, { method: "DELETE" })
  },

  finish(contestId: string) {
    return request<unknown>(`/portal/contests/${contestId}/finish`, { method: "POST" })
  },

  leaderboard(contestId: string, page = 1, limit = 100) {
    return request<{ leaderboard: ContestLeaderboardEntry[]; pagination: Pagination }>(
      `/portal/contests/${contestId}/leaderboard`,
      { query: { page, limit } }
    )
  },

  my() {
    return request<{ contests: (ContestListItem & { rank: number | null; score: number })[]; pagination: Pagination }>(
      "/portal/contests/my"
    )
  },
}

// ---------- Submissions ----------

export const submissionsApi = {
  create(data: { problemId: string; language: string; code: string; contestId?: string | null }) {
    return request<{ id: string; problemId: string; language: string; status: SubmissionStatus; createdAt: string }>(
      "/portal/submissions",
      { method: "POST", body: data }
    )
  },

  run(data: { language: string; code: string; stdin?: string }) {
    return request<RunResult>("/portal/submissions/run", { method: "POST", body: data })
  },

  byId(submissionId: string) {
    return request<SubmissionDetail>(`/portal/submissions/${submissionId}`)
  },

  my(params: {
    page?: number
    limit?: number
    problemId?: string
    contestId?: string
    status?: SubmissionStatus
    language?: string
  } = {}) {
    return request<{ submissions: SubmissionSummary[]; pagination: Pagination }>(
      "/portal/submissions/my",
      { query: params }
    )
  },

  /** Poll a submission until it leaves QUEUED/RUNNING (or times out). */
  async waitForVerdict(
    submissionId: string,
    { timeoutMs = 90_000, intervalMs = 1500 }: { timeoutMs?: number; intervalMs?: number } = {}
  ): Promise<SubmissionDetail> {
    const started = Date.now()
    // small initial delay so fast verdicts land on the first poll
    await new Promise((r) => setTimeout(r, 1000))
    for (;;) {
      const submission = await submissionsApi.byId(submissionId)
      if (submission.status !== "QUEUED" && submission.status !== "RUNNING") {
        return submission
      }
      if (Date.now() - started > timeoutMs) {
        return submission // still pending — caller shows "judging" state
      }
      await new Promise((r) => setTimeout(r, intervalMs))
    }
  },
}

// ---------- Users & leaderboard ----------

export const usersApi = {
  me() {
    return request<MyProfile>("/portal/users/me")
  },

  updateMe(data: { firstName?: string; lastName?: string; avatar?: string }) {
    return request<AuthUser>("/portal/users/me", { method: "PUT", body: data })
  },

  async myActivity(months = 12) {
    // Backend wraps this as { activity: [...] }, not a bare array.
    const result = await request<{ activity: ActivityDay[] }>("/portal/users/me/activity", {
      query: { months },
    })
    return result.activity
  },

  myRank() {
    return request<UserRank>("/portal/users/me/rank")
  },

  publicProfile(username: string) {
    return request<PublicProfile>(`/portal/users/${encodeURIComponent(username)}`)
  },
}

export const leaderboardApi = {
  global(params: { page?: number; limit?: number; timeframe?: "ALL_TIME" | "MONTHLY" | "WEEKLY" } = {}) {
    return request<{ leaderboard: GlobalLeaderboardEntry[]; pagination: Pagination }>(
      "/portal/leaderboard",
      { query: params }
    )
  },
}

// ---------- Admin (dashboard) ----------

export const adminApi = {
  async analytics() {
    const result = await request<AdminAnalytics>("/dashboard/analytics/dashboard")
    return {
      ...result,
      // dashboard analytics sends _count.submissions, not submissionCount
      popularProblems: result.popularProblems.map((p) => ({
        ...p,
        submissionCount: p.submissionCount ?? p._count?.submissions ?? 0,
      })),
    }
  },

  submissionStats(params: { startDate?: string; endDate?: string } = {}) {
    return request<{ total: number; byStatus: Record<string, number>; byLanguage: Record<string, number> }>(
      "/dashboard/analytics/submissions",
      { query: params }
    )
  },

  problemStats() {
    return request<{ byDifficulty: Record<string, number>; byTag: Record<string, number> }>(
      "/dashboard/analytics/problems"
    )
  },

  // Users
  async users(params: {
    page?: number
    limit?: number
    role?: UserRole
    isActive?: boolean
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {}) {
    const result = await request<{
      users: AdminUser[]
      pagination?: Pagination
      total?: number
      page?: number
      totalPages?: number
    }>("/dashboard/users", { query: params })
    return {
      ...result,
      // dashboard users list sends _count.{submissions,contestParticipations}, not flat counts
      users: result.users.map((u) => ({
        ...u,
        submissionCount: u.submissionCount ?? u._count?.submissions ?? 0,
        contestCount: u.contestCount ?? u._count?.contestParticipations ?? 0,
      })),
    }
  },

  updateUserRole(userId: string, role: UserRole) {
    return request<AdminUser>(`/dashboard/users/${userId}/role`, { method: "PATCH", body: { role } })
  },

  activateUser(userId: string) {
    return request<void>(`/dashboard/users/${userId}/activate`, { method: "PATCH" })
  },

  deactivateUser(userId: string) {
    return request<void>(`/dashboard/users/${userId}/deactivate`, { method: "PATCH" })
  },

  deleteUser(userId: string) {
    return request<void>(`/dashboard/users/${userId}`, { method: "DELETE" })
  },

  resetPassword(userId: string, password: string) {
    return request<void>(`/dashboard/users/${userId}/password`, { method: "PATCH", body: { password } })
  },

  // Problems
  async problems(params: {
    page?: number
    limit?: number
    difficulty?: Difficulty
    search?: string
    isPublic?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {}) {
    const result = await request<{ problems: AdminProblem[]; pagination?: Pagination; total?: number }>(
      "/dashboard/problems",
      { query: params }
    )
    return {
      ...result,
      // dashboard problems list sends _count.submissions, not submissionCount
      problems: result.problems.map((p) => ({
        ...p,
        submissionCount: p.submissionCount ?? p._count?.submissions ?? 0,
      })),
    }
  },

  createProblem(data: {
    title: string
    slug: string
    difficulty: Difficulty
    tags: string[]
    statement: string
    inputFormat?: string
    outputFormat?: string
    constraints?: string
    examples?: ProblemExample[]
    hints?: string
    timeLimit?: number
    memoryLimit?: number
    isPublic?: boolean
  }) {
    return request<AdminProblem>("/dashboard/problems", { method: "POST", body: data })
  },

  updateProblem(problemId: string, data: Record<string, unknown>) {
    return request<AdminProblem>(`/dashboard/problems/${problemId}`, { method: "PUT", body: data })
  },

  deleteProblem(problemId: string) {
    return request<void>(`/dashboard/problems/${problemId}`, { method: "DELETE" })
  },

  addTestCase(
    problemId: string,
    data: { input: string; expectedOutput: string; isHidden: boolean; points?: number; orderIndex?: number }
  ) {
    return request<AdminTestCase>(`/dashboard/problems/${problemId}/testcases`, {
      method: "POST",
      body: data,
    })
  },

  bulkAddTestCases(problemId: string, testCases: Partial<AdminTestCase>[]) {
    return request<unknown>(`/dashboard/problems/${problemId}/testcases/bulk`, {
      method: "POST",
      body: { testCases },
    })
  },

  testCases(problemId: string) {
    return request<{ testCases: AdminTestCase[] }>(`/dashboard/problems/${problemId}/testcases`)
  },

  // Contests
  contests(params: {
    page?: number
    limit?: number
    status?: ContestStatus
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {}) {
    return request<{ contests: (ContestListItem & { isPublic?: boolean })[]; pagination?: Pagination; total?: number }>(
      "/dashboard/contests",
      { query: params }
    )
  },

  createContest(data: {
    title: string
    slug: string
    description: string
    startTime: string
    endTime: string
    duration: number
    type?: ContestType
    rules?: string
    isPublic?: boolean
    maxParticipants?: number
  }) {
    return request<ContestListItem>("/dashboard/contests", { method: "POST", body: data })
  },

  updateContest(contestId: string, data: Record<string, unknown>) {
    return request<ContestListItem>(`/dashboard/contests/${contestId}`, { method: "PUT", body: data })
  },

  deleteContest(contestId: string) {
    return request<void>(`/dashboard/contests/${contestId}`, { method: "DELETE" })
  },

  addProblemToContest(
    contestId: string,
    data: { problemId: string; points: number; orderIndex: number; bonusPoints?: number }
  ) {
    return request<unknown>(`/dashboard/contests/${contestId}/problems`, { method: "POST", body: data })
  },

  updateContestStatus(contestId: string, status: ContestStatus) {
    return request<{ id: string; status: ContestStatus }>(`/dashboard/contests/${contestId}/status`, {
      method: "PATCH",
      body: { status },
    })
  },

  // Submissions
  submissions(params: {
    page?: number
    limit?: number
    problemId?: string
    contestId?: string
    userId?: string
    status?: SubmissionStatus
    language?: string
    startDate?: string
    endDate?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  } = {}) {
    // Backend returns { submissions, total, page, totalPages } flat — not nested `pagination`.
    return request<{ submissions: AdminSubmissionListItem[]; total: number; page: number; totalPages: number }>(
      "/dashboard/submissions",
      { query: params }
    )
  },

  submission(submissionId: string) {
    return request<AdminSubmissionDetail>(`/dashboard/submissions/${submissionId}`)
  },

  deleteSubmission(submissionId: string) {
    return request<void>(`/dashboard/submissions/${submissionId}`, { method: "DELETE" })
  },

  rejudgeSubmission(submissionId: string) {
    return request<{ id: string; status: string }>(`/dashboard/submissions/${submissionId}/rejudge`, {
      method: "POST",
    })
  },
}

// ---------- Colleges & students (staff CMS) ----------

export const collegesApi = {
  create(data: { name: string; code: string }) {
    return request<College>("/dashboard/colleges", { method: "POST", body: data })
  },

  createStaff(collegeId: string, data: any) {
    return request(`/dashboard/colleges/${collegeId}/staff`, { method: "POST", body: data })
  },

  list() {
    return request<{ colleges: College[] }>("/dashboard/colleges")
  },

  /** Bulk import students: one shared password, uid becomes the login id. */
  bulkStudents(data: {
    collegeId?: string
    password: string
    students: { uid: string; firstName?: string; lastName?: string; email?: string; phone?: string }[]
  }) {
    return request<BulkImportResult>("/dashboard/colleges/students/bulk", {
      method: "POST",
      body: data,
    })
  },

  students(params: { page?: number; limit?: number; collegeId?: string; search?: string } = {}) {
    return request<{ students: StudentRow[]; pagination: Pagination }>("/dashboard/colleges/students", {
      query: params,
    })
  },
}

// ---------- Formatting helpers ----------

export function formatRuntime(timeMs?: number | null): string {
  if (timeMs === undefined || timeMs === null) return "—"
  return `${Math.round(timeMs)} ms`
}

export function formatMemory(memoryKb?: number | null): string {
  if (memoryKb === undefined || memoryKb === null) return "—"
  if (memoryKb >= 1024) return `${(memoryKb / 1024).toFixed(1)} MB`
  return `${memoryKb} KB`
}

export function displayName(user: { firstName?: string | null; lastName?: string | null; username?: string }): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ")
  return name || user.username || "User"
}

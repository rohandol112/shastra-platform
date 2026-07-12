"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import {
  submissionsApi,
  ApiError,
  type SubmissionDetail,
  type RunResult,
  type SampleRunResult,
  type SampleCaseResult,
  type SubmissionStatus,
} from "@/lib/api"

export const LANGUAGES = [
  {
    value: "python",
    label: "Python 3",
    template:
      "# Read input from stdin, print the answer to stdout\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # Write your code here\n\nmain()",
  },
  {
    value: "javascript",
    label: "JavaScript",
    template:
      "// Read input from stdin, print the answer to stdout\nconst data = require('fs').readFileSync(0, 'utf8').trim();\n// Write your code here\n",
  },
  {
    value: "cpp",
    label: "C++",
    template:
      "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // Write your code here\n    return 0;\n}",
  },
  {
    value: "java",
    label: "Java",
    template:
      "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}",
  },
  {
    value: "c",
    label: "C",
    template: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}",
  },
  {
    value: "go",
    label: "Go",
    template:
      "package main\n\nimport (\n\t\"bufio\"\n\t\"fmt\"\n\t\"os\"\n)\n\nfunc main() {\n\treader := bufio.NewReader(os.Stdin)\n\t_ = reader\n\t_ = fmt.Sprint\n\t// Write your code here\n}",
  },
] as const

export type WorkspaceResult = {
  kind: "run" | "submit" | "samples"
  status: SubmissionStatus | string
  runtime?: string
  memory?: string
  stdout?: string | null
  stderr?: string | null
  compileOutput?: string | null
  score?: number | null
  testCasesPassed?: number
  totalTestCases?: number
  /** Per-case breakdown for a "Run against samples" execution. */
  cases?: SampleCaseResult[]
}

interface WorkspaceState {
  /** Persisted code drafts keyed by `${problemSlug}:${language}` */
  drafts: Record<string, string>
  language: string

  isRunning: boolean
  isSubmitting: boolean
  result: WorkspaceResult | null
  resultOpen: boolean

  setLanguage: (language: string) => void
  getCode: (problemSlug: string) => string
  setCode: (problemSlug: string, code: string) => void
  resetCode: (problemSlug: string) => void

  runCode: (problemSlug: string, stdin: string) => Promise<void>
  runSamples: (problemSlug: string, problemId: string) => Promise<void>
  submitCode: (problemSlug: string, problemId: string, contestId?: string | null) => Promise<SubmissionDetail | null>
  closeResult: () => void
}

function draftKey(slug: string, language: string) {
  return `${slug}:${language}`
}

function templateFor(language: string): string {
  return LANGUAGES.find((l) => l.value === language)?.template ?? ""
}

function passedFromResults(submission: SubmissionDetail): { passed?: number; total?: number } {
  const results = submission.testCaseResults
  if (!Array.isArray(results) || results.length === 0) return {}
  const passed = results.filter((r) => r.status === "ACCEPTED" || r.status === "PASSED").length
  return { passed, total: results.length }
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      drafts: {},
      language: "python",

      isRunning: false,
      isSubmitting: false,
      result: null,
      resultOpen: false,

      setLanguage(language) {
        set({ language })
      },

      getCode(problemSlug) {
        const { drafts, language } = get()
        return drafts[draftKey(problemSlug, language)] ?? templateFor(language)
      },

      setCode(problemSlug, code) {
        const { language } = get()
        set((state) => ({
          drafts: { ...state.drafts, [draftKey(problemSlug, language)]: code },
        }))
      },

      resetCode(problemSlug) {
        const { language } = get()
        set((state) => ({
          drafts: { ...state.drafts, [draftKey(problemSlug, language)]: templateFor(language) },
        }))
      },

      async runCode(problemSlug, stdin) {
        const { language } = get()
        const code = get().getCode(problemSlug)
        set({ isRunning: true, resultOpen: false, result: null })
        try {
          const run: RunResult = await submissionsApi.run({ language, code, stdin })
          set({
            isRunning: false,
            resultOpen: true,
            result: {
              kind: "run",
              status: run.status,
              runtime: `${Math.round(run.time)} ms`,
              memory: run.memory ? `${(run.memory / 1024).toFixed(1)} MB` : undefined,
              stdout: run.stdout,
              stderr: run.stderr,
              compileOutput: run.compilationError,
            },
          })
        } catch (err) {
          set({
            isRunning: false,
            resultOpen: true,
            result: {
              kind: "run",
              status: "FAILED",
              stderr: err instanceof ApiError ? err.message : "Code execution failed. Please try again.",
            },
          })
        }
      },

      async runSamples(problemSlug, problemId) {
        const { language } = get()
        const code = get().getCode(problemSlug)
        set({ isRunning: true, resultOpen: false, result: null })
        try {
          const run: SampleRunResult = await submissionsApi.runSamples({ problemId, language, code })
          const slowest = run.cases.reduce((m, c) => Math.max(m, c.time), 0)
          const peakMem = run.cases.reduce((m, c) => Math.max(m, c.memory), 0)
          set({
            isRunning: false,
            resultOpen: true,
            result: {
              kind: "samples",
              status: run.status,
              runtime: run.cases.length ? `${Math.round(slowest)} ms` : undefined,
              memory: peakMem ? `${(peakMem / 1024).toFixed(1)} MB` : undefined,
              compileOutput: run.compileOutput,
              stderr: run.stderr,
              cases: run.cases,
              testCasesPassed: run.passed,
              totalTestCases: run.total,
            },
          })
        } catch (err) {
          set({
            isRunning: false,
            resultOpen: true,
            result: {
              kind: "samples",
              status: "FAILED",
              stderr: err instanceof ApiError ? err.message : "Code execution failed. Please try again.",
            },
          })
        }
      },

      async submitCode(problemSlug, problemId, contestId) {
        const { language } = get()
        const code = get().getCode(problemSlug)
        set({ isSubmitting: true, resultOpen: false, result: null })
        try {
          const created = await submissionsApi.create({
            problemId,
            language,
            code,
            contestId: contestId ?? undefined,
          })
          const verdict = await submissionsApi.waitForVerdict(created.id)
          const { passed, total } = passedFromResults(verdict)
          set({
            isSubmitting: false,
            resultOpen: true,
            result: {
              kind: "submit",
              status: verdict.status,
              runtime: verdict.time != null ? `${Math.round(verdict.time)} ms` : undefined,
              memory: verdict.memory != null ? `${(verdict.memory / 1024).toFixed(1)} MB` : undefined,
              stdout: verdict.stdout,
              stderr: verdict.stderr,
              compileOutput: verdict.compileOutput,
              score: verdict.score,
              testCasesPassed: passed,
              totalTestCases: total,
            },
          })
          return verdict
        } catch (err) {
          set({
            isSubmitting: false,
            resultOpen: true,
            result: {
              kind: "submit",
              status: "FAILED",
              stderr:
                err instanceof ApiError
                  ? err.message
                  : "Submission failed. Please try again.",
            },
          })
          return null
        }
      },

      closeResult() {
        set({ resultOpen: false })
      },
    }),
    {
      name: "shastra-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ drafts: state.drafts, language: state.language }),
    }
  )
)

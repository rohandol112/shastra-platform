"use client"

import { create } from "zustand"
import {
  problemsApi,
  type ProblemListItem,
  type ProblemDetail,
  type Pagination,
  type Difficulty,
} from "@/lib/api"

interface ProblemFilters {
  search: string
  difficulty: Difficulty | "ALL"
  tag: string
  page: number
}

interface ProblemState {
  problems: ProblemListItem[]
  pagination: Pagination | null
  tags: { tag: string; count: number }[]
  filters: ProblemFilters
  loading: boolean
  error: string | null

  detail: ProblemDetail | null
  detailSlug: string | null
  detailLoading: boolean
  detailError: string | null

  setFilters: (filters: Partial<ProblemFilters>) => void
  fetchProblems: () => Promise<void>
  fetchTags: () => Promise<void>
  fetchProblem: (slug: string) => Promise<void>
}

let listRequestId = 0

export const useProblemStore = create<ProblemState>((set, get) => ({
  problems: [],
  pagination: null,
  tags: [],
  filters: { search: "", difficulty: "ALL", tag: "ALL", page: 1 },
  loading: false,
  error: null,

  detail: null,
  detailSlug: null,
  detailLoading: false,
  detailError: null,

  setFilters(filters) {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
        // reset to first page whenever a filter other than page changes
        page: filters.page ?? 1,
      },
    }))
  },

  async fetchProblems() {
    const requestId = ++listRequestId
    const { filters } = get()
    set({ loading: true, error: null })
    try {
      const data = await problemsApi.list({
        page: filters.page,
        limit: 50,
        search: filters.search || undefined,
        difficulty: filters.difficulty === "ALL" ? undefined : filters.difficulty,
        tags: filters.tag === "ALL" ? undefined : filters.tag,
      })
      if (requestId !== listRequestId) return // stale response
      set({ problems: data.problems, pagination: data.pagination, loading: false })
    } catch (err) {
      if (requestId !== listRequestId) return
      set({ loading: false, error: err instanceof Error ? err.message : "Failed to load problems" })
    }
  },

  async fetchTags() {
    try {
      const tags = await problemsApi.tags()
      set({ tags })
    } catch {
      // tags are non-critical
    }
  },

  async fetchProblem(slug) {
    set({ detailLoading: true, detailError: null, detailSlug: slug })
    try {
      const detail = await problemsApi.bySlug(slug)
      if (get().detailSlug !== slug) return
      set({ detail, detailLoading: false })
    } catch (err) {
      if (get().detailSlug !== slug) return
      set({
        detail: null,
        detailLoading: false,
        detailError: err instanceof Error ? err.message : "Failed to load problem",
      })
    }
  },
}))

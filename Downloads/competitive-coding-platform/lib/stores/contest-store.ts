"use client"

import { create } from "zustand"
import {
  contestsApi,
  ApiError,
  type ContestListItem,
  type ContestDetail,
  type ContestLeaderboardEntry,
} from "@/lib/api"

interface ContestState {
  contests: ContestListItem[]
  loading: boolean
  error: string | null

  detail: ContestDetail | null
  detailSlug: string | null
  detailLoading: boolean
  detailError: string | null

  leaderboard: ContestLeaderboardEntry[]
  leaderboardTotal: number
  leaderboardLoading: boolean

  registering: string | null

  fetchContests: () => Promise<void>
  fetchContest: (slug: string) => Promise<ContestDetail | null>
  register: (contestId: string) => Promise<void>
  unregister: (contestId: string) => Promise<void>
  finishContest: (contestId: string) => Promise<void>
  fetchLeaderboard: (contestId: string, limit?: number) => Promise<void>
}

export const useContestStore = create<ContestState>((set, get) => ({
  contests: [],
  loading: false,
  error: null,

  detail: null,
  detailSlug: null,
  detailLoading: false,
  detailError: null,

  leaderboard: [],
  leaderboardTotal: 0,
  leaderboardLoading: false,

  registering: null,

  async fetchContests() {
    set({ loading: true, error: null })
    try {
      const data = await contestsApi.list({ limit: 50, sortBy: "startTime", sortOrder: "desc" })
      set({ contests: data.contests, loading: false })
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : "Failed to load contests" })
    }
  },

  async fetchContest(slug) {
    set({ detailLoading: true, detailError: null, detailSlug: slug })
    try {
      const detail = await contestsApi.bySlug(slug)
      if (get().detailSlug !== slug) return null
      set({ detail, detailLoading: false })
      return detail
    } catch (err) {
      if (get().detailSlug !== slug) return null
      set({
        detail: null,
        detailLoading: false,
        detailError: err instanceof Error ? err.message : "Failed to load contest",
      })
      return null
    }
  },

  async register(contestId) {
    set({ registering: contestId })
    try {
      await contestsApi.register(contestId)
      // update detail + list registration state in place
      set((state) => ({
        registering: null,
        detail:
          state.detail?.id === contestId
            ? { ...state.detail, isRegistered: true, participantCount: state.detail.participantCount + 1 }
            : state.detail,
        contests: state.contests.map((c) =>
          c.id === contestId ? { ...c, participantCount: c.participantCount + 1 } : c
        ),
      }))
    } catch (err) {
      set({ registering: null })
      // 409-style "already registered" is fine — sync the flag
      if (err instanceof ApiError && err.status === 409) {
        set((state) => ({
          detail: state.detail?.id === contestId ? { ...state.detail, isRegistered: true } : state.detail,
        }))
        return
      }
      throw err
    }
  },

  async finishContest(contestId) {
    try {
      await contestsApi.finish(contestId);
    } catch (err) {
      console.error('Failed to finish contest:', err);
    }
  },

  async unregister(contestId) {
    set({ registering: contestId })
    try {
      await contestsApi.unregister(contestId)
      set((state) => ({
        registering: null,
        detail:
          state.detail?.id === contestId
            ? {
                ...state.detail,
                isRegistered: false,
                participantCount: Math.max(0, state.detail.participantCount - 1),
              }
            : state.detail,
        contests: state.contests.map((c) =>
          c.id === contestId ? { ...c, participantCount: Math.max(0, c.participantCount - 1) } : c
        ),
      }))
    } catch (err) {
      set({ registering: null })
      throw err
    }
  },

  async fetchLeaderboard(contestId, limit = 100) {
    set({ leaderboardLoading: true })
    try {
      const data = await contestsApi.leaderboard(contestId, 1, limit)
      set({
        leaderboard: data.leaderboard,
        leaderboardTotal: data.pagination.total,
        leaderboardLoading: false,
      })
    } catch {
      set({ leaderboardLoading: false })
    }
  },
  async finishContest(contestId) {
    // Placeholder to satisfy ContestState interface. Admin has actual updateContestStatus.
  },
}))

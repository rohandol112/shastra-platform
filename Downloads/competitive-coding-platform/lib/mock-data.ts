// Mock data for the competitive coding platform
// This simulates API responses for demonstration purposes

export interface User {
  id: string
  username: string
  email: string
  fullName: string
  phone?: string
  role: "CANDIDATE" | "ADMIN"
  createdAt: string
  stats: {
    problemsSolved: number
    contestsParticipated: number
    globalRank: number
    rating: number
  }
  skillTracks?: SkillTrack[]
  badges?: Badge[]
}

export interface Problem {
  id: string
  slug: string
  title: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  acceptanceRate: number
  tags: string[]
  status?: "SOLVED" | "ATTEMPTED" | "TODO"
  description?: string
  examples?: {
    input: string
    output: string
    explanation?: string
  }[]
  constraints?: string[]
  hints?: string[]
}

export interface Contest {
  id: string
  slug: string
  title: string
  description: string
  startTime: string
  endTime: string
  status: "UPCOMING" | "RUNNING" | "ENDED"
  visibility: "PUBLIC" | "PRIVATE"
  type: "INDIVIDUAL" | "TEAM"
  participantCount: number
  problemCount: number
  isRegistered?: boolean
}

export interface Submission {
  id: string
  problemId: string
  problemTitle: string
  status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT" | "RUNTIME_ERROR" | "COMPILE_ERROR"
  language: string
  runtime: string
  memory: string
  submittedAt: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  problemsSolved: number
  totalTime: string
}

export interface SkillTrack {
  id: string
  name: string
  icon: string
  progress: number
  totalProblems: number
  solvedProblems: number
  badge?: "gold" | "silver" | "bronze"
}

export interface Badge {
  id: string
  name: string
  description: string
  earnedAt: string
  tier: "gold" | "silver" | "bronze"
}

// Mock current user
export const mockUser: User = {
  id: "user-1",
  username: "codemaster42",
  email: "codemaster@example.com",
  fullName: "Alex Johnson",
  phone: "+1 555-0123",
  role: "ADMIN",
  createdAt: "2024-06-15T10:00:00Z",
  stats: {
    problemsSolved: 156,
    contestsParticipated: 23,
    globalRank: 1247,
    rating: 1856,
  },
  skillTracks: [
    {
      id: "algo",
      name: "Algorithms",
      icon: "algo",
      progress: 68,
      totalProblems: 50,
      solvedProblems: 34,
      badge: "silver",
    },
    { id: "ds", name: "Data Structures", icon: "ds", progress: 45, totalProblems: 40, solvedProblems: 18 },
    { id: "sql", name: "SQL", icon: "sql", progress: 82, totalProblems: 30, solvedProblems: 25, badge: "gold" },
    { id: "python", name: "Python", icon: "python", progress: 55, totalProblems: 35, solvedProblems: 19 },
    { id: "java", name: "Java", icon: "java", progress: 30, totalProblems: 40, solvedProblems: 12 },
    { id: "cpp", name: "C++", icon: "cpp", progress: 22, totalProblems: 45, solvedProblems: 10 },
  ],
  badges: [
    { id: "b1", name: "Problem Solver", description: "Solved 100+ problems", earnedAt: "2024-11-15", tier: "gold" },
    { id: "b2", name: "Contest Winner", description: "Top 10 in a contest", earnedAt: "2024-10-22", tier: "silver" },
    { id: "b3", name: "SQL Master", description: "Completed SQL track", earnedAt: "2024-09-18", tier: "gold" },
    { id: "b4", name: "7 Day Streak", description: "Coded 7 days in a row", earnedAt: "2024-11-28", tier: "bronze" },
  ],
}

// Mock problems
export const mockProblems: Problem[] = [
  {
    id: "prob-1",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "EASY",
    acceptanceRate: 49.2,
    tags: ["Array", "Hash Table"],
    status: "SOLVED",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    hints: ["Try using a hash map to store seen values."],
  },
  {
    id: "prob-2",
    slug: "add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "MEDIUM",
    acceptanceRate: 40.1,
    tags: ["Linked List", "Math", "Recursion"],
    status: "ATTEMPTED",
  },
  {
    id: "prob-3",
    slug: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "MEDIUM",
    acceptanceRate: 33.8,
    tags: ["String", "Sliding Window", "Hash Table"],
    status: "TODO",
  },
  {
    id: "prob-4",
    slug: "median-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "HARD",
    acceptanceRate: 35.5,
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    status: "TODO",
  },
  {
    id: "prob-5",
    slug: "reverse-integer",
    title: "Reverse Integer",
    difficulty: "MEDIUM",
    acceptanceRate: 27.2,
    tags: ["Math"],
    status: "SOLVED",
  },
  {
    id: "prob-6",
    slug: "palindrome-number",
    title: "Palindrome Number",
    difficulty: "EASY",
    acceptanceRate: 53.4,
    tags: ["Math"],
    status: "SOLVED",
  },
  {
    id: "prob-7",
    slug: "container-with-water",
    title: "Container With Most Water",
    difficulty: "MEDIUM",
    acceptanceRate: 54.3,
    tags: ["Array", "Two Pointers", "Greedy"],
    status: "TODO",
  },
  {
    id: "prob-8",
    slug: "regular-expression",
    title: "Regular Expression Matching",
    difficulty: "HARD",
    acceptanceRate: 28.1,
    tags: ["String", "Dynamic Programming", "Recursion"],
    status: "TODO",
  },
  {
    id: "prob-9",
    slug: "merge-k-lists",
    title: "Merge k Sorted Lists",
    difficulty: "HARD",
    acceptanceRate: 48.9,
    tags: ["Linked List", "Divide and Conquer", "Heap"],
    status: "ATTEMPTED",
  },
  {
    id: "prob-10",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "EASY",
    acceptanceRate: 40.7,
    tags: ["String", "Stack"],
    status: "SOLVED",
  },
]

// Mock contests
export const mockContests: Contest[] = [
  {
    id: "contest-1",
    slug: "weekly-contest-375",
    title: "Weekly Contest 375",
    description: "Join our weekly coding competition featuring 4 problems of varying difficulty.",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    status: "UPCOMING",
    visibility: "PUBLIC",
    type: "INDIVIDUAL",
    participantCount: 2847,
    problemCount: 4,
    isRegistered: true,
  },
  {
    id: "contest-2",
    slug: "biweekly-contest-120",
    title: "Biweekly Contest 120",
    description: "Our biweekly coding competition with prizes for top performers.",
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
    status: "UPCOMING",
    visibility: "PUBLIC",
    type: "INDIVIDUAL",
    participantCount: 1523,
    problemCount: 4,
    isRegistered: false,
  },
  {
    id: "contest-3",
    slug: "company-hiring-challenge",
    title: "TechCorp Hiring Challenge",
    description: "Exclusive hiring contest for TechCorp engineering positions.",
    startTime: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: "RUNNING",
    visibility: "PUBLIC",
    type: "INDIVIDUAL",
    participantCount: 892,
    problemCount: 3,
    isRegistered: true,
  },
  {
    id: "contest-4",
    slug: "weekly-contest-374",
    title: "Weekly Contest 374",
    description: "Last week's weekly coding competition.",
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    status: "ENDED",
    visibility: "PUBLIC",
    type: "INDIVIDUAL",
    participantCount: 3421,
    problemCount: 4,
    isRegistered: true,
  },
]

// Mock submissions
export const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    problemId: "prob-1",
    problemTitle: "Two Sum",
    status: "ACCEPTED",
    language: "Python",
    runtime: "52ms",
    memory: "14.2 MB",
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-2",
    problemId: "prob-2",
    problemTitle: "Add Two Numbers",
    status: "WRONG_ANSWER",
    language: "JavaScript",
    runtime: "N/A",
    memory: "N/A",
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-3",
    problemId: "prob-6",
    problemTitle: "Palindrome Number",
    status: "ACCEPTED",
    language: "Python",
    runtime: "48ms",
    memory: "13.8 MB",
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "sub-4",
    problemId: "prob-9",
    problemTitle: "Merge k Sorted Lists",
    status: "TIME_LIMIT",
    language: "C++",
    runtime: "TLE",
    memory: "N/A",
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", username: "algorithm_king", score: 400, problemsSolved: 4, totalTime: "01:12:34" },
  { rank: 2, userId: "u2", username: "code_ninja", score: 400, problemsSolved: 4, totalTime: "01:23:45" },
  { rank: 3, userId: "u3", username: "binary_master", score: 350, problemsSolved: 3, totalTime: "00:58:12" },
  { rank: 4, userId: "u4", username: "data_wizard", score: 300, problemsSolved: 3, totalTime: "01:05:00" },
  { rank: 5, userId: "u5", username: "recursion_pro", score: 250, problemsSolved: 2, totalTime: "00:45:30" },
  { rank: 6, userId: "u6", username: "stack_overflow", score: 200, problemsSolved: 2, totalTime: "00:52:18" },
  { rank: 7, userId: "u7", username: "hash_table", score: 150, problemsSolved: 2, totalTime: "01:10:45" },
  { rank: 8, userId: "u8", username: "tree_traverser", score: 100, problemsSolved: 1, totalTime: "00:28:30" },
  { rank: 9, userId: "u9", username: "graph_explorer", score: 100, problemsSolved: 1, totalTime: "00:35:22" },
  { rank: 10, userId: "u10", username: "dp_enthusiast", score: 100, problemsSolved: 1, totalTime: "00:42:15" },
]

// Activity data for heatmap (last 365 days)
export function generateActivityData() {
  const data: { date: string; count: number }[] = []
  const today = new Date()

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    // Generate random activity (0-5 submissions per day)
    const count = Math.random() > 0.6 ? Math.floor(Math.random() * 6) : 0
    data.push({ date: dateStr, count })
  }

  return data
}

// Plagiarism reports
export interface PlagiarismReport {
  id: string
  contestId: string
  contestTitle: string
  userA: string
  userB: string
  problemTitle: string
  similarity: number
  status: "PENDING" | "CONFIRMED" | "DISMISSED"
  detectedAt: string
  matchedLines: number
  totalLines: number
}

export const mockPlagiarismReports: PlagiarismReport[] = [
  {
    id: "plag-1",
    contestId: "contest-4",
    contestTitle: "Weekly Contest 374",
    userA: "suspect_user1",
    userB: "original_coder",
    problemTitle: "Two Sum",
    similarity: 92,
    status: "PENDING",
    detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    matchedLines: 10,
    totalLines: 12,
  },
  {
    id: "plag-2",
    contestId: "contest-4",
    contestTitle: "Weekly Contest 374",
    userA: "copy_paste_dev",
    userB: "solution_master",
    problemTitle: "Valid Parentheses",
    similarity: 87,
    status: "PENDING",
    detectedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    matchedLines: 8,
    totalLines: 11,
  },
  {
    id: "plag-3",
    contestId: "contest-4",
    contestTitle: "Weekly Contest 374",
    userA: "newbie_coder",
    userB: "pro_solver",
    problemTitle: "Merge k Sorted Lists",
    similarity: 65,
    status: "DISMISSED",
    detectedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    matchedLines: 4,
    totalLines: 16,
  },
  {
    id: "plag-4",
    contestId: "contest-4",
    contestTitle: "Weekly Contest 374",
    userA: "cheater123",
    userB: "honest_dev",
    problemTitle: "Container With Most Water",
    similarity: 95,
    status: "CONFIRMED",
    detectedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    matchedLines: 14,
    totalLines: 15,
  },
  {
    id: "plag-5",
    contestId: "contest-3",
    contestTitle: "TechCorp Hiring Challenge",
    userA: "interview_faker",
    userB: "real_talent",
    problemTitle: "Longest Substring",
    similarity: 78,
    status: "PENDING",
    detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    matchedLines: 7,
    totalLines: 10,
  },
]

// Admin users list
export const mockUsers: User[] = [
  mockUser,
  {
    id: "user-2",
    username: "sarah_codes",
    email: "sarah@example.com",
    fullName: "Sarah Chen",
    role: "CANDIDATE",
    createdAt: "2024-08-20T14:30:00Z",
    stats: { problemsSolved: 89, contestsParticipated: 12, globalRank: 2341, rating: 1654 },
    skillTracks: [
      {
        id: "algo",
        name: "Algorithms",
        icon: "algo",
        progress: 68,
        totalProblems: 50,
        solvedProblems: 34,
        badge: "silver",
      },
      { id: "ds", name: "Data Structures", icon: "ds", progress: 45, totalProblems: 40, solvedProblems: 18 },
      { id: "sql", name: "SQL", icon: "sql", progress: 82, totalProblems: 30, solvedProblems: 25, badge: "gold" },
      { id: "python", name: "Python", icon: "python", progress: 55, totalProblems: 35, solvedProblems: 19 },
      { id: "java", name: "Java", icon: "java", progress: 30, totalProblems: 40, solvedProblems: 12 },
      { id: "cpp", name: "C++", icon: "cpp", progress: 22, totalProblems: 45, solvedProblems: 10 },
    ],
    badges: [
      { id: "b1", name: "Problem Solver", description: "Solved 100+ problems", earnedAt: "2024-11-15", tier: "gold" },
      { id: "b2", name: "Contest Winner", description: "Top 10 in a contest", earnedAt: "2024-10-22", tier: "silver" },
      { id: "b3", name: "SQL Master", description: "Completed SQL track", earnedAt: "2024-09-18", tier: "gold" },
      { id: "b4", name: "7 Day Streak", description: "Coded 7 days in a row", earnedAt: "2024-11-28", tier: "bronze" },
    ],
  },
  {
    id: "user-3",
    username: "dev_mike",
    email: "mike@example.com",
    fullName: "Mike Ross",
    role: "CANDIDATE",
    createdAt: "2024-09-10T09:15:00Z",
    stats: { problemsSolved: 234, contestsParticipated: 45, globalRank: 567, rating: 2102 },
    skillTracks: [
      {
        id: "algo",
        name: "Algorithms",
        icon: "algo",
        progress: 68,
        totalProblems: 50,
        solvedProblems: 34,
        badge: "silver",
      },
      { id: "ds", name: "Data Structures", icon: "ds", progress: 45, totalProblems: 40, solvedProblems: 18 },
      { id: "sql", name: "SQL", icon: "sql", progress: 82, totalProblems: 30, solvedProblems: 25, badge: "gold" },
      { id: "python", name: "Python", icon: "python", progress: 55, totalProblems: 35, solvedProblems: 19 },
      { id: "java", name: "Java", icon: "java", progress: 30, totalProblems: 40, solvedProblems: 12 },
      { id: "cpp", name: "C++", icon: "cpp", progress: 22, totalProblems: 45, solvedProblems: 10 },
    ],
    badges: [
      { id: "b1", name: "Problem Solver", description: "Solved 100+ problems", earnedAt: "2024-11-15", tier: "gold" },
      { id: "b2", name: "Contest Winner", description: "Top 10 in a contest", earnedAt: "2024-10-22", tier: "silver" },
      { id: "b3", name: "SQL Master", description: "Completed SQL track", earnedAt: "2024-09-18", tier: "gold" },
      { id: "b4", name: "7 Day Streak", description: "Coded 7 days in a row", earnedAt: "2024-11-28", tier: "bronze" },
    ],
  },
  {
    id: "user-4",
    username: "algo_queen",
    email: "alice@example.com",
    fullName: "Alice Wang",
    role: "ADMIN",
    createdAt: "2024-05-01T16:00:00Z",
    stats: { problemsSolved: 312, contestsParticipated: 67, globalRank: 123, rating: 2456 },
    skillTracks: [
      {
        id: "algo",
        name: "Algorithms",
        icon: "algo",
        progress: 68,
        totalProblems: 50,
        solvedProblems: 34,
        badge: "silver",
      },
      { id: "ds", name: "Data Structures", icon: "ds", progress: 45, totalProblems: 40, solvedProblems: 18 },
      { id: "sql", name: "SQL", icon: "sql", progress: 82, totalProblems: 30, solvedProblems: 25, badge: "gold" },
      { id: "python", name: "Python", icon: "python", progress: 55, totalProblems: 35, solvedProblems: 19 },
      { id: "java", name: "Java", icon: "java", progress: 30, totalProblems: 40, solvedProblems: 12 },
      { id: "cpp", name: "C++", icon: "cpp", progress: 22, totalProblems: 45, solvedProblems: 10 },
    ],
    badges: [
      { id: "b1", name: "Problem Solver", description: "Solved 100+ problems", earnedAt: "2024-11-15", tier: "gold" },
      { id: "b2", name: "Contest Winner", description: "Top 10 in a contest", earnedAt: "2024-10-22", tier: "silver" },
      { id: "b3", name: "SQL Master", description: "Completed SQL track", earnedAt: "2024-09-18", tier: "gold" },
      { id: "b4", name: "7 Day Streak", description: "Coded 7 days in a row", earnedAt: "2024-11-28", tier: "bronze" },
    ],
  },
  {
    id: "user-5",
    username: "binary_bob",
    email: "bob@example.com",
    fullName: "Bob Smith",
    role: "CANDIDATE",
    createdAt: "2024-10-05T11:45:00Z",
    stats: { problemsSolved: 45, contestsParticipated: 5, globalRank: 8901, rating: 1234 },
    skillTracks: [
      {
        id: "algo",
        name: "Algorithms",
        icon: "algo",
        progress: 68,
        totalProblems: 50,
        solvedProblems: 34,
        badge: "silver",
      },
      { id: "ds", name: "Data Structures", icon: "ds", progress: 45, totalProblems: 40, solvedProblems: 18 },
      { id: "sql", name: "SQL", icon: "sql", progress: 82, totalProblems: 30, solvedProblems: 25, badge: "gold" },
      { id: "python", name: "Python", icon: "python", progress: 55, totalProblems: 35, solvedProblems: 19 },
      { id: "java", name: "Java", icon: "java", progress: 30, totalProblems: 40, solvedProblems: 12 },
      { id: "cpp", name: "C++", icon: "cpp", progress: 22, totalProblems: 45, solvedProblems: 10 },
    ],
    badges: [
      { id: "b1", name: "Problem Solver", description: "Solved 100+ problems", earnedAt: "2024-11-15", tier: "gold" },
      { id: "b2", name: "Contest Winner", description: "Top 10 in a contest", earnedAt: "2024-10-22", tier: "silver" },
      { id: "b3", name: "SQL Master", description: "Completed SQL track", earnedAt: "2024-09-18", tier: "gold" },
      { id: "b4", name: "7 Day Streak", description: "Coded 7 days in a row", earnedAt: "2024-11-28", tier: "bronze" },
    ],
  },
]

// Mock skill tracks
export const mockSkillTracks: SkillTrack[] = [
  {
    id: "algo",
    name: "Algorithms",
    icon: "algo",
    progress: 68,
    totalProblems: 50,
    solvedProblems: 34,
    badge: "silver",
  },
  { id: "ds", name: "Data Structures", icon: "ds", progress: 45, totalProblems: 40, solvedProblems: 18 },
  { id: "sql", name: "SQL", icon: "sql", progress: 82, totalProblems: 30, solvedProblems: 25, badge: "gold" },
  { id: "python", name: "Python", icon: "python", progress: 55, totalProblems: 35, solvedProblems: 19 },
  { id: "java", name: "Java", icon: "java", progress: 30, totalProblems: 40, solvedProblems: 12 },
  { id: "cpp", name: "C++", icon: "cpp", progress: 22, totalProblems: 45, solvedProblems: 10 },
]

// Mock badges
export const mockBadges: Badge[] = [
  { id: "b1", name: "Problem Solver", description: "Solved 100+ problems", earnedAt: "2024-11-15", tier: "gold" },
  { id: "b2", name: "Contest Winner", description: "Top 10 in a contest", earnedAt: "2024-10-22", tier: "silver" },
  { id: "b3", name: "SQL Master", description: "Completed SQL track", earnedAt: "2024-09-18", tier: "gold" },
  { id: "b4", name: "7 Day Streak", description: "Coded 7 days in a row", earnedAt: "2024-11-28", tier: "bronze" },
]

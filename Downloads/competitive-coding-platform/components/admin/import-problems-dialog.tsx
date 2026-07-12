"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Loader2 } from "lucide-react"
import { adminApi, ApiError, type ImportResult } from "@/lib/api"

export function ImportProblemsDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [publish, setPublish] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  // "From API" tab
  const [source, setSource] = useState<"leetcode" | "codeforces">("leetcode")
  const [refsText, setRefsText] = useState("")

  // "Paste JSON" tab
  const [jsonText, setJsonText] = useState("")

  const handleFetch = async () => {
    const refs = refsText
      .split(/[\n,]/)
      .map((r) => r.trim())
      .filter(Boolean)
    if (refs.length === 0) {
      toast.error(source === "leetcode" ? "Enter problem slugs (e.g. two-sum)" : "Enter problem ids (e.g. 1850A)")
      return
    }
    setBusy(true)
    setResult(null)
    try {
      const res = await adminApi.importFetch(source, refs, publish)
      setResult(res)
      toast.success(`Imported ${res.imported} problems`)
      onImported()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Import failed")
    } finally {
      setBusy(false)
    }
  }

  const handleJson = async () => {
    let problems: unknown[]
    try {
      const parsed = JSON.parse(jsonText)
      problems = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      toast.error("Invalid JSON")
      return
    }
    setBusy(true)
    setResult(null)
    try {
      const res = await adminApi.importProblems(problems, publish)
      setResult(res)
      toast.success(`Imported ${res.imported} problems`)
      onImported()
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        toast.error(`${err.message}: ${err.errors[0].field} — ${err.errors[0].message}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : "Import failed")
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-border/50 bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Import Problems</DialogTitle>
          <DialogDescription>
            Pull problems from LeetCode / Codeforces via the bridge API, or paste normalized JSON directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="api">
          <TabsList className="bg-background">
            <TabsTrigger value="api">From LeetCode / Codeforces</TabsTrigger>
            <TabsTrigger value="json">Paste JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-foreground">Source</Label>
              <Select value={source} onValueChange={(v) => setSource(v as "leetcode" | "codeforces")}>
                <SelectTrigger className="border-input bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leetcode">LeetCode</SelectItem>
                  <SelectItem value="codeforces">Codeforces</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">
                {source === "leetcode" ? "Problem slugs (one per line)" : "Problem ids (one per line)"}
              </Label>
              <Textarea
                value={refsText}
                onChange={(e) => setRefsText(e.target.value)}
                placeholder={source === "leetcode" ? "two-sum\nadd-two-numbers" : "1850A\n4A"}
                rows={5}
                className="border-input bg-background font-mono text-sm text-foreground"
              />
            </div>
            <Button onClick={handleFetch} disabled={busy} className="w-full">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Fetch & Import
            </Button>
          </TabsContent>

          <TabsContent value="json" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-foreground">Normalized problem JSON (array or single object)</Label>
              <Textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='[{"title":"Two Sum","statement":"...","difficulty":"EASY","testCases":[{"input":"...","expectedOutput":"..."}]}]'
                rows={8}
                className="border-input bg-background font-mono text-xs text-foreground"
              />
            </div>
            <Button onClick={handleJson} disabled={busy} className="w-full">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Import JSON
            </Button>
          </TabsContent>
        </Tabs>

        <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm">
          <Switch checked={publish} onCheckedChange={setPublish} />
          <span className="text-foreground">
            Publish immediately
            <span className="block text-xs text-muted-foreground">Off = imported as drafts for review</span>
          </span>
        </label>

        {result && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
            <p className="font-medium text-foreground">
              Imported {result.imported} · Skipped {result.skipped}
            </p>
            {result.problems.slice(0, 5).map((p) => (
              <p key={p.id} className="text-xs text-muted-foreground">
                ✓ {p.title} ({p.testCases} test cases)
              </p>
            ))}
            {result.errors.slice(0, 3).map((e, i) => (
              <p key={i} className="text-xs text-destructive">
                ✗ {e.title}: {e.reason}
              </p>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

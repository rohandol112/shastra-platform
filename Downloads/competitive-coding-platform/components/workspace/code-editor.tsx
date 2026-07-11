"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Send, RotateCcw, Loader2 } from "lucide-react"
import { LANGUAGES } from "@/lib/stores/workspace-store"
import { useState } from "react"

interface CodeEditorProps {
  code: string
  language: string
  onCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
  onReset: () => void
  onRun: () => void
  onSubmit: () => void
  isRunning?: boolean
  isSubmitting?: boolean
}

export function CodeEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onReset,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
}: CodeEditorProps) {
  const [fontSize, setFontSize] = useState(14)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lineCount = code.split("\n").length
  const currentLang = LANGUAGES.find((l) => l.value === language)
  const busy = isRunning || isSubmitting

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter → run
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      if (!busy) onRun()
      return
    }

    // Tab → insert 4 spaces instead of leaving the editor
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.currentTarget
      const start = target.selectionStart
      const end = target.selectionEnd
      const next = code.substring(0, start) + "    " + code.substring(end)
      onCodeChange(next)
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4
      })
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="h-9 w-[140px] border-border/50 bg-background/50 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="hidden h-5 w-px bg-border/50 sm:block" />

          <div className="hidden items-center gap-2 sm:flex">
            <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(Number.parseInt(v))}>
              <SelectTrigger className="h-9 w-[80px] border-border/50 bg-background/50 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Reset code to template"
              title="Reset code to template"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{currentLang?.label ?? language}</span>
          <span>&middot;</span>
          <span>{lineCount} lines</span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Line Numbers */}
          <div
            className="flex-shrink-0 select-none overflow-hidden border-r border-border/30 bg-card/30 px-4 py-4 text-right font-mono text-muted-foreground/50"
            style={{ fontSize: `${fontSize}px`, lineHeight: "1.7" }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>

          {/* Code Input */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border-0 bg-transparent p-4 font-mono text-foreground outline-none focus:ring-0"
            style={{ fontSize: `${fontSize}px`, lineHeight: "1.7" }}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Code editor"
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-border/50 bg-card/50 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">Ctrl</kbd>
          <span>+</span>
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">Enter</kbd>
          <span className="hidden sm:inline">to run</span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onRun} disabled={busy} className="border-border/50 bg-transparent">
            {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={busy}
            className="bg-success hover:bg-success/90 text-success-foreground glow-success"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Judging..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  )
}

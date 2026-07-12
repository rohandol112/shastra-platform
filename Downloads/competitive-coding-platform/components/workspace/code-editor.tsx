"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Play, Send, RotateCcw, Loader2, Terminal, ChevronUp, ChevronDown } from "lucide-react"
import { LANGUAGES } from "@/lib/stores/workspace-store"
import { cn } from "@/lib/utils"

import Prism from "prismjs"
import "prismjs/components/prism-c"
import "prismjs/components/prism-cpp"
import "prismjs/components/prism-java"
import "prismjs/components/prism-python"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-go"
import "prismjs/components/prism-rust"

// Map our language keys to Prism grammar names.
const PRISM_LANG: Record<string, string> = {
  c: "c",
  cpp: "cpp",
  java: "java",
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  go: "go",
  rust: "rust",
}

interface CodeEditorProps {
  code: string
  language: string
  onCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
  onReset: () => void
  /** customInput is the user-provided stdin; undefined = use the sample test case */
  onRun: (customInput?: string) => void
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
  const [customOpen, setCustomOpen] = useState(false)
  const [customInput, setCustomInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)

  const lineCount = code.split("\n").length
  const currentLang = LANGUAGES.find((l) => l.value === language)
  const busy = isRunning || isSubmitting

  // Highlighted HTML for the overlay. A trailing newline keeps the last line
  // aligned with the textarea when the caret sits on an empty final line.
  const highlighted = useMemo(() => {
    const grammarName = PRISM_LANG[language] ?? "clike"
    const grammar = Prism.languages[grammarName] ?? Prism.languages.clike
    return Prism.highlight(code + "\n", grammar, grammarName)
  }, [code, language])

  const runWithInput = () => {
    onRun(customOpen && customInput.trim() !== "" ? customInput : undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter → run
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      if (!busy) runWithInput()
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

  // Keep the highlight layer scrolled in lockstep with the textarea.
  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }

  const editorFont: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    lineHeight: "1.7",
    fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
    tabSize: 4,
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Prism token colors (dark, matches the editor background) */}
      <style jsx global>{`
        .code-highlight .token.comment,
        .code-highlight .token.prolog,
        .code-highlight .token.doctype,
        .code-highlight .token.cdata { color: #6a737d; }
        .code-highlight .token.punctuation { color: #c9d1d9; }
        .code-highlight .token.property,
        .code-highlight .token.tag,
        .code-highlight .token.boolean,
        .code-highlight .token.number,
        .code-highlight .token.constant,
        .code-highlight .token.symbol { color: #79c0ff; }
        .code-highlight .token.selector,
        .code-highlight .token.attr-name,
        .code-highlight .token.string,
        .code-highlight .token.char,
        .code-highlight .token.builtin { color: #a5d6ff; }
        .code-highlight .token.operator,
        .code-highlight .token.entity,
        .code-highlight .token.url { color: #d2a8ff; }
        .code-highlight .token.atrule,
        .code-highlight .token.attr-value,
        .code-highlight .token.keyword { color: #ff7b72; }
        .code-highlight .token.function,
        .code-highlight .token.class-name { color: #d2a8ff; }
        .code-highlight .token.regex,
        .code-highlight .token.important,
        .code-highlight .token.variable { color: #ffa657; }
      `}</style>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-2 py-2 sm:px-4">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="h-9 w-[120px] border-border/50 bg-background/50 text-foreground sm:w-[140px]">
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

        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <span>{currentLang?.label ?? language}</span>
          <span>&middot;</span>
          <span>{lineCount} lines</span>
        </div>
      </div>

      {/* Editor Area — highlighted pre behind a transparent textarea */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Line Numbers */}
          <div
            className="hidden flex-shrink-0 select-none overflow-hidden border-r border-border/30 bg-card/30 px-3 py-4 text-right text-muted-foreground/50 sm:block"
            style={editorFont}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>

          <div className="relative flex-1 overflow-hidden">
            <pre
              ref={highlightRef}
              aria-hidden
              className="code-highlight pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre p-4 text-foreground"
              style={editorFont}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={syncScroll}
              className="absolute inset-0 resize-none overflow-auto whitespace-pre border-0 bg-transparent p-4 text-transparent caret-white outline-none focus:ring-0"
              style={editorFont}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              wrap="off"
              aria-label="Code editor"
            />
          </div>
        </div>
      </div>

      {/* Custom input (custom test case) */}
      <div className="border-t border-border/50 bg-card/30">
        <button
          type="button"
          onClick={() => setCustomOpen(!customOpen)}
          className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5" />
            Custom Input {customOpen && customInput.trim() !== "" ? "(will be used for Run)" : "(optional)"}
          </span>
          {customOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
        {customOpen && (
          <div className="px-4 pb-3">
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="stdin for Run — leave empty to use the first sample test case"
              rows={3}
              className="border-border/50 bg-background/50 font-mono text-sm text-foreground"
            />
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between border-t border-border/50 bg-card/50 px-2 py-3 sm:px-4">
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">Ctrl</kbd>
          <span>+</span>
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">Enter</kbd>
          <span>to run</span>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <Button
            variant="outline"
            onClick={runWithInput}
            disabled={busy}
            className={cn("border-border/50 bg-transparent", "flex-1 sm:flex-none")}
          >
            {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={busy}
            className={cn("bg-success hover:bg-success/90 text-success-foreground glow-success", "flex-1 sm:flex-none")}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? "Judging..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  )
}

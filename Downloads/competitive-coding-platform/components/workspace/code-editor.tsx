"use client"

import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Play, Send, RotateCcw, Loader2, Terminal, ChevronUp, ChevronDown } from "lucide-react"
import { LANGUAGES } from "@/lib/stores/workspace-store"
import { cn } from "@/lib/utils"

import CodeMirror from "@uiw/react-codemirror"
import { EditorView, keymap } from "@codemirror/view"
import { oneDark } from "@codemirror/theme-one-dark"
import { python } from "@codemirror/lang-python"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { javascript } from "@codemirror/lang-javascript"
import { go } from "@codemirror/lang-go"
import { rust } from "@codemirror/lang-rust"

// Language-aware editing engine per language: proper autocomplete, bracket
// closing, and indentation rules all come from these CodeMirror language packs.
function languageExtension(language: string) {
  switch (language) {
    case "python":
      return python()
    case "cpp":
    case "c":
      return cpp()
    case "java":
      return java()
    case "javascript":
      return javascript()
    case "typescript":
      return javascript({ typescript: true })
    case "go":
      return go()
    case "rust":
      return rust()
    default:
      return []
  }
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

  const lineCount = code.split("\n").length
  const currentLang = LANGUAGES.find((l) => l.value === language)
  const busy = isRunning || isSubmitting

  const runWithInput = () => {
    onRun(customOpen && customInput.trim() !== "" ? customInput : undefined)
  }

  // The Ctrl/Cmd+Enter keymap lives inside CodeMirror; a ref keeps it pointed at
  // the latest run handler without reconfiguring the editor on every keystroke.
  const runRef = useRef<() => void>(() => {})
  runRef.current = () => {
    if (!busy) runWithInput()
  }

  const extensions = useMemo(
    () => [
      languageExtension(language),
      EditorView.theme({
        "&": { fontSize: `${fontSize}px`, height: "100%" },
        ".cm-scroller": { fontFamily: "var(--font-jetbrains), ui-monospace, monospace" },
        ".cm-content": { fontFamily: "var(--font-jetbrains), ui-monospace, monospace" },
      }),
      keymap.of([
        {
          key: "Mod-Enter",
          preventDefault: true,
          run: () => {
            runRef.current()
            return true
          },
        },
      ]),
    ],
    [language, fontSize],
  )

  return (
    <div className="flex h-full flex-col bg-background">
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

      {/* Editor */}
      <div className="flex-1 overflow-hidden [&_.cm-editor]:h-full [&_.cm-editor.cm-focused]:outline-none [&_.cm-gutters]:border-r [&_.cm-gutters]:border-border/30">
        <CodeMirror
          value={code}
          onChange={onCodeChange}
          extensions={extensions}
          theme={oneDark}
          height="100%"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            autocompletion: true,
            closeBrackets: true,
            bracketMatching: true,
            indentOnInput: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            tabSize: 4,
          }}
          className="h-full text-sm"
        />
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

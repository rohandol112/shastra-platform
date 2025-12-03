"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Send, RotateCcw } from "lucide-react"

interface CodeEditorProps {
  onRun: (code: string, language: string) => void
  onSubmit: (code: string, language: string) => void
  isRunning?: boolean
  isSubmitting?: boolean
}

const languages = [
  {
    value: "python",
    label: "Python 3",
    template: 'def solution():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solution()',
  },
  {
    value: "javascript",
    label: "JavaScript",
    template: "function solution() {\n    // Write your code here\n}\n\nsolution();",
  },
  {
    value: "typescript",
    label: "TypeScript",
    template: "function solution(): void {\n    // Write your code here\n}\n\nsolution();",
  },
  {
    value: "cpp",
    label: "C++",
    template:
      "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}",
  },
  {
    value: "java",
    label: "Java",
    template:
      "public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
  },
]

export function CodeEditor({ onRun, onSubmit, isRunning, isSubmitting }: CodeEditorProps) {
  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState(languages[0].template)
  const [fontSize, setFontSize] = useState(14)

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    const langConfig = languages.find((l) => l.value === newLang)
    if (langConfig) {
      setCode(langConfig.template)
    }
  }

  const handleReset = () => {
    const langConfig = languages.find((l) => l.value === language)
    if (langConfig) {
      setCode(langConfig.template)
    }
  }

  const lineCount = code.split("\n").length
  const currentLang = languages.find((l) => l.value === language)

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-9 w-[140px] border-border/50 bg-background/50 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
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
              onClick={handleReset}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Reset code"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{currentLang?.label}</span>
          <span>&middot;</span>
          <span>{lineCount} lines</span>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Line Numbers */}
          <div
            className="flex-shrink-0 select-none border-r border-border/30 bg-card/30 px-4 py-4 text-right font-mono text-muted-foreground/50"
            style={{ fontSize: `${fontSize}px`, lineHeight: "1.7" }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>

          {/* Code Input */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 resize-none border-0 bg-transparent p-4 font-mono text-foreground outline-none focus:ring-0"
            style={{ fontSize: `${fontSize}px`, lineHeight: "1.7" }}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
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
          <Button
            variant="outline"
            onClick={() => onRun(code, language)}
            disabled={isRunning || isSubmitting}
            className="border-border/50 bg-transparent"
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button
            onClick={() => onSubmit(code, language)}
            disabled={isRunning || isSubmitting}
            className="bg-success hover:bg-success/90 text-success-foreground glow-success"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  )
}

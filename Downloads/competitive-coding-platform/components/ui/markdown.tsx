"use client"

import { useMemo } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"
import { cn } from "@/lib/utils"

marked.setOptions({ gfm: true, breaks: true })

// Renders markdown (problem statements, formats, constraints) as styled HTML.
// The app has no Tailwind typography plugin, so element styling is applied via
// child selectors here. Output is sanitized before it ever hits the DOM.
const MD_CLASSES =
  "text-sm leading-relaxed text-foreground/90 " +
  "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 " +
  "[&_strong]:font-semibold [&_strong]:text-foreground " +
  "[&_em]:italic " +
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-primary " +
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[#0d1117] [&_pre]:p-3 " +
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-foreground " +
  "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground " +
  "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground " +
  "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground " +
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 " +
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground " +
  "[&_hr]:my-4 [&_hr]:border-border/50 " +
  "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm " +
  "[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold " +
  "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1"

export function Markdown({ content, className }: { content: string | null | undefined; className?: string }) {
  const html = useMemo(() => {
    const raw = marked.parse(content ?? "", { async: false }) as string
    return DOMPurify.sanitize(raw)
  }, [content])

  if (!content) return null
  return <div className={cn(MD_CLASSES, className)} dangerouslySetInnerHTML={{ __html: html }} />
}

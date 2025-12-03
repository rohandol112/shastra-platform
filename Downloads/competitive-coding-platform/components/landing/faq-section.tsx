"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is SHASTRA?",
    answer:
      "SHASTRA is a competitive coding platform designed for developers who want to master algorithms and data structures. We offer thousands of problems, live contests, and a supportive community to help you improve your coding skills.",
  },
  {
    question: "Is SHASTRA free to use?",
    answer:
      "Yes! SHASTRA offers a free tier with access to a vast library of problems and the ability to participate in public contests. We also offer premium plans with additional features like detailed analytics, exclusive contests, and ad-free experience.",
  },
  {
    question: "What programming languages are supported?",
    answer:
      "We support 15+ programming languages including Python, C++, Java, JavaScript, Go, Rust, and more. Our Monaco-powered editor provides syntax highlighting and auto-completion for all supported languages.",
  },
  {
    question: "How do contests work?",
    answer:
      "Contests are timed events where participants solve a set of problems. You earn points based on the number of problems solved and the time taken. Our ELO-based ranking system ensures fair competition, and we have plagiarism detection to maintain integrity.",
  },
  {
    question: "Can I use SHASTRA for interview preparation?",
    answer:
      "Absolutely! SHASTRA is perfect for interview prep. Our problems are curated to cover common interview topics, and you can filter by company tags to practice questions frequently asked by top tech companies.",
  },
  {
    question: "How is plagiarism detected?",
    answer:
      "We use advanced code similarity algorithms to detect plagiarism in contest submissions. Our system compares submissions against each other and flags suspicious similarities for review, ensuring fair competition for all participants.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="relative bg-muted/30 py-24 lg:py-32">
      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="mx-auto max-w-3xl px-4">
        {/* Section header - Bold style */}
        <div className="mb-16 text-center">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-secondary">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.02em] text-foreground">
            FREQUENTLY<br />
            <span className="text-gradient-shastra">ASKED</span>
          </h2>
        </div>

        {/* FAQ Accordion - Minimal borders */}
        <Accordion type="single" collapsible className="w-full space-y-0">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-border/50 py-2"
            >
              <AccordionTrigger className="py-6 text-left text-base sm:text-lg font-semibold text-foreground hover:no-underline hover:text-secondary transition-colors [&[data-state=open]]:text-secondary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground leading-relaxed pr-8">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold mb-3">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="text-base font-semibold text-foreground hover:text-secondary transition-colors"
          >
            Contact our team →
          </a>
        </div>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mail, MessageSquare, Users, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const inquiryTypes = [
  {
    icon: MessageSquare,
    title: "General Inquiry",
    description: "Questions about SHASTRA platform",
  },
  {
    icon: Users,
    title: "Enterprise",
    description: "Solutions for teams & companies",
  },
  {
    icon: Mail,
    title: "Partnerships",
    description: "Collaboration opportunities",
  },
]

export function FeaturesSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    toast.success("Message sent successfully!", {
      description: "We'll get back to you within 24 hours.",
      icon: <CheckCircle className="h-4 w-4" />,
    })
    
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    })
    setErrors({})
    setIsSubmitting(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <section id="contact" className="relative bg-background py-24 lg:py-32">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.42_0.18_265/0.08),transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="relative mx-auto max-w-6xl px-4">
        {/* Section header - Lando style */}
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-secondary">
            Get In Touch
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.02em] text-foreground mb-6">
            CONTACT<br />
            <span className="text-gradient-shastra">OUR TEAM</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto font-light">
            Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Contact Form */}
          <div className="order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className={`h-14 rounded-none border-2 bg-background px-4 text-base transition-colors ${errors.firstName ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="h-14 rounded-none border-2 border-border bg-background px-4 text-base focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`h-14 rounded-none border-2 bg-background px-4 text-base transition-colors ${errors.email ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Subject <span className="text-destructive">*</span>
                </label>
                <Input
                  id="subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className={`h-14 rounded-none border-2 bg-background px-4 text-base transition-colors ${errors.subject ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`}
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? "subject-error" : undefined}
                />
                {errors.subject && (
                  <p id="subject-error" className="text-xs text-destructive">{errors.subject}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className={`rounded-none border-2 bg-background px-4 py-4 text-base resize-none transition-colors ${errors.message ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="text-xs text-destructive">{errors.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                size="lg"
                disabled={isSubmitting}
                className="w-full h-14 rounded-none text-sm font-bold tracking-[0.2em] uppercase gap-3 group hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Right: Info cards */}
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <div className="space-y-6">
              {inquiryTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div
                    key={type.title}
                    className="group flex items-start gap-5 p-6 border-2 border-border bg-card/30 hover:border-primary/50 hover:bg-card/60 transition-all cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-primary/30 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-foreground mb-1">
                        {type.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Direct contact */}
            <div className="mt-10 pt-10 border-t border-border/50">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold mb-4">
                Or reach us directly
              </p>
              <a 
                href="mailto:tcetshastra@gmail.com" 
                className="text-lg font-semibold text-foreground hover:text-secondary transition-colors"
              >
                tcetshastra@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

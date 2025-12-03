import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  Users,
  Briefcase,
} from "lucide-react"

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the SHASTRA team. We're here to help with questions, feedback, or partnership inquiries.",
}

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email anytime",
    value: "tcetshastra@gmail.com",
    href: "mailto:tcetshastra@gmail.com",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with our support team",
    value: "Available 24/7",
    href: "#",
  },
  {
    icon: MapPin,
    title: "Office",
    description: "Visit our headquarters",
    value: "Bangalore, India",
    href: "#",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "Average response time",
    value: "Under 24 hours",
    href: "#",
  },
]

const inquiryTypes = [
  {
    icon: HelpCircle,
    title: "General Support",
    description: "Questions about using SHASTRA",
  },
  {
    icon: Users,
    title: "Enterprise",
    description: "Solutions for teams & companies",
  },
  {
    icon: Briefcase,
    title: "Partnerships",
    description: "Collaboration opportunities",
  },
]

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.42_0.18_265/0.15),transparent_60%)]" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Contact Us</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Get in <span className="text-gradient-shastra">Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Have questions, feedback, or want to partner with us? We&apos;d love to
                hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="border-y border-border/50 bg-muted/30 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {contactMethods.map((method) => (
                <a
                  key={method.title}
                  href={method.href}
                  className="group rounded-xl border border-border/50 bg-card p-6 text-center transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mx-auto mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <method.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{method.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {method.description}
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary">
                    {method.value}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
              {/* Form */}
              <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-bold">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      className="bg-background resize-none"
                    />
                  </div>
                  <Button className="w-full gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Inquiry Types */}
              <div className="flex flex-col justify-center">
                <h2 className="mb-4 text-2xl font-bold">How can we help?</h2>
                <p className="mb-8 text-muted-foreground">
                  Select the type of inquiry that best describes your needs, or simply
                  fill out the form and we&apos;ll route your message to the right team.
                </p>
                <div className="space-y-4">
                  {inquiryTypes.map((type) => (
                    <div
                      key={type.title}
                      className="group flex items-start gap-4 rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
                    >
                      <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{type.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FAQ Link */}
                <div className="mt-8 rounded-xl bg-muted/50 p-6">
                  <h3 className="font-semibold">Looking for quick answers?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check out our FAQ section for answers to common questions.
                  </p>
                  <a
                    href="/#faq"
                    className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                  >
                    View FAQ →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

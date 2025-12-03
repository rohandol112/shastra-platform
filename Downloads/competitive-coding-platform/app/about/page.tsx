import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/ui/footer"
import { Code2, Users, Trophy, Target, Lightbulb, Globe } from "lucide-react"

export const metadata = {
  title: "About Us",
  description:
    "Learn about SHASTRA - the competitive coding platform built by developers, for developers. Our mission is to help coders excel.",
}

const values = [
  {
    icon: Target,
    title: "Excellence",
    description:
      "We strive for excellence in every problem, every contest, and every feature we build.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Building a supportive global community where coders help each other grow.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "Constantly innovating our platform with cutting-edge features and challenges.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description:
      "Making competitive programming accessible to everyone, everywhere.",
  },
]

const stats = [
  { value: "50K+", label: "Active Coders" },
  { value: "1000+", label: "Problems" },
  { value: "500+", label: "Weekly Contests" },
  { value: "100+", label: "Countries" },
]

export default function AboutPage() {
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
                <Code2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">About SHASTRA</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Built by <span className="text-gradient-shastra">Developers</span>,
                <br />
                For Developers
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                SHASTRA was born from a simple idea: create the best platform for
                competitive programmers to learn, practice, and excel.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="border-y border-border/50 bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To democratize competitive programming education and empower the next
                generation of software engineers. We believe that with the right tools
                and community, anyone can master algorithms and data structures.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Our Values</h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="group rounded-2xl border border-border/50 bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border/50 bg-muted/30 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold text-primary sm:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2">
                <Trophy className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Join Our Journey</span>
              </div>
              <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
                Built with Passion
              </h2>
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
                Our team consists of competitive programmers, software engineers, and
                educators who are passionate about helping others succeed. We&apos;ve
                competed at the highest levels and now we&apos;re building the platform we
                wish we had.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

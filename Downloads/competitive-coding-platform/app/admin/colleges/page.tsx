"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminGuard } from "@/components/admin-guard"
import { collegesApi, type College } from "@/lib/api"
import { Loader2, Plus, Building2, Activity, Users } from "lucide-react"

export default function CollegesPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Colleges</h1>
              <p className="mt-2 text-muted-foreground">Manage college tenants across the platform.</p>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <CreateCollegeForm />
            </div>
            <div className="md:col-span-2">
              <CollegesList />
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}

function CreateCollegeForm() {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) {
      toast.error("Name and Code are required")
      return
    }

    setIsSubmitting(true)
    try {
      await collegesApi.create({ name, code })
      toast.success("College created successfully")
      setName("")
      setCode("")
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || "Failed to create college")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          New College
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">College Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Indian Institute of Technology" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">College Code</Label>
            <Input 
              id="code" 
              placeholder="e.g. iit-delhi" 
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            />
            <p className="text-xs text-muted-foreground">Used as a prefix for student usernames.</p>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create College
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function CollegesList() {
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    collegesApi.list()
      .then((res) => setColleges(res.colleges))
      .catch((err) => toast.error("Failed to load colleges"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  if (colleges.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 min-h-[300px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Building2 className="mx-auto h-12 w-12 opacity-50 mb-4" />
          <p>No colleges found. Create one to get started.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {colleges.map((college) => (
        <Card key={college.id} className="border-border/50 bg-card/50 transition-colors hover:bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-start">
              <span className="truncate pr-4">{college.name}</span>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {college.code}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {college.studentCount ?? 0} students
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                {college.staffCount ?? 0} staff
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground/60">
              Created {new Date(college.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

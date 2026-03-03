"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function NewStudentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    router.push("/dashboard/students")
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/dashboard/students")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Student Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="First Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Last Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input id="dateOfBirth" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select required>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class *</Label>
                  <Select required>
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6th A">6th A</SelectItem>
                      <SelectItem value="6th B">6th B</SelectItem>
                      <SelectItem value="5th A">5th A</SelectItem>
                      <SelectItem value="5th B">5th B</SelectItem>
                      <SelectItem value="4th A">4th A</SelectItem>
                      <SelectItem value="4th B">4th B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                  <Input id="enrollmentDate" type="date" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" placeholder="Full address" required />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Parent/Guardian Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent Name *</Label>
                  <Input id="parentName" placeholder="Full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Phone *</Label>
                  <Input id="parentPhone" type="tel" placeholder="06 12 34 56 78" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="parentEmail">Email *</Label>
                  <Input id="parentEmail" type="email" placeholder="parent@email.fr" required />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/students")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

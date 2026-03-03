"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Megaphone, Plus, Search, AlertCircle, Info, CheckCircle2 } from "lucide-react"
import { mockAnnouncements } from "@/lib/mock-data"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

export default function AnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("all")

  const filteredAnnouncements = mockAnnouncements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = selectedPriority === "all" || announcement.priority === selectedPriority
    return matchesSearch && matchesPriority
  })

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, JSX.Element> = {
      high: <AlertCircle className="w-4 h-4 text-red-500" />,
      medium: <Info className="w-4 h-4 text-yellow-500" />,
      low: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    }
    return icons[priority] || icons.low
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "secondary"; label: string }> = {
      high: { variant: "destructive", label: "Urgent" },
      medium: { variant: "default", label: "Normal" },
      low: { variant: "secondary", label: "Info" },
    }
    const config = variants[priority] || variants.low
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getAudienceBadge = (audience: string) => {
    const labels: Record<string, string> = {
      all: "All",
      teachers: "Teachers",
      parents: "Parents",
      students: "Students",
    }
    return <Badge variant="outline">{labels[audience] || audience}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">Important communications and information</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search an announcement..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">Urgent</SelectItem>
                    <SelectItem value="medium">Normal</SelectItem>
                    <SelectItem value="low">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className={!announcement.read ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getPriorityIcon(announcement.priority)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription className="mt-1">
                        By {announcement.author} • {new Date(announcement.date).toLocaleDateString("en-US")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(announcement.priority)}
                    {getAudienceBadge(announcement.targetAudience)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{announcement.content}</p>
                {!announcement.read && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      Mark as read
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Create Announcement
            </CardTitle>
            <CardDescription>Publish new information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input placeholder="Announcement title" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Message</label>
              <Textarea placeholder="Announcement content..." className="mt-1 min-h-32" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select defaultValue="medium">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Urgent</SelectItem>
                  <SelectItem value="medium">Normal</SelectItem>
                  <SelectItem value="low">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Recipients</label>
              <Select defaultValue="all">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Publish Announcement</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

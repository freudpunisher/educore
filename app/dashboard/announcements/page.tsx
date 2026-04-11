"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Megaphone, Plus, Search, AlertCircle, Info, CheckCircle2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

type Announcement = {
  id: number;
  title: string;
  content: string;
  author_name: string;
  priority: "low" | "medium" | "high";
  target_audience: "all" | "teachers" | "parents" | "students";
  created_at: string;
  is_read: boolean;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPriority, setSelectedPriority] = useState("all")

  // Create state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "medium",
    target_audience: "all",
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const resp = await api.get<any>("core/announcements/")
      setAnnouncements(resp.results || resp)
    } catch {
      toast.error("Failed to load announcements")
    } finally {
      setIsLoading(false)
    }
  }

  const publishAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Please fill in all fields")
      return
    }
    setIsPublishing(true)
    try {
      // For demo, we use the first available account as author or current user if available
      // Backend automatically sets author if not provided in some cases, but here we might need it
      await api.post("core/announcements/", {
        ...newAnnouncement,
        author: 1, // Fallback to first user for demo
      })
      toast.success("Announcement published successfully")
      setNewAnnouncement({ title: "", content: "", priority: "medium", target_audience: "all" })
      setIsDialogOpen(false)
      fetchAnnouncements()
    } catch {
      toast.error("Failed to publish announcement")
    } finally {
      setIsPublishing(false)
    }
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Create Announcement
              </DialogTitle>
              <DialogDescription>Publish new information to users.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input
                  placeholder="Announcement title"
                  className="mt-1"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea
                  placeholder="Announcement content..."
                  className="mt-1 min-h-32"
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <Select
                    value={newAnnouncement.priority}
                    onValueChange={(v: any) => setNewAnnouncement({ ...newAnnouncement, priority: v })}
                  >
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
                  <Select
                    value={newAnnouncement.target_audience}
                    onValueChange={(v: any) => setNewAnnouncement({ ...newAnnouncement, target_audience: v })}
                  >
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
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={publishAnnouncement} disabled={isPublishing}>
                {isPublishing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Publish Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
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
            <Card key={announcement.id} className={!announcement.is_read ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getPriorityIcon(announcement.priority)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <CardDescription className="mt-1">
                        By {announcement.author_name} • {new Date(announcement.created_at).toLocaleDateString("en-US")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(announcement.priority)}
                    {getAudienceBadge(announcement.target_audience)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{announcement.content}</p>
                {!announcement.is_read && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      Mark as read
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && filteredAnnouncements.length === 0 && (
            <div className="text-center p-12 text-muted-foreground">No announcements found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Plus,
    Calendar,
    Users,
    MoreHorizontal,
    FileText,
    Clock,
    CheckCircle2,
    ChevronRight,
    ArrowRight,
    Loader2,
    AlertCircle
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"

// Mock Data for Enrollments (still mock for now as per original requested change focus)
const mockEnrollments = [
    { id: "ENR-001", studentName: "Jean Dupont", grade: "10th Grade", date: "2024-08-15", status: "confirmed" },
    { id: "ENR-002", studentName: "Marie Curie", grade: "12th Grade", date: "2024-08-16", status: "confirmed" },
    { id: "ENR-003", studentName: "Albert Einstein", grade: "11th Grade", date: "2024-08-17", status: "pending" },
    { id: "ENR-004", studentName: "Isaac Newton", grade: "9th Grade", date: "2024-08-18", status: "confirmed" },
    { id: "ENR-005", studentName: "Ada Lovelace", grade: "10th Grade", date: "2024-08-20", status: "confirmed" },
]

export default function AcademicYearsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [academicYears, setAcademicYears] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Create Form State
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [formData, setFormData] = useState({
        start_year: new Date().getFullYear(),
        end_year: new Date().getFullYear() + 1,
        is_current: false
    })

    // Details State
    const [selectedYear, setSelectedYear] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    const { toast } = useToast()

    const fetchAcademicYears = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const token = localStorage.getItem("access_token")
            if (!token) {
                throw new Error("No authentication token found. Please relogin.")
            }

            const response = await fetch(API_ENDPOINTS.ACADEMIC_YEARS, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            })

            if (!response.ok) {
                let errorMsg = `Server error: ${response.status}`
                try {
                    const errorDetails = await response.json()
                    errorMsg = JSON.stringify(errorDetails)
                } catch (e) {
                    // Not JSON
                }
                throw new Error(errorMsg)
            }

            const data = await response.json()
            setAcademicYears(data)
        } catch (err: any) {
            console.error("Fetch Academic Years error:", err)
            setError(err.message)
            toast({
                title: "Fetch Failed",
                description: err.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAcademicYears()
    }, [fetchAcademicYears])

    const handleCreateYear = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.start_year >= formData.end_year) {
            toast({
                title: "Validation Error",
                description: "Start year must be less than end year",
                variant: "destructive"
            })
            return
        }

        setSubmitting(true)
        try {
            const token = localStorage.getItem("access_token")
            if (!token) {
                throw new Error("Authentication token missing. Please relogin.")
            }

            const response = await fetch(API_ENDPOINTS.ACADEMIC_YEARS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                let errorMsg = `Creation error: ${response.status}`
                try {
                    const errorDetails = await response.json()
                    errorMsg = JSON.stringify(errorDetails)
                } catch (e) {
                    // Not JSON
                }
                throw new Error(errorMsg)
            }

            toast({
                title: "Success",
                description: "Academic year created successfully",
            })
            setShowCreateDialog(false)
            fetchAcademicYears()
            // Reset form
            setFormData({
                start_year: new Date().getFullYear(),
                end_year: new Date().getFullYear() + 1,
                is_current: false
            })
        } catch (err: any) {
            console.error("Create Academic Year error:", err)
            toast({
                title: "Creation Failed",
                description: err.message,
                variant: "destructive"
            })
        } finally {
            setSubmitting(false)
        }
    }

    const filteredYears = academicYears.filter(year =>
        `${year.start_year}-${year.end_year}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (isCurrent: boolean) => {
        if (isCurrent) {
            return <Badge className="bg-green-500/10 text-green-600 border-none px-3 font-bold">Current</Badge>
        }
        return <Badge className="bg-muted text-muted-foreground border-none px-3 font-bold">Past/Planned</Badge>
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Academic Years</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage institutional periods and track seasonal enrollments</p>
                </div>
                <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Academic Year
                </Button>
            </div>

            {/* Main Content */}
            <Card className="border-none shadow-2xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search academic years (e.g. 2024)..."
                                className="pl-12 h-12 bg-muted/50 border-transparent focus:bg-background transition-all rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {loading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-6">
                    {error ? (
                        <div className="p-8 text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                            <p className="text-lg font-bold text-destructive">{error}</p>
                            <Button onClick={fetchAcademicYears} variant="outline">Retry Loading</Button>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/50 overflow-hidden text-center">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-border/50 hover:bg-transparent text-center">
                                        <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">ID</TableHead>
                                        <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Year Name</TableHead>
                                        <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Status</TableHead>
                                        <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Enrolled Students</TableHead>
                                        <TableHead className="py-5 text-right font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredYears.length === 0 && !loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-12 text-muted-foreground italic font-medium">
                                                No academic years found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredYears.map((year) => (
                                            <TableRow key={year.id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                                                <TableCell className="py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                                            <Calendar className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span className="font-bold text-sm tracking-tight">{year.id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 font-bold text-lg">{year.start_year} - {year.end_year}</TableCell>
                                                <TableCell className="py-6">{getStatusBadge(year.is_current)}</TableCell>
                                                <TableCell className="py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                                            <Users className="w-3 h-3 text-muted-foreground" />
                                                        </div>
                                                        <span className="font-bold">--</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                                                            <DropdownMenuItem
                                                                className="rounded-lg px-3 py-2 gap-3 cursor-pointer"
                                                                onClick={() => {
                                                                    setSelectedYear(year)
                                                                    setIsDetailsOpen(true)
                                                                }}
                                                            >
                                                                <FileText className="w-4 h-4" /> View Enrollments
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold font-heading">New Academic Year</DialogTitle>
                            <DialogDescription className="text-primary-foreground/80 font-medium">
                                Set up a new institutional calendar period
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleCreateYear} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold ml-1">Start Year</Label>
                                <Input
                                    type="number"
                                    value={formData.start_year}
                                    onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) })}
                                    placeholder="2024"
                                    className="h-12 bg-muted/50 border-transparent rounded-xl font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold ml-1">End Year</Label>
                                <Input
                                    type="number"
                                    value={formData.end_year}
                                    onChange={(e) => setFormData({ ...formData, end_year: parseInt(e.target.value) })}
                                    placeholder="2025"
                                    className="h-12 bg-muted/50 border-transparent rounded-xl font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors">
                            <Checkbox
                                id="is_current"
                                checked={formData.is_current}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked as boolean })}
                                className="w-5 h-5 rounded-md border-primary data-[state=checked]:bg-primary"
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="is_current" className="text-sm font-bold cursor-pointer">Set as Current Year</Label>
                                <p className="text-[10px] text-muted-foreground font-medium">This will make it the active period for the institution</p>
                            </div>
                        </div>

                        <DialogFooter className="pt-4 flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="h-12 flex-1 rounded-xl border-border/50 font-bold">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting} className="h-12 flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                Create Year
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Enrollment Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-primary p-10 text-primary-foreground relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-bold font-heading leading-none">Term Enrollments</DialogTitle>
                                    <DialogDescription className="text-primary-foreground/80 mt-2 font-medium">
                                        Active student enrollments for Academic Year {selectedYear?.start_year}-{selectedYear?.end_year}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border/50">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Enrolled</p>
                                <p className="text-2xl font-bold text-primary">--</p>
                            </div>
                            <div className="flex-1 border-l border-border/50 pl-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                                <p className="text-xl font-bold text-green-500">{selectedYear?.is_current ? "active" : "inactive"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold ml-1 uppercase tracking-widest text-muted-foreground">Recent Enrollments</h4>
                            <div className="rounded-2xl border border-border/50 overflow-hidden">
                                <Table>
                                    <TableBody>
                                        {mockEnrollments.map((enr) => (
                                            <TableRow key={enr.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                                                <TableCell className="py-4 font-bold">{enr.studentName}</TableCell>
                                                <TableCell className="py-4 text-sm text-muted-foreground">{enr.grade}</TableCell>
                                                <TableCell className="py-4">
                                                    <Badge className={enr.status === "confirmed" ? "bg-green-500/10 text-green-600 border-none px-3" : "bg-amber-500/10 text-amber-600 border-none px-3"}>
                                                        {enr.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="py-4 text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-0">
                        <Button variant="outline" className="h-12 flex-1 rounded-xl border-border/50 font-bold" onClick={() => setIsDetailsOpen(false)}>
                            Close Records
                        </Button>
                        <Button className="h-12 flex-1 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => window.location.href = '/dashboard/academics/enrollment'}>
                            Manage All Enrollments
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

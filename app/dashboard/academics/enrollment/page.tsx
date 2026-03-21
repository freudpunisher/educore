"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Plus,
    UserPlus,
    Filter,
    Download,
    MoreHorizontal,
    GraduationCap
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function EnrollmentPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const mockEnrollments = [
        { id: "ENR-001", studentName: "Jean Dupont", grade: "10th Grade", year: "2024-2025", date: "2024-08-15", status: "confirmed" },
        { id: "ENR-002", studentName: "Marie Curie", grade: "12th Grade", year: "2024-2025", date: "2024-08-16", status: "confirmed" },
        { id: "ENR-003", studentName: "Albert Einstein", grade: "11th Grade", year: "2023-2024", date: "2023-08-17", status: "completed" },
        { id: "ENR-004", studentName: "Isaac Newton", grade: "9th Grade", year: "2024-2025", date: "2024-08-18", status: "confirmed" },
        { id: "ENR-005", studentName: "Ada Lovelace", grade: "10th Grade", year: "2024-2025", date: "2024-08-20", status: "confirmed" },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">Student Enrollment</h1>
                    <p className="text-muted-foreground font-medium mt-1">Registry of all student placements and academic term assignments</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-border/50">
                        <Download className="w-4 h-4 mr-2" />
                        Export List
                    </Button>
                    <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Enroll Student
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[1.5rem] p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student or ID..."
                            className="pl-12 h-12 bg-muted/50 border-transparent focus:bg-background transition-all rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select defaultValue="2024-2025">
                        <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl font-bold">
                            <SelectValue placeholder="Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                        <SelectTrigger className="h-12 bg-muted/50 border-transparent rounded-xl font-bold">
                            <SelectValue placeholder="Filter Grade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Grades</SelectItem>
                            <SelectItem value="9">9th Grade</SelectItem>
                            <SelectItem value="10">10th Grade</SelectItem>
                            <SelectItem value="11">11th Grade</SelectItem>
                            <SelectItem value="12">12th Grade</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Table */}
            <Card className="border-none shadow-2xl shadow-primary/5 bg-background/60 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                    <div className="rounded-2xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Enrollment ID</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Student</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Grade/Level</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Year</TableHead>
                                    <TableHead className="py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Status</TableHead>
                                    <TableHead className="py-5 text-right font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockEnrollments.map((enr) => (
                                    <TableRow key={enr.id} className="border-border/50 hover:bg-muted/30 transition-colors group">
                                        <TableCell className="py-6 font-bold text-sm tracking-tight text-primary">{enr.id}</TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground">
                                                    {enr.studentName.charAt(0)}
                                                </div>
                                                <span className="font-bold">{enr.studentName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6">
                                            <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
                                                <GraduationCap className="w-4 h-4" />
                                                {enr.grade}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-6 font-bold text-sm">{enr.year}</TableCell>
                                        <TableCell className="py-6">
                                            <Badge className={enr.status === "confirmed" ? "bg-green-500/10 text-green-600 border-none px-3 font-bold" : "bg-blue-500/10 text-blue-600 border-none px-3 font-bold"}>
                                                {enr.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-6 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

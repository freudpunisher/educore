"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Download, Eye, GraduationCap, Mail, Phone, User } from "lucide-react"
import { mockTeachers } from "@/lib/mock-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function TeachersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    const filteredTeachers = mockTeachers.filter((teacher) => {
        const matchesSearch =
            teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || teacher.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-heading font-extrabold tracking-tight text-foreground">
                        Academic Staff
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        Managing <span className="text-primary font-bold">{mockTeachers.length}</span> institutional educators
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-primary/20 text-primary font-bold px-6 h-12">
                        <Download className="w-4 h-4 mr-2" />
                        Export Roster
                    </Button>
                    <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground px-6 h-12">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Faculty Member
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden bg-background">
                <CardHeader className="p-8 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <CardTitle className="text-2xl font-bold font-heading">Teacher Directory</CardTitle>
                    <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                        <div className="relative group flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search staff, subjects, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 h-12 bg-muted/30 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] h-12 bg-muted/30 border-none rounded-xl font-bold focus:ring-primary/20">
                                <Filter className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                                <SelectItem value="all">Global Roster</SelectItem>
                                <SelectItem value="active">Active Faculty</SelectItem>
                                <SelectItem value="inactive">Retired/Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="overflow-hidden rounded-[1.5rem] border border-border/40 shadow-sm bg-muted/10">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-border/40">
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60">Educator Profile</TableHead>
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60">Expertise</TableHead>
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60">Engagement</TableHead>
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60">Status</TableHead>
                                    <TableHead className="py-5 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/60 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                                    <Search className="w-8 h-8 text-muted-foreground/40" />
                                                </div>
                                                <p className="font-bold text-muted-foreground/60">No faculty matching your criteria</p>
                                                <Button variant="ghost" className="text-primary font-bold" onClick={() => { setSearchQuery(""); setStatusFilter("all") }}>Clear Filters</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <TableRow key={teacher.id} className="group hover:bg-muted/20 transition-colors border-border/30">
                                            <TableCell className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm group-hover:scale-110">
                                                        {teacher.photo ? (
                                                            <img src={teacher.photo} alt={teacher.firstName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg text-foreground/90">{teacher.firstName} {teacher.lastName}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">ID: FAC-{teacher.id.padStart(3, '0')}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1 rounded-lg">
                                                    {teacher.specialization}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {teacher.classes.map((cls) => (
                                                            <Badge key={cls} variant="secondary" className="bg-muted text-muted-foreground border-none text-[9px] font-bold uppercase rounded-md px-1.5 h-5 flex items-center">
                                                                {cls}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {teacher.email.split('@')[0]}</span>
                                                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {teacher.phone}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full animate-pulse",
                                                        teacher.status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                                                    )} />
                                                    <span className={cn(
                                                        "font-bold text-xs uppercase tracking-widest",
                                                        teacher.status === "active" ? "text-emerald-600" : "text-rose-600"
                                                    )}>
                                                        {teacher.status}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-5 text-right">
                                                <Link href={`/dashboard/teachers/${teacher.id}`}>
                                                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                                        <Eye className="w-5 h-5" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

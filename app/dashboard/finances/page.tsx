"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Download,
  TrendingUp,
  DollarSign,
  CreditCard,
  Search,
  Filter,
  Printer,
  Users,
  School,
  Calendar,
  Eye,
  Receipt,
  Wallet
} from "lucide-react"
import { useFinanceOverview } from "@/hooks/use-finance"
import { Loader2 } from "lucide-react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts"
import { cn } from "@/lib/utils"

export default function FinancesPage() {
  const { data: overview, isLoading } = useFinanceOverview()
  const [searchTerm, setSearchTerm] = useState("")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const revenueData = overview?.revenueData || []
  const recentInvoices = overview?.recentInvoices || []

  const totalRevenue = overview?.totalRevenue || 0
  const totalBalance = overview?.totalBalance || 0
  const overdueCount = overview?.overdueCount || 0

  const filteredInvoices = recentInvoices.filter(invoice => {
    const matchesSearch = (invoice.student_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.reference || "").toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handlePrintStatement = (invoice: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Fee Statement - ${invoice.student_name}</title>
            <style>
              body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
              .header { display: flex; justify-content: space-between; border-bottom: 3px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 40px; }
              .logo-box img { height: 60px; margin-bottom: 10px; }
              .school-info { font-size: 14px; color: #64748b; }
              .statement-title { text-align: right; }
              .statement-title h1 { margin: 0; color: #0f172a; font-size: 28px; letter-spacing: -0.025em; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
              .info-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
              .info-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
              .info-value { font-size: 16px; font-weight: 600; color: #334155; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { text-align: left; padding: 16px; background: #0f172a; color: white; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
              td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
              .amount-col { text-align: right; font-family: 'Courier New', monospace; font-weight: bold; }
              .summary-box { margin-top: 40px; border-top: 2px solid #0f172a; padding-top: 20px; }
              .summary-row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 10px; }
              .summary-label { font-weight: 600; color: #64748b; }
              .summary-value { font-weight: 800; font-size: 18px; color: #0f172a; }
              .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
                <div class="logo-box">
                    <img src="/logo.png" alt="School Logo" />
                    <div class="school-info">
                        <strong>ACADEMIC EXCELLENCE INSTITUTE</strong><br/>
                        123 Education Boulevard, Bujumbura<br/>
                        contact@school.bi | +257 22 00 00 00
                    </div>
                </div>
                <div class="statement-title">
                    <h1>FEE STATEMENT</h1>
                    <div style="color: #64748b; font-weight: 600;">Ref: ${invoice.reference}</div>
                    <div style="color: #94a3b8; font-size: 13px;">Date: ${new Date().toLocaleDateString()}</div>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <div class="info-label">Student Information</div>
                    <div class="info-value">${invoice.student_name}</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">ID: STU-${invoice.student_id}</div>
                    <div style="font-size: 13px; color: #64748b;">Period: ${invoice.period_name}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Payment Status</div>
                    <div style="font-size: 18px; font-weight: 800; color: ${invoice.status === 1 ? '#059669' : '#e11d48'};">
                        ${invoice.status_name.toUpperCase()}
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Due Date: ${invoice.dueDate}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Total Amount</th>
                        <th style="text-align: right;">Paid</th>
                        <th style="text-align: right;">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>${invoice.fees_detail?.label || 'General Fee'}</strong><br/><small style="color: #64748b;">Code: ${invoice.fees_detail?.code || 'N/A'}</small></td>
                        <td class="amount-col">${Number(invoice.amount).toLocaleString()} FBU</td>
                        <td class="amount-col" style="color: #059669;">${Number(invoice.amount_paid).toLocaleString()} FBU</td>
                        <td class="amount-col" style="color: #e11d48;">${Number(invoice.balance).toLocaleString()} FBU</td>
                    </tr>
                </tbody>
            </table>

            <div class="summary-box">
                <div class="summary-row">
                    <div class="summary-label">Total Outstanding:</div>
                    <div class="summary-value" style="color: #e11d48;">${Number(invoice.balance).toLocaleString()} FBU</div>
                </div>
            </div>

            <div class="footer">
                This is a computer-generated document. No signature required.<br/>
                &copy; ${new Date().getFullYear()} School Management System. All rights reserved.
            </div>

            <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
          </body>
        </html>
      `;
    printWindow.document.write(html);
    printWindow.document.close();
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground italic">Finance Dashboard</h1>
          <p className="text-muted-foreground font-medium mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Academic Year 2023-2024 • Institutional Performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-2 hover:bg-slate-50 transition-all font-bold h-12 px-6">
            <Download className="w-4 h-4 mr-2" />
            Annual Report
          </Button>
          <Button className="rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-bold h-12 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Record Transaction
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pb-2">
        <Card className="border-none shadow-2xl shadow-primary/5 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-[2rem] overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="w-24 h-24 rotate-12" />
          </div>
          <CardContent className="p-8">
            <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-1">Total Collected</p>
            <div className="text-3xl font-black mb-4">{totalRevenue.toLocaleString()} FBU</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>Institutional Revenue</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-500/10 px-2 py-1 rounded-lg">Outstanding</span>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Pending Balance</p>
            <div className="text-3xl font-black text-foreground">{totalBalance.toLocaleString()} FBU</div>
            <p className="text-xs text-muted-foreground font-medium mt-2">Awaiting from {recentInvoices.filter(i => i.status === 0).length} students</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-1 rounded-lg">Overdue</span>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Unpaid Invoices</p>
            <div className="text-3xl font-black text-foreground">{overdueCount}</div>
            <p className="text-xs text-rose-500 font-bold mt-2 flex items-center gap-1">
              Requires administrative action
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl shadow-primary/5 bg-card rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <School className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg">Efficiency</span>
            </div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">Collection Rate</p>
            <div className="text-3xl font-black text-foreground">
              {totalRevenue > 0 ? ((totalRevenue / (totalRevenue + totalBalance)) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-2">Performance metrics</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Charts */}
      <Card className="border-none shadow-2xl shadow-primary/5 bg-card rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2 italic">
              <TrendingUp className="w-5 h-5 text-primary" />
              Revenue Growth
            </CardTitle>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" /> Revenue (FBU)
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="month" className="text-[10px] font-bold text-muted-foreground" axisLine={false} tickLine={false} />
                <YAxis className="text-[10px] font-bold text-muted-foreground" axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filtering & Reporting Section */}
      <div className="grid gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search student or reference..."
                className="pl-12 h-12 bg-card border-border rounded-2xl shadow-sm focus:ring-primary transition-all font-bold italic"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-card border border-border shadow-sm hover:bg-muted font-bold">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-card border border-border shadow-sm hover:bg-muted font-bold">
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="invoices" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="bg-muted p-1 rounded-2xl h-12 flex items-center px-4">
              <span className="font-bold text-sm px-4">Recent Invoices</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                Mark all as reviewed
              </Button>
            </div>
          </div>

          <TabsContent value="invoices">
            <Card className="border-none shadow-2xl shadow-primary/5 bg-card rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="py-6 pl-8 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Reference</TableHead>
                      <TableHead className="py-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Student / Details</TableHead>
                      <TableHead className="py-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Total Amount</TableHead>
                      <TableHead className="py-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Paid</TableHead>
                      <TableHead className="py-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</TableHead>
                      <TableHead className="py-6 pr-8 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-border hover:bg-muted/30 transition-colors group">
                        <TableCell className="py-6 pl-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-bold text-foreground leading-none mb-1">{invoice.reference}</div>
                              <div className="text-[11px] font-semibold text-muted-foreground">{invoice.period_name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="font-bold text-foreground leading-none mb-1">{invoice.student_name}</div>
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-lg">
                            {invoice.entity_name}
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <span className="font-black text-foreground">{Number(invoice.amount).toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-emerald-600">{Number(invoice.amount_paid).toLocaleString()}</span>
                            {Number(invoice.balance) > 0 && (
                              <span className="text-[10px] font-bold text-muted-foreground">Rem: {Number(invoice.balance).toLocaleString()}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge
                            className={cn(
                              "rounded-xl px-3 py-1 text-[10px] font-bold border-none",
                              invoice.status === 1
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-orange-500/10 text-orange-600"
                            )}
                          >
                            {invoice.status_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 pr-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-md transition-all">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-md transition-all text-primary"
                              onClick={() => handlePrintStatement(invoice)}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-20">
                            <Users className="w-12 h-12" />
                            <p className="font-bold text-foreground">No results found for your filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

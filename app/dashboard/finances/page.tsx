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
  Wallet,
  Landmark,
  ArrowRightLeft,
  CheckCircle2,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import { useFinanceOverview, useInvoices, usePayments, useCancelInvoice } from "@/hooks/use-finance"
import { Loader2 } from "lucide-react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from "recharts"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { canManage } from "@/lib/access-control"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function FinancesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { data: overview, isLoading } = useFinanceOverview()
  const cancelMutation = useCancelInvoice()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("invoices")
  const [invoicePage, setInvoicePage] = useState(1)
  const [paymentPage, setPaymentPage] = useState(1)
  const [cancelInvoice, setCancelInvoice] = useState<typeof overview['recentInvoices'][0] | null>(null)
  const cancelRoles = ["director", "system_admin", "global_control"]

  const { data: invoicesData, isLoading: loadingInvoices, isError: invoicesError } = useInvoices(
    activeTab === "invoices" ? { page: invoicePage, page_size: 10, search: searchTerm || undefined } : { page: 1 }
  )
  const { data: paymentsData, isLoading: loadingPayments } = usePayments(
    activeTab === "payments" ? { page: paymentPage } : { page: 1 }
  )

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

  const invoices = invoicesData?.results || []
  const invoiceCount = invoicesData?.count || 0
  const payments = paymentsData?.results || []
  const paymentCount = paymentsData?.count || 0

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
                        <strong>ROOTED IN CHRIST, READY FOR TOMORROW</strong><br/>
                        GIHOSHA No 7 AVE BUKIRIRO,BUJUMBURA,BURUNDI<br/>
                        info@discoveryschoolburundi.org | +257 22 23 20 59 <br/>
                        discoveryschoolburundi.org
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
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Date: ${invoice.date}</div>
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
                BCB:00200051833-33, BANCOBU:003924720101-19, BANCOBU-BUS:03924720107, BANCOBU-RESTAURANT:03924720108, LUMICASH:444555, ECOCASH:03030 <br/>
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
          {canManage(user?.role, "finance") && (
            <Button className="rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-bold h-12 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Record Transaction
            </Button>
          )}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted p-1 rounded-2xl h-12">
              <TabsTrigger value="invoices" className="rounded-xl font-bold text-sm px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Receipt className="w-4 h-4 mr-2" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-xl font-bold text-sm px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Payments
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {canManage(user?.role, "finance") && (
                <Button variant="ghost" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  Mark all as reviewed
                </Button>
              )}
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
                    {invoicesError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                              <Wallet className="w-6 h-6 text-destructive" />
                            </div>
                            <p className="font-bold text-foreground">Failed to load invoices</p>
                            <p className="text-sm text-muted-foreground">Please try again later</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : loadingInvoices ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-20 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-20">
                            <Users className="w-12 h-12" />
                            <p className="font-bold text-foreground">No invoices found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : invoices.map((invoice) => (
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-md transition-all"
                              onClick={() => invoice.student_id && router.push(`/dashboard/students/${invoice.student_id}`)}
                            >
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
                            {cancelRoles.includes(user?.role || "") && invoice.status === 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:shadow-md transition-all text-destructive"
                                onClick={() => setCancelInvoice(invoice)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination for Invoices */}
                {invoiceCount > 0 && (
                  <div className="flex items-center justify-between px-8 py-4 border-t border-border">
                    <div className="text-sm text-muted-foreground font-medium">
                      Showing {(invoicePage - 1) * 10 + 1} to {Math.min(invoicePage * 10, invoiceCount)} of {invoiceCount} invoices
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                        disabled={invoicePage <= 1 || loadingInvoices}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInvoicePage((p) => p + 1)}
                        disabled={invoicePage * 10 >= invoiceCount || loadingInvoices}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="border-none shadow-2xl shadow-primary/5 bg-card rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="py-6 pl-8 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Reference</TableHead>
                      <TableHead className="py-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Invoice</TableHead>
                      <TableHead className="py-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Amount</TableHead>
                      <TableHead className="py-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Mode</TableHead>
                      <TableHead className="py-6 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Doc</TableHead>
                      <TableHead className="py-6 pr-8 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPayments ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-20 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-20">
                            <Landmark className="w-12 h-12" />
                            <p className="font-bold text-foreground">No payments recorded yet</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id} className="border-border hover:bg-muted/30 transition-colors group">
                          <TableCell className="py-6 pl-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <div className="font-bold text-foreground leading-none mb-1">PAY-{payment.id}</div>
                                <div className="text-[11px] font-semibold text-muted-foreground">{payment.payment_mode_name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="font-bold text-foreground leading-none mb-1">{payment.invoice_reference}</div>
                            <div className="text-[11px] font-semibold text-muted-foreground">{payment.student_name || `Invoice #${payment.invoice}`}</div>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className="font-black text-emerald-600">{Number(payment.amount).toLocaleString()} FBU</span>
                          </TableCell>
                          <TableCell className="py-6">
                            <Badge variant="outline" className="rounded-xl px-3 py-1 text-[10px] font-bold">
                              {payment.payment_mode_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-6">
                            {payment.document ? (
                              <a href={payment.document} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-background hover:shadow-md transition-all">
                                  <Eye className="w-4 h-4 text-primary" />
                                </Button>
                              </a>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-bold">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-6 pr-8 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl hover:bg-background hover:shadow-md transition-all"
                              onClick={() => payment.student_id && router.push(`/dashboard/students/${payment.student_id}`)}
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination for Payments */}
                {paymentCount > 0 && (
                  <div className="flex items-center justify-between px-8 py-4 border-t border-border">
                    <div className="text-sm text-muted-foreground font-medium">
                      Showing {(paymentPage - 1) * 10 + 1} to {Math.min(paymentPage * 10, paymentCount)} of {paymentCount} payments
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                        disabled={paymentPage <= 1 || loadingPayments}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentPage((p) => p + 1)}
                        disabled={paymentPage * 10 >= paymentCount || loadingPayments}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!cancelInvoice} onOpenChange={(v) => { if (!v) setCancelInvoice(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel invoice <strong>{cancelInvoice?.reference}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center rounded-xl border p-4 bg-muted/30">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Student</span>
                <span className="font-bold text-foreground">{cancelInvoice?.student_name || "Institutional Fee"}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Amount</span>
                <span className="font-bold">{Number(cancelInvoice?.amount || 0).toLocaleString("en-US")} FBU</span>
              </div>
            </div>
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                Cancelling this invoice will mark it as cancelled. This is irreversible.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelInvoice(null)} disabled={cancelMutation.isPending}>
              Keep Invoice
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!cancelInvoice) return;
                cancelMutation.mutate(cancelInvoice.id, {
                  onSuccess: () => {
                    toast.success(`Invoice ${cancelInvoice.reference} cancelled successfully.`);
                    setCancelInvoice(null);
                  },
                  onError: (err: any) => {
                    const msg = err.response?.data?.message || "Failed to cancel invoice.";
                    toast.error(msg);
                  }
                });
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { mockInvoices, mockExpenses } from "@/lib/mock-data"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Pie, PieChart, Cell } from "recharts"

const revenueData = [
  { month: "Jan", revenue: 38000, expenses: 25000 },
  { month: "Feb", revenue: 40000, expenses: 26000 },
  { month: "Mar", revenue: 42000, expenses: 27000 },
  { month: "Apr", revenue: 43000, expenses: 28000 },
  { month: "May", revenue: 44000, expenses: 26500 },
  { month: "Jun", revenue: 45231, expenses: 28850 },
]

const expensesByCategory = [
  { name: "Salaries", value: 15000, color: "hsl(var(--chart-1))" },
  { name: "Supplies", value: 2500, color: "hsl(var(--chart-2))" },
  { name: "Maintenance", value: 850, color: "hsl(var(--chart-3))" },
  { name: "Utilities", value: 450, color: "hsl(var(--chart-4))" },
]

export default function FinancesPage() {
  const totalRevenue = mockInvoices.filter((i) => i.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
  const pendingRevenue = mockInvoices.filter((i) => i.status === "pending").reduce((sum, inv) => sum + inv.amount, 0)
  const overdueRevenue = mockInvoices.filter((i) => i.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0)
  const totalExpenses = mockExpenses.filter((e) => e.status === "approved").reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finances</h1>
          <p className="text-muted-foreground mt-1">Manage institutional revenue, invoices, and expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collected Revenue</CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">+12%</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <div className="p-2 rounded-lg bg-orange-100">
              <CreditCard className="w-4 h-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockInvoices.filter((i) => i.status === "pending").length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <div className="p-2 rounded-lg bg-red-100">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overdueRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockInvoices.filter((i) => i.status === "overdue").length} invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-600">+5%</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Invoices and Expenses Tables */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.studentName}</TableCell>
                        <TableCell className="capitalize">{invoice.type}</TableCell>
                        <TableCell>${invoice.amount}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString("en-US")}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : invoice.status === "overdue"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {invoice.status === "paid"
                              ? "Paid"
                              : invoice.status === "overdue"
                                ? "Overdue"
                                : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Expense No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.id}</TableCell>
                        <TableCell>{new Date(expense.date).toLocaleDateString("en-US")}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>${expense.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              expense.status === "approved"
                                ? "default"
                                : expense.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {expense.status === "approved"
                              ? "Approved"
                              : expense.status === "rejected"
                                ? "Rejected"
                                : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

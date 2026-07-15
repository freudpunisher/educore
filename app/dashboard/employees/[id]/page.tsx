"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEmployeeDetail, useEmployeeInvoices, useEmployeeDistributions } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Loader2, AlertCircle, User, Mail, Phone, MapPin,
  Briefcase, Receipt, Package, Calendar, ShieldCheck, Hash
} from "lucide-react";

const roleLabels: Record<string, string> = {
  system_admin: "System Admin",
  global_control: "Global Control",
  body_control: "Body Control (Audit)",
  director: "Director",
  academic_principal: "Academic Manager",
  discipline_principal: "Discipline Manager",
  receptionist: "Receptionist",
  accountant: "Accountant",
  hr: "HR Manager",
  transporter: "Transport Supervisor",
  driver: "Driver",
  teacher: "Teacher",
  boarding: "Boarding Supervisor",
  daycare: "Daycare Supervisor",
  restaurant: "Restaurant Supervisor",
  storage: "Inventory & Logistics Officer",
};

export default function EmployeeDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const employeeId = id ? Number(id) : null;

  const { data: employee, isLoading, error } = useEmployeeDetail(employeeId);

  const employeeName = employee ? `${employee.user.first_name} ${employee.user.last_name}`.trim() : null;
  const isRestaurant = employee?.role === "restaurant";
  const isStorage = employee?.role === "storage";

  const { data: invoicesData } = useEmployeeInvoices(employeeName, isRestaurant);
  const { data: distributionsData } = useEmployeeDistributions(employeeName, isStorage);

  const invoices = invoicesData?.results || [];
  const distributions = distributionsData?.results || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-5">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border-4 border-muted" />
          <span className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <Briefcase className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground tracking-wide text-sm uppercase">Loading Profile</p>
          <p className="text-muted-foreground text-sm">Fetching employee record...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-6 gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-destructive/8 border border-destructive/15 flex items-center justify-center">
            <AlertCircle className="h-9 w-9 text-destructive/70" />
          </div>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive/20 border-2 border-background" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Employee not found</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This record may have been removed or the link is no longer valid.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => router.push("/dashboard/employees")}>
          <ArrowLeft className="w-4 h-4" />
          Return to employees
        </Button>
      </div>
    );
  }

  const statusBadge = employee.is_deleted
    ? <Badge variant="destructive">Deleted</Badge>
    : <Badge variant={employee.active ? "default" : "secondary"}>{employee.active ? "Active" : "Inactive"}</Badge>;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2.5">
            <button
              onClick={() => router.push("/dashboard/employees")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Employees
            </button>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-none">
                {employee.user.first_name} {employee.user.last_name}
              </h1>
              {statusBadge}
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-border/80 via-border/30 to-transparent" />

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info" className="gap-2">
              <User className="w-4 h-4" />
              Information
            </TabsTrigger>
            {isRestaurant && (
              <TabsTrigger value="invoices" className="gap-2">
                <Receipt className="w-4 h-4" />
                Restaurant Invoices
              </TabsTrigger>
            )}
            {isStorage && (
              <TabsTrigger value="distributions" className="gap-2">
                <Package className="w-4 h-4" />
                Distributions
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{employee.user.email || "---"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{employee.phone_number || "---"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium">{employee.address || "---"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p className="font-medium">@{employee.user.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account ID</p>
                      <p className="font-mono font-medium">{employee.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="font-medium">{roleLabels[employee.role] || employee.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${employee.active ? "bg-green-500" : "bg-gray-400"}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium">{employee.active ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
    
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isRestaurant && (
            <TabsContent value="invoices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    Restaurant Invoices
                  </CardTitle>
                  <CardDescription>Invoices related to meal services handled by this employee</CardDescription>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-8 text-center">No invoices found.</p>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border bg-card/50">
                          <div>
                            <p className="font-medium text-sm">{inv.reference || `#${inv.id}`}</p>
                            <p className="text-xs text-muted-foreground">{inv.entity_display || "N/A"}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{Number(inv.amount).toLocaleString()} FBU</p>
                            <p className="text-xs text-muted-foreground">
                              {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isStorage && (
            <TabsContent value="distributions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Storage Distributions
                  </CardTitle>
                  <CardDescription>Non-food item distributions handled by this employee</CardDescription>
                </CardHeader>
                <CardContent>
                  {distributions.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-8 text-center">No distributions found.</p>
                  ) : (
                    <div className="space-y-3">
                      {distributions.map((d) => (
                        <div key={d.id} className="flex items-center justify-between p-4 rounded-xl border bg-card/50">
                          <div>
                            <p className="font-medium text-sm">{d.product_name || `Product #${d.id}`}</p>
                            <p className="text-xs text-muted-foreground">
                              {d.recipient_name ? `To: ${d.recipient_name}` : ""}
                              {d.status ? ` · ${d.status}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{d.quantity ?? "—"} units</p>
                            <p className="text-xs text-muted-foreground">
                              {d.distribution_date ? new Date(d.distribution_date).toLocaleDateString() : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

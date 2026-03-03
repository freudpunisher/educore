"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Bell, Shield, Save } from "lucide-react"

const users = [
  { id: "1", name: "Marie Dubois", email: "marie.dubois@school.fr", role: "Admin", status: "active" },
  { id: "2", name: "Jean Martin", email: "jean.martin@school.fr", role: "Teacher", status: "active" },
  { id: "3", name: "Pierre Leroy", email: "pierre.leroy@school.fr", role: "Driver", status: "active" },
  { id: "4", name: "Sophie Bernard", email: "sophie.bernard@school.fr", role: "Parent", status: "active" },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage school settings and permissions</p>
      </div>

      <Tabs defaultValue="school" className="space-y-4">
        <TabsList>
          <TabsTrigger value="school">
            <Building2 className="w-4 h-4 mr-2" />
            School
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Manage general information about your institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input id="schoolName" defaultValue="Saint-Martin Primary School" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">School Code</Label>
                  <Input id="schoolCode" defaultValue="ESM-2024" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Education Street, 75001 Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue="01 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="contact@ecole-saint-martin.fr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="director">Director</Label>
                  <Input id="director" defaultValue="Mrs Catherine Dubois" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input id="academicYear" defaultValue="2024-2025" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">School Hours</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="openTime">Opening Time</Label>
                    <Input id="openTime" type="time" defaultValue="07:30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime">Closing Time</Label>
                    <Input id="closeTime" type="time" defaultValue="18:00" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage accounts and user permissions</CardDescription>
                </div>
                <Button>Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>
                            {user.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">Role Permissions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Administrator</p>
                      <p className="text-sm text-muted-foreground">Full access to all features</p>
                    </div>
                    <Badge>All rights</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Teacher</p>
                      <p className="text-sm text-muted-foreground">Manage classes, grades, and attendance</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Driver</p>
                      <p className="text-sm text-muted-foreground">Access to transport interface only</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Parent</p>
                      <p className="text-sm text-muted-foreground">View information about their children</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure notifications for different events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Enrollments</Label>
                      <p className="text-sm text-muted-foreground">Receive an email for new registrations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payments Received</Label>
                      <p className="text-sm text-muted-foreground">Notification upon receiving a payment</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Absences</Label>
                      <p className="text-sm text-muted-foreground">Alert for unjustified absences</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Transport Delays</Label>
                      <p className="text-sm text-muted-foreground">Notification for travel delays</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">SMS Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Emergencies</Label>
                      <p className="text-sm text-muted-foreground">SMS in case of emergency situations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Reminders</Label>
                      <p className="text-sm text-muted-foreground">SMS reminder for overdue invoices</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security and Privacy</CardTitle>
              <CardDescription>Manage security settings for your institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Password Policy</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Minimum Length</Label>
                      <p className="text-sm text-muted-foreground">Minimum number of characters required</p>
                    </div>
                    <Input type="number" defaultValue="8" className="w-20" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Password Expiration</Label>
                      <p className="text-sm text-muted-foreground">Force password change every X days</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Enable 2FA for all administrators</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Data Backup</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">Daily backup at 2:00 AM</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Last Backup</Label>
                      <p className="text-sm text-muted-foreground">Today at 2:00 AM</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Backup Now
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Activity Log</h3>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Login - Marie Dubois</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span>Student modified - Jean Martin</span>
                    <span className="text-muted-foreground">4 hours ago</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span>New invoice created</span>
                    <span className="text-muted-foreground">6 hours ago</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  View Full Log
                </Button>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

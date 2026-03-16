"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Mail, Shield, User, Calendar, Edit, Settings } from "lucide-react"

export default function ProfilePage() {
    const { user } = useAuth()

    if (!user) return null

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            admin: "Administrator",
            teacher: "Teacher",
            driver: "Driver",
            parent: "Parent",
        }
        return labels[role] || role
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="flex justify-center">
                            <Avatar className="w-24 h-24">
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                    {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">
                            {getRoleLabel(user.role)}
                        </Badge>
                        <Separator />
                        <div className="flex flex-col gap-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="w-4 h-4 mr-2" />
                                Account Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Detailed information about your school account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Full Name</p>
                                    <p className="text-sm text-muted-foreground">{user.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Email Address</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Account Role</p>
                                    <p className="text-sm text-muted-foreground">{getRoleLabel(user.role)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Member Since</p>
                                    <p className="text-sm text-muted-foreground">September 2023</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="font-semibold mb-4">Security</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Password</p>
                                        <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        Change
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Enhance your account security</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-primary">
                                        Enable
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

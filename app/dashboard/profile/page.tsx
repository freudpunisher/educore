"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Shield, User, MapPin, Phone, Calendar, Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { useChangePassword } from "@/hooks/use-change-password"

export default function ProfilePage() {
    const { user } = useAuth()
    const { data: profile, isLoading: profileLoading } = useProfile()
    const changePassword = useChangePassword()
    const [passwordDialog, setPasswordDialog] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")

    if (!user) return null

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            global_control: "Global Control",
            system_admin: "System Admin",
            body_control: "Body Control",
            director: "Director",
            academic_principal: "Academic Principal",
            discipline_principal: "Discipline Principal",
            receptionist: "Receptionist",
            accountant: "Accountant",
            hr: "Human Resources",
            driver: "Driver",
            teacher: "Teacher",
            student_parent: "Parent",
            student: "Student",
            boarding: "Boarding Manager",
            daycare: "Daycare Manager",
            restaurant: "Restaurant Manager",
            storage: "Storage Manager",
            none: "No Role",
        }
        return labels[role] || role
    }

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmNewPassword) return
        changePassword.mutate(
            { current_password: currentPassword, new_password: newPassword, confirm_new_password: confirmNewPassword },
            {
                onSuccess: () => {
                    setCurrentPassword("")
                    setNewPassword("")
                    setConfirmNewPassword("")
                    setTimeout(() => setPasswordDialog(false), 1500)
                },
            }
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Mon Profil</h1>
                <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et votre sécurité</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="flex justify-center">
                            <Avatar className="w-24 h-24">
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                    {user.fullName
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{user.fullName}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">
                            {getRoleLabel(user.role)}
                        </Badge>
                        <Separator />
                        {profile && profile.phone_number && (
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                {profile.phone_number}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Informations du compte</CardTitle>
                        <CardDescription>Détails de votre compte scolaire</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <User className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Nom complet</p>
                                    <p className="text-sm text-muted-foreground">{user.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Adresse email</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Rôle</p>
                                    <p className="text-sm text-muted-foreground">{getRoleLabel(user.role)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Adresse</p>
                                    <p className="text-sm text-muted-foreground">
                                        {profileLoading ? "..." : profile?.address || "Non renseignée"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Téléphone</p>
                                    <p className="text-sm text-muted-foreground">
                                        {profileLoading ? "..." : profile?.phone_number || "Non renseigné"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Membre depuis</p>
                                    <p className="text-sm text-muted-foreground">Septembre 2023</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h3 className="font-semibold mb-4">Sécurité</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Mot de passe</p>
                                        <p className="text-sm text-muted-foreground">Changez votre mot de passe régulièrement</p>
                                    </div>
                                    <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <Lock className="w-4 h-4 mr-1" />
                                                Modifier
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Changer le mot de passe</DialogTitle>
                                                <DialogDescription>
                                                    Saisissez votre mot de passe actuel puis votre nouveau mot de passe.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleChangePassword} className="space-y-4">
                                                {changePassword.isError && (
                                                    <Alert variant="destructive" className="rounded-xl border-none bg-destructive/10">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertDescription className="font-bold text-sm">
                                                            {(changePassword.error as any)?.response?.data?.message ||
                                                             (changePassword.error as any)?.response?.data?.errors?.new_password?.[0] ||
                                                             (changePassword.error as any)?.response?.data?.errors?.confirm_new_password?.[0] ||
                                                             (changePassword.error as any)?.response?.data?.errors?.current_password?.[0] ||
                                                             "Une erreur est survenue"}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                                {changePassword.isSuccess && (
                                                    <Alert variant="default" className="rounded-xl border-none bg-emerald-500/10 text-emerald-600">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <AlertDescription className="font-bold text-sm">
                                                            Mot de passe changé avec succès.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                                <div className="space-y-2">
                                                    <Label htmlFor="current_password">Mot de passe actuel</Label>
                                                    <Input
                                                        id="current_password"
                                                        type="password"
                                                        required
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="new_password">Nouveau mot de passe</Label>
                                                    <Input
                                                        id="new_password"
                                                        type="password"
                                                        required
                                                        minLength={8}
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="confirm_new_password">Confirmer le mot de passe</Label>
                                                    <Input
                                                        id="confirm_new_password"
                                                        type="password"
                                                        required
                                                        minLength={8}
                                                        value={confirmNewPassword}
                                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                    />
                                                    {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                                                        <p className="text-xs text-destructive font-bold ml-1">
                                                            Les mots de passe ne correspondent pas.
                                                        </p>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            changePassword.isPending ||
                                                            !currentPassword ||
                                                            !newPassword ||
                                                            !confirmNewPassword ||
                                                            newPassword !== confirmNewPassword
                                                        }
                                                    >
                                                        {changePassword.isPending ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                En cours...
                                                            </>
                                                        ) : (
                                                            "Changer le mot de passe"
                                                        )}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

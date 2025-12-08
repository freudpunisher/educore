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
  { id: "2", name: "Jean Martin", email: "jean.martin@school.fr", role: "Enseignant", status: "active" },
  { id: "3", name: "Pierre Leroy", email: "pierre.leroy@school.fr", role: "Chauffeur", status: "active" },
  { id: "4", name: "Sophie Bernard", email: "sophie.bernard@school.fr", role: "Parent", status: "active" },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez les paramètres de votre établissement et les permissions</p>
      </div>

      <Tabs defaultValue="school" className="space-y-4">
        <TabsList>
          <TabsTrigger value="school">
            <Building2 className="w-4 h-4 mr-2" />
            École
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'École</CardTitle>
              <CardDescription>Gérez les informations générales de votre établissement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nom de l'École</Label>
                  <Input id="schoolName" defaultValue="École Primaire Saint-Martin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolCode">Code Établissement</Label>
                  <Input id="schoolCode" defaultValue="ESM-2024" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" defaultValue="123 Rue de l'Éducation, 75001 Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" defaultValue="01 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="contact@ecole-saint-martin.fr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="director">Directeur/Directrice</Label>
                  <Input id="director" defaultValue="Mme Catherine Dubois" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Année Scolaire</Label>
                  <Input id="academicYear" defaultValue="2024-2025" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Horaires de l'École</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="openTime">Heure d'Ouverture</Label>
                    <Input id="openTime" type="time" defaultValue="07:30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeTime">Heure de Fermeture</Label>
                    <Input id="closeTime" type="time" defaultValue="18:00" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les Modifications
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
                  <CardTitle>Gestion des Utilisateurs</CardTitle>
                  <CardDescription>Gérez les comptes et les permissions des utilisateurs</CardDescription>
                </div>
                <Button>Ajouter un Utilisateur</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
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
                            {user.status === "active" ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Modifier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="font-semibold">Permissions par Rôle</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Administrateur</p>
                      <p className="text-sm text-muted-foreground">Accès complet à toutes les fonctionnalités</p>
                    </div>
                    <Badge>Tous les droits</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Enseignant</p>
                      <p className="text-sm text-muted-foreground">Gestion des classes, notes et présences</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Chauffeur</p>
                      <p className="text-sm text-muted-foreground">Accès à l'interface de transport uniquement</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Parent</p>
                      <p className="text-sm text-muted-foreground">Consultation des informations de leurs enfants</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurer
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
              <CardTitle>Préférences de Notification</CardTitle>
              <CardDescription>Configurez les notifications pour les différents événements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Notifications Email</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Nouvelles Inscriptions</Label>
                      <p className="text-sm text-muted-foreground">Recevoir un email lors d'une nouvelle inscription</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Paiements Reçus</Label>
                      <p className="text-sm text-muted-foreground">Notification lors de la réception d'un paiement</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Absences</Label>
                      <p className="text-sm text-muted-foreground">Alerte en cas d'absence non justifiée</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Retards de Transport</Label>
                      <p className="text-sm text-muted-foreground">Notification en cas de retard sur les trajets</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Notifications SMS</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Urgences</Label>
                      <p className="text-sm text-muted-foreground">SMS en cas de situation d'urgence</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rappels de Paiement</Label>
                      <p className="text-sm text-muted-foreground">Rappel SMS pour les factures en retard</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les Préférences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité et Confidentialité</CardTitle>
              <CardDescription>Gérez les paramètres de sécurité de votre établissement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Politique de Mot de Passe</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Longueur Minimale</Label>
                      <p className="text-sm text-muted-foreground">Nombre minimum de caractères requis</p>
                    </div>
                    <Input type="number" defaultValue="8" className="w-20" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Expiration du Mot de Passe</Label>
                      <p className="text-sm text-muted-foreground">Forcer le changement tous les X jours</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Authentification à Deux Facteurs</Label>
                      <p className="text-sm text-muted-foreground">Activer 2FA pour tous les administrateurs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Sauvegarde des Données</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sauvegarde Automatique</Label>
                      <p className="text-sm text-muted-foreground">Sauvegarde quotidienne à 2h00</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dernière Sauvegarde</Label>
                      <p className="text-sm text-muted-foreground">Aujourd'hui à 02:00</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Sauvegarder Maintenant
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Journal d'Activité</h3>
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Connexion - Marie Dubois</span>
                    <span className="text-muted-foreground">Il y a 2 heures</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span>Modification élève - Jean Martin</span>
                    <span className="text-muted-foreground">Il y a 4 heures</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span>Nouvelle facture créée</span>
                    <span className="text-muted-foreground">Il y a 6 heures</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Voir Tout le Journal
                </Button>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les Paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

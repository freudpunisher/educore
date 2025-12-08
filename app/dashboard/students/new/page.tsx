"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function NewStudentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    router.push("/dashboard/students")
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/dashboard/students")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Nouvel Élève</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Informations de l'Élève</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input id="firstName" placeholder="Prénom" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input id="lastName" placeholder="Nom" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date de Naissance *</Label>
                  <Input id="dateOfBirth" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Genre *</Label>
                  <Select required>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Classe *</Label>
                  <Select required>
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6ème A">6ème A</SelectItem>
                      <SelectItem value="6ème B">6ème B</SelectItem>
                      <SelectItem value="5ème A">5ème A</SelectItem>
                      <SelectItem value="5ème B">5ème B</SelectItem>
                      <SelectItem value="4ème A">4ème A</SelectItem>
                      <SelectItem value="4ème B">4ème B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollmentDate">Date d'Inscription *</Label>
                  <Input id="enrollmentDate" type="date" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input id="address" placeholder="Adresse complète" required />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Informations du Parent/Tuteur</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Nom du Parent *</Label>
                  <Input id="parentName" placeholder="Nom complet" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Téléphone *</Label>
                  <Input id="parentPhone" type="tel" placeholder="06 12 34 56 78" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="parentEmail">Email *</Label>
                  <Input id="parentEmail" type="email" placeholder="parent@email.fr" required />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/students")}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

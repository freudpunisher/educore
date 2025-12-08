"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, UtensilsCrossed, Users, Calendar } from "lucide-react"

const weekMenu = [
  {
    day: "Lundi",
    starter: "Salade verte",
    main: "Poulet rôti et légumes",
    dessert: "Yaourt",
    meals: 145,
  },
  {
    day: "Mardi",
    starter: "Carottes râpées",
    main: "Poisson pané et riz",
    dessert: "Fruit",
    meals: 152,
  },
  {
    day: "Mercredi",
    starter: "Tomates mozzarella",
    main: "Pâtes bolognaise",
    dessert: "Compote",
    meals: 138,
  },
  {
    day: "Jeudi",
    starter: "Concombre vinaigrette",
    main: "Rôti de bœuf et purée",
    dessert: "Crème dessert",
    meals: 148,
  },
  {
    day: "Vendredi",
    starter: "Salade de tomates",
    main: "Pizza maison et salade",
    dessert: "Fruit",
    meals: 156,
  },
]

export default function MealsPage() {
  const totalMeals = weekMenu.reduce((sum, day) => sum + day.meals, 0)
  const avgMeals = Math.round(totalMeals / weekMenu.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Restauration</h1>
          <p className="text-muted-foreground mt-1">Gérez les menus et les inscriptions à la cantine</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Menu
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Repas Cette Semaine</CardTitle>
            <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeals}</div>
            <p className="text-xs text-muted-foreground mt-1">{avgMeals} repas/jour en moyenne</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inscrits Aujourd'hui</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground mt-1">Sur 1,234 élèves</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Services</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">11h30, 12h30, 13h30</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Menu */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Menu de la Semaine</CardTitle>
            <Badge>Semaine 25</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jour</TableHead>
                  <TableHead>Entrée</TableHead>
                  <TableHead>Plat Principal</TableHead>
                  <TableHead>Dessert</TableHead>
                  <TableHead>Repas Servis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekMenu.map((menu) => (
                  <TableRow key={menu.day}>
                    <TableCell className="font-medium">{menu.day}</TableCell>
                    <TableCell>{menu.starter}</TableCell>
                    <TableCell>{menu.main}</TableCell>
                    <TableCell>{menu.dessert}</TableCell>
                    <TableCell>{menu.meals}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle>Régimes Spéciaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Sans Gluten</span>
                <Badge variant="outline">12 élèves</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Menu adapté disponible</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Végétarien</span>
                <Badge variant="outline">28 élèves</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Alternative végétarienne</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Allergies</span>
                <Badge variant="outline">8 élèves</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Suivi personnalisé</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

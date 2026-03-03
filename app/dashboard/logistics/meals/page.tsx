"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, UtensilsCrossed, Users, Calendar } from "lucide-react"

const weekMenu = [
  {
    day: "Monday",
    starter: "Green salad",
    main: "Roast chicken and vegetables",
    dessert: "Yogurt",
    meals: 145,
  },
  {
    day: "Tuesday",
    starter: "Grated carrots",
    main: "Breaded fish and rice",
    dessert: "Fruit",
    meals: 152,
  },
  {
    day: "Wednesday",
    starter: "Tomato mozzarella",
    main: "Pasta bolognese",
    dessert: "Compote",
    meals: 138,
  },
  {
    day: "Thursday",
    starter: "Cucumber salad",
    main: "Roast beef and mashed potatoes",
    dessert: "Pudding",
    meals: 148,
  },
  {
    day: "Friday",
    starter: "Tomato salad",
    main: "Homemade pizza and salad",
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
          <h1 className="text-3xl font-bold">Catering</h1>
          <p className="text-muted-foreground mt-1">Manage menus and canteen registration</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Menu
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meals This Week</CardTitle>
            <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeals}</div>
            <p className="text-xs text-muted-foreground mt-1">{avgMeals} meals/day average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Today</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 1,234 students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Services</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">11:30, 12:30, 13:30</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Menu */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Menu</CardTitle>
            <Badge>Week 25</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Starter</TableHead>
                  <TableHead>Main Dish</TableHead>
                  <TableHead>Dessert</TableHead>
                  <TableHead>Meals Served</TableHead>
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
          <CardTitle>Special Diets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Gluten-Free</span>
                <Badge variant="outline">12 students</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Adapted menu available</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Vegetarian</span>
                <Badge variant="outline">28 students</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Vegetarian alternative</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Allergies</span>
                <Badge variant="outline">8 students</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Personalized tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

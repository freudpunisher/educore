"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, MapPin, Users, Clock, Smartphone } from "lucide-react"
import Link from "next/link"

interface Route {
  id: string
  name: string
  driver: string
  vehicle: string
  students: number
  status: "active" | "completed" | "delayed"
  departure: string
  arrival: string
  stops: number
}

const mockRoutes: Route[] = [
  {
    id: "1",
    name: "Route Nord",
    driver: "Pierre Leroy",
    vehicle: "Bus A - AB-123-CD",
    students: 45,
    status: "active",
    departure: "07:00",
    arrival: "08:00",
    stops: 8,
  },
  {
    id: "2",
    name: "Route Sud",
    driver: "Marie Dubois",
    vehicle: "Bus B - EF-456-GH",
    students: 38,
    status: "active",
    departure: "07:15",
    arrival: "08:15",
    stops: 6,
  },
  {
    id: "3",
    name: "Route Est",
    driver: "Jean Martin",
    vehicle: "Bus C - IJ-789-KL",
    students: 42,
    status: "completed",
    departure: "07:30",
    arrival: "08:30",
    stops: 7,
  },
  {
    id: "4",
    name: "Route Ouest",
    driver: "Sophie Bernard",
    vehicle: "Bus D - MN-012-OP",
    students: 40,
    status: "delayed",
    departure: "07:00",
    arrival: "08:00",
    stops: 9,
  },
]

export default function TransportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transport Scolaire</h1>
          <p className="text-muted-foreground mt-1">Gérez les itinéraires et suivez les bus en temps réel</p>
        </div>
        <div className="flex gap-2">
          <Link href="/driver">
            <Button variant="outline">
              <Smartphone className="w-4 h-4 mr-2" />
              Interface Chauffeur
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Route
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Routes Actives</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">En service maintenant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Élèves Transportés</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">165</div>
            <p className="text-xs text-muted-foreground mt-1">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Temps Moyen</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52 min</div>
            <p className="text-xs text-muted-foreground mt-1">Par trajet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retards</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Ce matin</p>
          </CardContent>
        </Card>
      </div>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itinéraires du Jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Élèves</TableHead>
                  <TableHead>Horaires</TableHead>
                  <TableHead>Arrêts</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRoutes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.name}</TableCell>
                    <TableCell>{route.driver}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{route.vehicle}</TableCell>
                    <TableCell>{route.students}</TableCell>
                    <TableCell className="text-sm">
                      {route.departure} - {route.arrival}
                    </TableCell>
                    <TableCell>{route.stops}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          route.status === "active"
                            ? "default"
                            : route.status === "delayed"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {route.status === "active" ? "En cours" : route.status === "delayed" ? "Retardé" : "Terminé"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

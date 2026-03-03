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
    name: "North Route",
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
    name: "South Route",
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
    name: "East Route",
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
    name: "West Route",
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
          <h1 className="text-3xl font-bold">School Transport</h1>
          <p className="text-muted-foreground mt-1">Manage routes and track buses in real-time</p>
        </div>
        <div className="flex gap-2">
          <Link href="/driver">
            <Button variant="outline">
              <Smartphone className="w-4 h-4 mr-2" />
              Driver Interface
            </Button>
          </Link>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Route
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Routes</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">In service now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Students Transported</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">165</div>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52 min</div>
            <p className="text-xs text-muted-foreground mt-1">Per trip</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delays</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">This morning</p>
          </CardContent>
        </Card>
      </div>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Status</TableHead>
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
                        {route.status === "active" ? "In progress" : route.status === "delayed" ? "Delayed" : "Completed"}
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

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Users, Clock, CheckCircle, Circle } from "lucide-react"

interface Stop {
  id: string
  name: string
  address: string
  students: number
  time: string
  completed: boolean
}

const mockStops: Stop[] = [
  {
    id: "1",
    name: "Arrêt Place de la République",
    address: "12 Place de la République",
    students: 8,
    time: "07:05",
    completed: true,
  },
  {
    id: "2",
    name: "Arrêt Rue Victor Hugo",
    address: "45 Rue Victor Hugo",
    students: 6,
    time: "07:15",
    completed: true,
  },
  {
    id: "3",
    name: "Arrêt Avenue des Champs",
    address: "78 Avenue des Champs",
    students: 5,
    time: "07:25",
    completed: false,
  },
  {
    id: "4",
    name: "Arrêt Boulevard Saint-Germain",
    address: "23 Boulevard Saint-Germain",
    students: 7,
    time: "07:35",
    completed: false,
  },
  {
    id: "5",
    name: "École",
    address: "1 Rue de l'École",
    students: 0,
    time: "08:00",
    completed: false,
  },
]

export default function DriverPage() {
  const [stops, setStops] = useState(mockStops)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCompleteStop = (stopId: string) => {
    setStops(stops.map((stop) => (stop.id === stopId ? { ...stop, completed: true } : stop)))
  }

  const completedStops = stops.filter((s) => s.completed).length
  const totalStops = stops.length
  const totalStudents = stops.reduce((sum, s) => sum + s.students, 0)
  const currentStop = stops.find((s) => !s.completed)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Interface Chauffeur</h1>
          <p className="text-muted-foreground mt-1">Route Nord - Bus A</p>
          <div className="text-2xl font-mono mt-2">{currentTime.toLocaleTimeString("fr-FR")}</div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Progression du Trajet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">Arrêts</span>
              </div>
              <span className="text-2xl font-bold">
                {completedStops}/{totalStops}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${(completedStops / totalStops) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{totalStudents} élèves à transporter</span>
              <span>{Math.round((completedStops / totalStops) * 100)}% complété</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Stop */}
        {currentStop && (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Arrêt Actuel</CardTitle>
                <Badge>En cours</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{currentStop.name}</h3>
                <p className="text-sm text-muted-foreground">{currentStop.address}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Élèves à récupérer</span>
                </div>
                <span className="text-xl font-bold">{currentStop.students}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Heure prévue</span>
                </div>
                <span className="text-xl font-bold">{currentStop.time}</span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="lg">
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigation
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  variant="default"
                  onClick={() => handleCompleteStop(currentStop.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valider
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Stops List */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les Arrêts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    stop.completed
                      ? "bg-muted border-muted"
                      : stop.id === currentStop?.id
                        ? "bg-primary/5 border-primary"
                        : "border-border"
                  }`}
                >
                  <div className="mt-1">
                    {stop.completed ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{stop.name}</h4>
                        <p className="text-sm text-muted-foreground">{stop.address}</p>
                      </div>
                      <span className="text-sm font-medium">{stop.time}</span>
                    </div>
                    {stop.students > 0 && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{stop.students} élèves</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

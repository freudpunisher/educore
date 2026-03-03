"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, UtensilsCrossed, MapPin, Clock } from "lucide-react"

export default function LogisticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logistics</h1>
        <p className="text-muted-foreground mt-1">Manage school transport and catering</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/logistics/transport">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Transport</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Bus and route management</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Routes</span>
                </div>
                <span className="text-lg font-bold">8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Vehicles</span>
                </div>
                <span className="text-lg font-bold">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">In Service</span>
                </div>
                <span className="text-lg font-bold">10</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/logistics/meals">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100">
                  <UtensilsCrossed className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Catering</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Menus and canteen management</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Meals Today</span>
                </div>
                <span className="text-lg font-bold">456</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Services</span>
                </div>
                <span className="text-lg font-bold">3</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Canteens</span>
                </div>
                <span className="text-lg font-bold">2</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

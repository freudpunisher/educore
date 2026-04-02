"use client";

import { useState, useMemo } from "react";
import { TransportLayout } from "@/components/transport/transport-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, Users, Clock, Truck } from "lucide-react";
import { mockItineraries } from "@/lib/mock/transport";

interface Itinerary {
  id: number;
  routeName: string;
  stops: string[];
  assignedVehicle: string;
  assignedDriver: string;
  departureTime: string;
  studentCount: number;
}

export default function ItineraryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return mockItineraries.filter((route) =>
      route.routeName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <TransportLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Itineraries
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              View and manage transport routes and schedules
            </p>
          </div>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Route
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Active Routes</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {filteredData.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Total Students</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {filteredData.reduce((sum, r) => sum + r.studentCount, 0)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Avg Stop Count</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {(
                filteredData.reduce((sum, r) => sum + r.stops.length, 0) / filteredData.length
              ).toFixed(1)}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <Input
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredData.map((itinerary) => (
            <div
              key={itinerary.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:shadow-lg dark:hover:shadow-slate-800/50 transition-shadow"
            >
              {/* Route Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {itinerary.routeName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    {itinerary.departureTime}
                  </div>
                </div>
                <div className="bg-blue-100 dark:bg-blue-950 px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {itinerary.studentCount} students
                  </span>
                </div>
              </div>

              {/* Stops */}
              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <MapPin className="w-4 h-4" />
                  Stops ({itinerary.stops.length})
                </div>
                <div className="space-y-2">
                  {itinerary.stops.map((stop, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </div>
                      <span>{stop}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle & Driver */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground dark:text-slate-400 uppercase">
                    <Truck className="w-4 h-4" />
                    Vehicle
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {itinerary.assignedVehicle}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground dark:text-slate-400 uppercase">
                    <Users className="w-4 h-4" />
                    Driver
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {itinerary.assignedDriver}
                  </p>
                </div>
              </div>

              {/* Action */}
              <Button variant="outline" className="w-full mt-6">
                View Details
              </Button>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center">
            <p className="text-muted-foreground dark:text-slate-400">No routes found</p>
          </div>
        )}
      </div>
    </TransportLayout>
  );
}

"use client";

import { useState } from "react";
import { TransportLayout } from "@/components/transport/transport-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { mockVerificationChecks } from "@/lib/mock/transport";

interface ChecklistItem {
  name: string;
  status: "pass" | "fail";
}

interface VerificationCheck {
  id: number;
  vehicleId: number;
  plateNumber: string;
  dateChecked: string;
  inspectionItems: ChecklistItem[];
  status: "pass" | "fail";
  inspectedBy: string;
  notes: string;
}

export default function VerificationCheckPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const verificationData = mockVerificationChecks.map((check) => ({
    ...check,
    passed: check.inspectionItems.every((item) => item.status === "pass"),
  }));

  const stats = {
    total: verificationData.length,
    passed: verificationData.filter((v) => v.status === "pass").length,
    failed: verificationData.filter((v) => v.status === "fail").length,
  };

  return (
    <TransportLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Verification Checks
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Vehicle inspection records and safety checklists
            </p>
          </div>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Inspection
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Total Inspections</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.total}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Passed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {stats.passed}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className="text-sm text-muted-foreground dark:text-slate-400">Failed</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {stats.failed}
            </p>
          </div>
        </div>

        {/* Inspections List */}
        <div className="space-y-4">
          {verificationData.map((check) => (
            <div
              key={check.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
            >
              {/* Header */}
            <div
              onClick={() =>
                setExpandedId(expandedId === check.id ? null : check.id)
              }
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div>
                  {check.status === "pass" ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {check.plateNumber}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    {check.dateChecked}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    check.status === "pass"
                      ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                  }`}
                >
                  {check.status === "pass" ? "Passed" : "Failed"}
                </span>
                <svg
                  className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${
                    expandedId === check.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>

              {/* Expanded Content */}
              {expandedId === check.id && (
                <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 space-y-4">
                  {/* Checklist */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Safety Checklist
                    </h4>
                    <div className="space-y-2">
                      {check.inspectionItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                        >
                          <Checkbox
                            checked={item.status === "pass"}
                            disabled
                            className="cursor-default"
                          />
                          <span
                            className={`text-sm ${
                              item.status === "pass"
                                ? "text-slate-600 dark:text-slate-300"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inspector Notes */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Inspector Notes
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {check.notes}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Print Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </TransportLayout>
  );
}

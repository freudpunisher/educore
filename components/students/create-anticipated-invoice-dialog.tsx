"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2, Receipt } from "lucide-react"
import { useFees, useCreateAnticipatedInvoice } from "@/hooks/use-finance"
import toast from "react-hot-toast"

interface CreateAnticipatedInvoiceDialogProps {
  studentId: number
  studentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GENERATE_OPTIONS = [
  { value: "single", label: "Single invoice (current period)" },
  { value: "term", label: "All academic terms" },
  { value: "monthly", label: "All months" },
  { value: "quarterly", label: "All trimesters" },
  { value: "semiannually", label: "All semesters" },
  { value: "annually", label: "Annual" },
]

export function CreateAnticipatedInvoiceDialog({
  studentId,
  studentName,
  open,
  onOpenChange,
}: CreateAnticipatedInvoiceDialogProps) {
  const { data: fees = [], isLoading: feesLoading } = useFees()
  const createInvoice = useCreateAnticipatedInvoice()

  const [selectedFeeId, setSelectedFeeId] = useState<string>("")
  const [generateMode, setGenerateMode] = useState<string>("single")

  const reset = () => {
    setSelectedFeeId("")
    setGenerateMode("single")
  }

  const handleCreate = () => {
    if (!selectedFeeId) {
      toast.error("Please select a fee")
      return
    }
    createInvoice.mutate(
      {
        student_id: studentId,
        fees_id: parseInt(selectedFeeId),
        generate_all: generateMode === "single" ? undefined : generateMode,
      },
      {
        onSuccess: (data: any) => {
          toast.success(data?.message || "Invoice(s) created successfully")
          reset()
          onOpenChange(false)
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            err?.response?.data?.detail ||
            err?.message ||
            "Failed to create invoice(s)"
          toast.error(message)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Anticipated Invoice
          </DialogTitle>
          <DialogDescription>
            Create an anticipated invoice for <strong>{studentName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Fee Type</Label>
            {feesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading fees...
              </div>
            ) : (
              <Select value={selectedFeeId} onValueChange={setSelectedFeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a fee" />
                </SelectTrigger>
                <SelectContent>
                  {fees.map((fee: any) => (
                    <SelectItem key={fee.id} value={fee.id.toString()}>
                      {fee.label} ({Number(fee.amount).toLocaleString()} FBU)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Generation Mode</Label>
            <Select value={generateMode} onValueChange={setGenerateMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENERATE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createInvoice.isPending}>
            {createInvoice.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {generateMode && generateMode !== "single" ? "Generate All" : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

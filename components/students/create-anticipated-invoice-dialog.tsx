"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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

export function CreateAnticipatedInvoiceDialog({
  studentId,
  studentName,
  open,
  onOpenChange,
}: CreateAnticipatedInvoiceDialogProps) {
  const { data: fees = [], isLoading: feesLoading } = useFees()
  const createInvoice = useCreateAnticipatedInvoice()

  const [selectedFeeId, setSelectedFeeId] = useState<string>("")
  const [generateAllTerms, setGenerateAllTerms] = useState(false)

  const reset = () => {
    setSelectedFeeId("")
    setGenerateAllTerms(false)
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
        generate_all_terms: generateAllTerms,
      },
      {
        onSuccess: (data: any) => {
          toast.success(data?.message || "Invoice(s) created successfully")
          reset()
          onOpenChange(false)
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="generate-all-terms"
              checked={generateAllTerms}
              onCheckedChange={(checked) => setGenerateAllTerms(checked === true)}
            />
            <Label htmlFor="generate-all-terms" className="cursor-pointer text-sm">
              Generate for all academic terms
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createInvoice.isPending}>
            {createInvoice.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {generateAllTerms ? "Generate All" : "Create Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

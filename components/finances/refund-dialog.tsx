"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRefund, useCancelRefund } from "@/hooks/use-finance";
import { useFinancialInstitutions } from "@/hooks/use-financial-institutions";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RefundDialogProps {
  surplusId: number;
  surplusRemaining: string;
  studentName: string;
  invoiceRef: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REFUND_MODES = [
  { value: "1", label: "Cash" },
  { value: "2", label: "Check" },
  { value: "3", label: "Deposit" },
  { value: "4", label: "Bank Transfer" },
  { value: "5", label: "Mobile Money" },
  { value: "6", label: "Other" },
];

export function RefundDialog({
  surplusId,
  surplusRemaining,
  studentName,
  invoiceRef,
  open,
  onOpenChange,
}: RefundDialogProps) {
  const createRefund = useCreateRefund();
  const { data: institutions = [] } = useFinancialInstitutions();
  const [amount, setAmount] = useState("");
  const [refundMode, setRefundMode] = useState("1");
  const [checkNumber, setCheckNumber] = useState("");
  const [institution, setInstitution] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [observations, setObservations] = useState("");

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid refund amount.");
      return;
    }
    if (Number(amount) > Number(surplusRemaining)) {
      toast.error(`Refund amount exceeds remaining surplus (${Number(surplusRemaining).toLocaleString()} Fbu).`);
      return;
    }
    if (refundMode === "2" && !checkNumber) {
      toast.error("Check number is required for Check refund mode.");
      return;
    }

    const formData = new FormData();
    formData.append("surplus", String(surplusId));
    formData.append("amount", amount);
    formData.append("refund_mode", refundMode);
    if (checkNumber) formData.append("check_number", checkNumber);
    if (institution) formData.append("institution", institution);
    if (document) formData.append("document", document);
    if (observations) formData.append("observations", observations);

    try {
      await createRefund.mutateAsync(formData);
      toast.success("Refund processed successfully.");
      onOpenChange(false);
      setAmount("");
      setRefundMode("1");
      setCheckNumber("");
      setInstitution("");
      setDocument(null);
      setObservations("");
    } catch (err: any) {
      const errData = err.response?.data;
      const fieldErrors = errData?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        const msg = fieldErrors.detail || Object.values(fieldErrors).flat().join(" | ");
        toast.error(msg);
      } else {
        toast.error(errData?.message || "Failed to process refund.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            {studentName} — Invoice {invoiceRef} — Available: {Number(surplusRemaining).toLocaleString()} Fbu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Refund Amount *</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={Number(surplusRemaining)}
            />
          </div>

          <div className="space-y-2">
            <Label>Refund Mode *</Label>
            <Select value={refundMode} onValueChange={setRefundMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {refundMode === "2" && (
            <div className="space-y-2">
              <Label>Check Number *</Label>
              <Input
                placeholder="Enter check number"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Institution (optional)</Label>
            <Select value={institution} onValueChange={setInstitution}>
              <SelectTrigger>
                <SelectValue placeholder="Select institution" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((inst: any) => (
                  <SelectItem key={inst.id} value={String(inst.id)}>{inst.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supporting Document (optional)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".pdf,.jpg,.jpeg,.png";
                  input.capture = "environment";
                  input.onchange = (e: any) => {
                    if (e.target.files?.[0]) setDocument(e.target.files[0]);
                  };
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {document ? "Change File" : "Upload File"}
              </Button>
              {document && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{document.name}</span>
                  <button onClick={() => setDocument(null)} className="text-destructive hover:text-destructive/80">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observations (optional)</Label>
            <Textarea
              placeholder="Add notes about this refund"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createRefund.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createRefund.isPending}>
            {createRefund.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

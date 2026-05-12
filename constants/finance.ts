export const FEE_CATEGORIES = [
    { label: "Registration Fees", value: "1" },
    { label: "School Fees", value: "2" },
    { label: "Class Fees", value: "3" },
    { label: "Transport Fees", value: "4" },
    { label: "Food Fees", value: "5" },
    // { label: "Catering Fees", value: "6" },
    { label: "Other Fees", value: "7" },
    { label: "Daycare", value: "8" },
    { label: "Boarding", value: "9" },
] as const;

export const INVOICE_STATUS_OPTIONS = [
    { label: "Unpaid", value: "0" },
    { label: "Paid", value: "1" },
] as const;

import { AttendanceRecord, Grade, Invoice } from "./mock-data";

/**
 * Generates deterministic mock data for a student to ensure consistency 
 * during demonstrations.
 */

export const MOCK_ACADEMIC_YEARS = [
    { id: 1, label: "2024-2025" },
    { id: 2, label: "2023-2024" },
    { id: 3, label: "2022-2023" },
];

export function getMockBills(studentId: number, yearId: number): Invoice[] {
    // Deterministic seed based on studentId and yearId
    const seed = studentId + yearId * 10;

    return [
        {
            id: `INV-${seed}-01`,
            studentId: String(studentId),
            studentName: "Current Student",
            amount: 450,
            dueDate: `202${4 - yearId + 1}-09-30`,
            paidDate: seed % 2 === 0 ? `202${4 - yearId + 1}-09-25` : undefined,
            status: seed % 2 === 0 ? "paid" : "pending",
            type: "tuition",
            description: "First Trimester Tuition",
        },
        {
            id: `INV-${seed}-02`,
            studentId: String(studentId),
            studentName: "Current Student",
            amount: 450,
            dueDate: `202${4 - yearId + 1}-12-30`,
            paidDate: undefined,
            status: "pending",
            type: "tuition",
            description: "Second Trimester Tuition",
        },
        {
            id: `INV-${seed}-03`,
            studentId: String(studentId),
            studentName: "Current Student",
            amount: 150,
            dueDate: `202${4 - yearId + 1}-10-15`,
            paidDate: `202${4 - yearId + 1}-10-10`,
            status: "paid",
            type: "transport",
            description: "School Transport - Oct",
        }
    ];
}

export function getMockGrades(studentId: number, yearId: number): Grade[] {
    const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "French", "History"];
    const seed = studentId + yearId;

    return subjects.map((subject, index) => {
        const score = 10 + ((seed + index) % 11); // Deterministic score between 10 and 20
        return {
            id: `GR-${seed}-${index}`,
            studentId: String(studentId),
            studentName: "Current Student",
            course: subject,
            grade: score,
            maxGrade: 20,
            date: `202${4 - yearId + 1}-01-15`,
            type: "exam"
        };
    });
}

export function getMockAttendance(studentId: number, yearId: number): AttendanceRecord[] {
    const seed = studentId + yearId;
    const records: AttendanceRecord[] = [];

    for (let i = 1; i <= 5; i++) {
        const isAbsent = (seed + i) % 7 === 0;
        const isLate = (seed + i) % 5 === 0;

        records.push({
            id: `ATT-${seed}-${i}`,
            studentId: String(studentId),
            studentName: "Current Student",
            class: "Current Class",
            date: `202${4 - yearId + 1}-05-0${i}`,
            status: isAbsent ? "absent" : isLate ? "late" : "present",
            notes: isAbsent ? "Sick leave" : isLate ? "Heavy traffic" : undefined
        });
    }

    return records;
}

const { z } = require("zod");

const DisciplineRecordStatusEnum = {
    Recorded: "recorded",
    Appealed: "appealed",
    Cancelled: "cancelled",
};

const disciplineRecordSchema = z.object({
    id: z.number(),
    student_name: z.string().optional().nullable(),
    student_enrollment: z.string(),
    date_incident: z.string().transform((s) => new Date(s)),
    description: z.string().optional().nullable(),
    points: z.string(),
    reason_name: z.string(),
    reason: z.number(),
    recorded_by_name: z.string().optional().nullable(),
    recorded_by: z.number().optional().nullable(),
    student: z.number(),
    status: z.nativeEnum(DisciplineRecordStatusEnum),
    appeal_reason: z.string().nullable().optional(),
});

function createPaginatedSchema(itemSchema) {
    return z.object({
        count: z.number(),
        next: z.string().nullable(),
        previous: z.string().nullable(),
        results: z.array(itemSchema),
    });
}

fetch('http://127.0.0.1:8000/api/academics/records/')
  .then(res => res.json())
  .then(data => {
    console.log("Fetched data:", JSON.stringify(data).slice(0, 200));
    const paginatedData = data.data || data;
    try {
        const parsed = createPaginatedSchema(disciplineRecordSchema).parse(paginatedData);
        console.log("Parsed successfully!", parsed.results.length);
    } catch (e) {
        console.error("ZOD ERROR:", e);
    }
  })
  .catch(err => console.error("FETCH ERROR:", err));


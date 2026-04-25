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

const data = {
  count: 1,
  next: null,
  previous: null,
  results: [{
    id: 2,
    student: 2,
    student_enrollment: '2026-0001',
    reason: 3,
    reason_name: 'Disruptive behavior',
    points: '0.00',
    date_incident: '2026-04-11',
    description: 'qsnfkbsdkgbsdfkgbjksdf',
    status: 'recorded',
    recorded_by: null,
    appeal_reason: ''
  }]
};

try {
  createPaginatedSchema(disciplineRecordSchema).parse(data);
  console.log("Success!");
} catch (e) {
  console.error(e);
}

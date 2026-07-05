import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { paginatedCourseSchema, paginatedGradeSchema, paginatedAssessmentSchema, paginatedReportCardSchema, GradeCreate, AssessmentCreate } from "@/types/pedagogy";
import { paginatedEnrollmentListSchema } from "@/types/enrollment";

export function useCourses(classId?: number, academicYearId?: number, page: number = 1, search?: string) {
  return useQuery({
    queryKey: ["courses", classId, academicYearId, page, search],
    queryFn: async () => {
      let url = "/config/courses/";
      const params = new URLSearchParams();
      if (classId) params.append("classroom", classId.toString());
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("page_size", "1000");
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const { data } = await axiosInstance.get(url);
      return data;
    },
    enabled: !!classId,
  });
}

export function useGrades(enrollmentId?: number, academicYearId?: number, termId?: number, page: number = 1, search?: string, classId?: number) {
  return useQuery({
    queryKey: ["grades", enrollmentId, academicYearId, termId, page, search, classId],
    queryFn: async () => {
      let url = "/academics/grades/";
      const params = new URLSearchParams();
      if (enrollmentId) params.append("enrollment", enrollmentId.toString());
      if (academicYearId) params.append("enrollment__academic_year", academicYearId.toString());
      if (termId) params.append("assessment__term", termId.toString());
      if (classId) params.append("assessment__course__classroom", classId.toString());
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("page_size", "5000");
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const { data } = await axiosInstance.get(url);
      const parsed = paginatedGradeSchema.parse(data);
      return parsed;
    },
    enabled: !!classId,
  });
}

export function useAssessments(courseId?: number, academicYearId?: number, page: number = 1, search?: string) {
  return useQuery({
    queryKey: ["assessments", courseId, academicYearId, page, search],
    queryFn: async () => {
      let url = "/academics/assessments/";
      const params = new URLSearchParams();
      if (courseId) params.append("course", courseId.toString());
      if (academicYearId) params.append("term__academic_year", academicYearId.toString());
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("page_size", "100");
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const { data } = await axiosInstance.get(url);
      const parsed = paginatedAssessmentSchema.parse(data);
      return parsed;
    },
    enabled: courseId !== undefined ? !!courseId : true,
  });
}

export function useGradingCategories() {
  return useQuery({
    queryKey: ["grading-categories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/grading-categories/");
      return data?.results || data || [];
    },
  });
}

export function useAssessmentTypes() {
  return useQuery({
    queryKey: ["assessment-types"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/academics/assessment-types/");
      return data?.results || data || [];
    },
  });
}

export function useTerms(academicYearId?: number) {
  return useQuery({
    queryKey: ["terms", academicYearId],
    queryFn: async () => {
      let url = "/academics/terms/";
      const params = new URLSearchParams();
      if (academicYearId) params.append("academic_year", academicYearId.toString());
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const { data } = await axiosInstance.get(url);
      return data?.results || data || [];
    },
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssessmentCreate) => {
      const response = await axiosInstance.post("/academics/assessments/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AssessmentCreate> }) => {
      const response = await axiosInstance.patch(`/academics/assessments/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/academics/assessments/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useCreateAssessmentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post("/academics/assessment-types/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-types"] });
    },
  });
}

export function useEnrollments(classId?: number, academicYearId?: number) {
  return useQuery({
    queryKey: ["enrollments", classId, academicYearId],
    queryFn: async () => {
      let url = "/academics/enrollments/";
      const params = new URLSearchParams();
      if (classId) params.append("class_room", classId.toString());
      if (academicYearId) params.append("academic_year", academicYearId.toString());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const { data } = await axiosInstance.get(url);
      const parsed = paginatedEnrollmentListSchema.parse(data);
      return parsed;
    },
    enabled: !!classId,
  });
}

export function useReportCards(academicYearId?: number, classId?: number, termId?: number, page: number = 1, search?: string) {
  return useQuery({
    queryKey: ["report-cards", academicYearId, classId, termId, page, search],
    queryFn: async () => {
      let url = "/academics/report-cards/";
      const params = new URLSearchParams();
      if (academicYearId) params.append("enrollment__academic_year", academicYearId.toString());
      if (classId) params.append("enrollment__class_room", classId.toString());
      if (termId) params.append("term", termId.toString());
      if (search) params.append("search", search);
      params.append("page", page.toString());
      // Increase limit to avoid missing report cards in the dashboard list
      params.append("page_size", "100");
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const { data } = await axiosInstance.get(url);
      const parsed = paginatedReportCardSchema.parse(data);
      return parsed;
    },
    enabled: !!classId,
  });
}

export function useGenerateReportCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { term: number; enrollment?: number; classroom?: number }) => {
      const response = await axiosInstance.post("/academics/report-cards/generate/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-cards"] });
    },
  });
}

export function useGeneratePreschoolAnnualReportCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { academic_year: number; term?: number; enrollment?: number; classroom?: number }) => {
      const response = await axiosInstance.post("/academics/report-cards/generate-preschool-annual/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-cards"] });
    },
  });
}

export function useGenerateElementaryAnnualReportCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { academic_year: number; classroom?: number; enrollment?: number }) => {
      const response = await axiosInstance.post("/academics/report-cards/generate-elementary-annual/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-cards"] });
    },
  });
}

export function useGenerateMiddleSchoolAnnualReportCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { classroom?: number; enrollment?: number }) => {
      const response = await axiosInstance.post("/academics/report-cards/generate_middle_school_annual/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-cards"] });
    },
  });
}

export function useGenerateHighSchoolAnnualReportCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { classroom?: number; enrollment?: number }) => {
      const response = await axiosInstance.post("/academics/report-cards/generate_high_school_annual/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-cards"] });
    },
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GradeCreate) => {
      const response = await axiosInstance.post("/academics/grades/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });
}

export function useDownloadReportCardPDF() {
  return useMutation({
    mutationFn: async (reportCardId: number) => {
      const response = await axiosInstance.get(`/academics/report-cards/${reportCardId}/download_pdf/`, {
        responseType: 'blob',
      });
      return response.data;
    },
  });
}

export function useAllTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get("users/accounts/?role=teacher");
      const data = raw?.results || raw || [];
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherCourses(teacherId: number | null) {
  return useQuery({
    queryKey: ["teacher-courses", teacherId],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get(`users/accounts/${teacherId}/teacher-courses/`);
      const payload = raw?.data || raw;
      return payload;
    },
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllCourses(page: number = 1, search?: string) {
  return useQuery({
    queryKey: ["all-courses", page, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());
      const { data } = await axiosInstance.get(`/config/courses/?${params.toString()}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCourseAssessmentPolicies(courseIds?: number[]) {
  return useQuery({
    queryKey: ["course-assessment-policies", courseIds],
    queryFn: async () => {
      if (!courseIds || courseIds.length === 0) return [];
      const params = courseIds.map(id => `course=${id}`).join("&");
      const { data: raw } = await axiosInstance.get(`/academics/course-assessment-policies/?${params}`);
      return raw?.results || raw || [];
    },
    enabled: !!courseIds && courseIds.length > 0,
  });
}

export function useCourseGradingPolicy(courseId?: number) {
  return useQuery({
    queryKey: ["course-grading-policy", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const { data: raw } = await axiosInstance.get(`/academics/course-grading-policies/?course=${courseId}`);
      const results = raw?.results || raw || [];
      return results[0] || null;
    },
    enabled: !!courseId,
  });
}

export function useGradingCategoryReport(enrollment: number, course: number, term: number) {
  return useQuery({
    queryKey: ["grading-report", enrollment, course, term],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get(
        `/academics/grade-calculations/course_report/?enrollment=${enrollment}&course=${course}&term=${term}`
      );
      return raw?.data || raw;
    },
    enabled: !!enrollment && !!course && !!term,
  });
}

export function useTermReportCard(enrollmentId?: number, termId?: number) {
  return useQuery({
    queryKey: ["term-report-card", enrollmentId, termId],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get(
        `/academics/report-card-service/term/${enrollmentId}/${termId}/`
      );
      return raw?.data || raw;
    },
    enabled: !!enrollmentId && !!termId,
  });
}

export function useYearReportCard(enrollmentId?: number) {
  return useQuery({
    queryKey: ["year-report-card", enrollmentId],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get(
        `/academics/report-card-service/year/${enrollmentId}/`
      );
      return raw?.data || raw;
    },
    enabled: !!enrollmentId,
  });
}

export function useClassRanking(classId?: number, termId?: number) {
  return useQuery({
    queryKey: ["class-ranking", classId, termId],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get(
        `/academics/rankings/class/${classId}/${termId}/`
      );
      return raw?.data || raw;
    },
    enabled: !!classId && !!termId,
  });
}

export function useStudentTermGrades(enrollment: number, term: number) {
  return useQuery({
    queryKey: ["student-term-grades", enrollment, term],
    queryFn: async () => {
      const { data: raw } = await axiosInstance.get(
        `/academics/grade-calculations/term_grades/?enrollment=${enrollment}&term=${term}`
      );
      return raw?.data || raw;
    },
    enabled: !!enrollment && !!term,
  });
}

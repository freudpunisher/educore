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
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      
      const { data } = await axiosInstance.get(url);
      const parsed = paginatedCourseSchema.parse(data);
      return parsed;
    },
  });
}

export function useGrades(enrollmentId?: number, academicYearId?: number, page: number = 1, search?: string) {
  return useQuery({
    queryKey: ["grades", enrollmentId, academicYearId, page, search],
    queryFn: async () => {
      let url = "/academics/grades/";
      const params = new URLSearchParams();
      if (enrollmentId) params.append("enrollment", enrollmentId.toString());
      if (academicYearId) params.append("enrollment__academic_year", academicYearId.toString());
      if (search) params.append("search", search);
      params.append("page", page.toString());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const { data } = await axiosInstance.get(url);
      const parsed = paginatedGradeSchema.parse(data);
      return parsed;
    },
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
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const { data } = await axiosInstance.get(url);
      const parsed = paginatedAssessmentSchema.parse(data);
      return parsed;
    },
    enabled: courseId !== undefined ? !!courseId : true,
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
  });
}

export function useReportCards(academicYearId?: number, page: number = 1, search?: string) {
  return useQuery({
    queryKey: ["report-cards", academicYearId, page, search],
    queryFn: async () => {
      let url = "/academics/report-cards/";
      const params = new URLSearchParams();
      if (academicYearId) params.append("enrollment__academic_year", academicYearId.toString());
      if (search) params.append("search", search);
      params.append("page", page.toString());
      
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
      const { data } = await axiosInstance.get(url);
      const parsed = paginatedReportCardSchema.parse(data);
      return parsed;
    },
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

export function useCreateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GradeCreate) => {
      const response = await axiosInstance.post("/academics/grades/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
  });
}

export function useDownloadReportCardPDF() {
  return useMutation({
    mutationFn: async (reportCardId: number) => {
      const response = await axiosInstance.get(`/academics/report-cards/${reportCardId}/download_pdf/`, {
        responseType: 'blob', // Important for file downloads
      });
      return response.data;
    },
  });
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL.replace(/\/api\/?$/, "")}/login/`, // Login is usually outside /api/ if it's DRF default
    ACADEMIC_YEARS: `${API_BASE_URL}/academics/years/`,
}

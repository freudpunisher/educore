// types/timetable.ts

export type ClassRoom = {
    id: number;
    code: string;
    name: string;
};

export type TimetableSlot = {
    id: number;
    course: number;
    course_name: string;
    teacher_name: string;
    classroom_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room?: string | null;
};

export type Course = {
    id: number;
    name: string;
    teacher_name: string;
};

export type Teacher = {
    id: number;
    user: {
        id: number;
        first_name?: string;
        last_name?: string;
        username: string;
    };
};

export type TimetableListRequest = {
    classroom?: number;
    course?: number;
    day_of_week?: number;
    page?: number;
};

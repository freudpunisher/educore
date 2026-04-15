"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  BedDouble,
  LogOut,
  CalendarCheck,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type BoardingDashboard = {
  rooms: number;
  beds_total: number;
  beds_occupied: number;
  beds_free: number;
  occupancy_rate: number;
  students_housed: number;
  students_present: number;
  exits_today: number;
  pending_exits: number;
};

type Room = {
  id: number;
  name: string;
  capacity: number;
  room_type: string;
  beds_total: number;
  beds_occupied: number;
};

type Housing = {
  id: number;
  student: number;
  student_name: string;
  room: number;
  room_name: string;
  room_type: string;
  bed: number;
  bed_number: string;
  fees: number;
  period_category: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
};

type Attendance = {
  id: number;
  student: number;
  student_name: string;
  date: string;
  status: "present" | "absent" | "authorized";
};

type ExitPermission = {
  id: number;
  student: number;
  student_name: string;
  reason: string;
  exit_date: string;
  return_date: string;
  approved: boolean;
  approved_by: number | null;
  approved_by_name: string | null;
};

type Student = {
  id: number;
  full_name: string;
  enrollment_number: string;
};

type Period = {
  id: number;
  display_name: string;
};

type Fee = {
  id: number;
  label: string;
  amount: string;
};

type Bed = {
  id: number;
  room: number;
  number: string;
  status: "free" | "occupied";
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BoardingPage() {
  const [activeTab, setActiveTab] = useState("assignments");
  const [isLoading, setIsLoading] = useState(true);

  const [dashboard, setDashboard] = useState<BoardingDashboard | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [housings, setHousings] = useState<Housing[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [exits, setExits] = useState<ExitPermission[]>([]);

  // Selection data for forms
  const [students, setStudents] = useState<Student[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);

  // Modal states
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isHousingModalOpen, setIsHousingModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);

  // Confirm delete dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Edit states
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingHousing, setEditingHousing] = useState<Housing | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [editingExit, setEditingExit] = useState<ExitPermission | null>(null);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);

  // Student search for forms
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  const [housingSearch, setHousingSearch] = useState("");
  const [housingStatusFilter, setHousingStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<"all" | "present" | "absent" | "authorized">("all");
  const [exitApprovedFilter, setExitApprovedFilter] = useState<"all" | "approved" | "pending">("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<"all" | "boy" | "girl">("all");
  const [bedStatusFilter, setBedStatusFilter] = useState<"all" | "free" | "occupied">("all");
  const [bedRoomFilter, setBedRoomFilter] = useState<string>("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, roomsRes, housingRes, attendRes, exitRes, studentsRes, periodsRes, feesRes, bedsRes] = await Promise.all([
        api.get<BoardingDashboard>("boarding/internat/dashboard/"),
        api.get<any>("boarding/internat/rooms/"),
        api.get<any>("boarding/internat/housing/"),
        api.get<any>("boarding/internat/attendances/"),
        api.get<any>("boarding/internat/exit-permissions/"),
        api.get<any>("users/students/"),
        api.get<any>("config/periods/"),
        api.get<any>("finance/fees/"),
        api.get<any>("boarding/internat/beds/"),
      ]);

      setDashboard(dashRes);
      setRooms(Array.isArray(roomsRes) ? roomsRes : roomsRes.results || []);
      setHousings(Array.isArray(housingRes) ? housingRes : housingRes.results || []);
      setAttendances(Array.isArray(attendRes) ? attendRes : attendRes.results || []);
      setExits(Array.isArray(exitRes) ? exitRes : exitRes.results || []);

      setStudents(Array.isArray(studentsRes) ? studentsRes : studentsRes.results || []);
      setPeriods(Array.isArray(periodsRes) ? periodsRes : periodsRes.results || []);
      setFees(Array.isArray(feesRes) ? feesRes : feesRes.results || []);
      setBeds(Array.isArray(bedsRes) ? bedsRes : bedsRes.results || []);
    } catch (error) {
      console.error("Error fetching boarding data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── CRUD Handlers ────────────────────────────────────────────────────────

  const confirmDelete = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm });
  };

  const handleDeleteRoom = (id: number) => {
    confirmDelete(
      "Delete Room",
      "Are you sure you want to delete this room? This action cannot be undone and will also remove all associated beds.",
      async () => {
        try {
          await api.delete(`boarding/internat/rooms/${id}/`);
          toast.success("Room deleted successfully");
          fetchData();
        } catch {
          toast.error("Failed to delete room");
        }
      }
    );
  };

  const handleDeleteHousing = (id: number) => {
    confirmDelete(
      "Remove Assignment",
      "Are you sure you want to remove this student's room assignment? The bed will be marked as free again.",
      async () => {
        try {
          await api.delete(`boarding/internat/housing/${id}/`);
          toast.success("Assignment removed successfully");
          fetchData();
        } catch {
          toast.error("Failed to remove assignment");
        }
      }
    );
  };

  const handleDeleteAttendance = (id: number) => {
    confirmDelete(
      "Delete Attendance Record",
      "Are you sure you want to delete this attendance record? This action cannot be undone.",
      async () => {
        try {
          await api.delete(`boarding/internat/attendances/${id}/`);
          toast.success("Attendance deleted successfully");
          fetchData();
        } catch {
          toast.error("Failed to delete attendance");
        }
      }
    );
  };

  const handleDeleteExit = (id: number) => {
    confirmDelete(
      "Delete Exit Request",
      "Are you sure you want to delete this exit request? This action cannot be undone.",
      async () => {
        try {
          await api.delete(`boarding/internat/exit-permissions/${id}/`);
          toast.success("Exit request deleted successfully");
          fetchData();
        } catch {
          toast.error("Failed to delete exit request");
        }
      }
    );
  };

  const handleRoomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      capacity: parseInt(formData.get("capacity") as string),
      room_type: formData.get("room_type"),
    };

    try {
      if (editingRoom) {
        await api.put(`boarding/internat/rooms/${editingRoom.id}/`, data);
        toast.success("Room updated successfully");
      } else {
        await api.post("boarding/internat/rooms/", data);
        toast.success("Room created successfully");
      }
      setIsRoomModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleHousingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      student: parseInt(formData.get("student") as string),
      room: parseInt(formData.get("room") as string),
      bed: parseInt(formData.get("bed") as string),
      fees: parseInt(formData.get("fees") as string),
      period_category: parseInt(formData.get("period_category") as string),
      is_active: formData.get("is_active") === "true",
      end_date: formData.get("end_date") || null,
    };

    try {
      if (editingHousing) {
        await api.put(`boarding/internat/housing/${editingHousing.id}/`, data);
        toast.success("Assignment updated successfully");
      } else {
        await api.post("boarding/internat/housing/", data);
        toast.success("Assignment created successfully");
      }
      setIsHousingModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      student: parseInt(formData.get("student") as string),
      date: formData.get("date"),
      status: formData.get("status"),
    };

    try {
      if (editingAttendance) {
        await api.put(`boarding/internat/attendances/${editingAttendance.id}/`, data);
        toast.success("Attendance updated successfully");
      } else {
        await api.post("boarding/internat/attendances/", data);
        toast.success("Attendance recorded successfully");
      }
      setIsAttendanceModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleExitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      student: parseInt(formData.get("student") as string),
      reason: formData.get("reason"),
      exit_date: formData.get("exit_date"),
      return_date: formData.get("return_date"),
      approved: formData.get("approved") === "true",
    };

    try {
      if (editingExit) {
        await api.put(`boarding/internat/exit-permissions/${editingExit.id}/`, data);
        toast.success("Exit request updated successfully");
      } else {
        await api.post("boarding/internat/exit-permissions/", data);
        toast.success("Exit request created successfully");
      }
      setIsExitModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDeleteBed = (id: number) => {
    confirmDelete(
      "Delete Bed",
      "Are you sure you want to delete this bed? This action cannot be undone.",
      async () => {
        try {
          await api.delete(`boarding/internat/beds/${id}/`);
          toast.success("Bed deleted successfully");
          fetchData();
        } catch {
          toast.error("Failed to delete bed");
        }
      }
    );
  };

  const handleBedSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      room: parseInt(formData.get("room") as string),
      number: formData.get("number"),
      status: formData.get("status"),
    };

    try {
      if (editingBed) {
        await api.put(`boarding/internat/beds/${editingBed.id}/`, data);
        toast.success("Bed updated successfully");
      } else {
        await api.post("boarding/internat/beds/", data);
        toast.success("Bed created successfully");
      }
      setIsBedModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Operation failed");
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // Close student dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setStudentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudentOptions = useMemo(() => {
    if (!studentSearch) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        (s.full_name || "").toLowerCase().includes(q) ||
        (s.enrollment_number || "").toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const selectedStudentLabel = useMemo(() => {
    if (!selectedStudentId) return "";
    const s = students.find((s) => String(s.id) === selectedStudentId);
    return s ? `${s.full_name || s.enrollment_number}` : "";
  }, [selectedStudentId, students]);

  // ─── Filters ──────────────────────────────────────────────────────────────

  const filteredHousings = useMemo(() => {
    return housings.filter((h) => {
      if (housingStatusFilter === "active" && !h.is_active) return false;
      if (housingStatusFilter === "inactive" && h.is_active) return false;
      if (housingSearch && !h.student_name.toLowerCase().includes(housingSearch.toLowerCase()))
        return false;
      return true;
    });
  }, [housings, housingSearch, housingStatusFilter]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (roomTypeFilter !== "all" && r.room_type !== roomTypeFilter) return false;
      return true;
    });
  }, [rooms, roomTypeFilter]);

  const filteredAttendances = useMemo(() => {
    return attendances.filter((a) => {
      if (attendanceStatusFilter !== "all" && a.status !== attendanceStatusFilter) return false;
      return true;
    });
  }, [attendances, attendanceStatusFilter]);

  const filteredExits = useMemo(() => {
    return exits.filter((e) => {
      if (exitApprovedFilter === "approved" && !e.approved) return false;
      if (exitApprovedFilter === "pending" && e.approved) return false;
      return true;
    });
  }, [exits, exitApprovedFilter]);

  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      if (bedStatusFilter !== "all" && b.status !== bedStatusFilter) return false;
      if (bedRoomFilter !== "all" && String(b.room) !== bedRoomFilter) return false;
      return true;
    });
  }, [beds, bedStatusFilter, bedRoomFilter]);

  // ─── Columns ──────────────────────────────────────────────────────────────

  const housingColumns = [
    {
      key: "student_name" as const,
      label: "Student",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v || "—"}</span>,
    },
    {
      key: "room_name" as const,
      label: "Room",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v || "—"}</span>,
    },
    {
      key: "room_type" as const,
      label: "Type",
      sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${v === "boy"
          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
          : "bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300"
          }`}>
          {v === "boy" ? "Boys" : v === "girl" ? "Girls" : v}
        </span>
      ),
    },
    {
      key: "bed_number" as const,
      label: "Bed",
      sortable: true,
      render: (v: string) => <span className="font-semibold text-slate-900 dark:text-white">{v || "—"}</span>,
    },
    {
      key: "start_date" as const,
      label: "Entry",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v || "—"}</span>,
    },
    {
      key: "is_active" as const,
      label: "Status",
      sortable: true,
      render: (v: boolean) => <StatusBadge status={v ? "active" : "inactive"} />,
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: Housing) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingHousing(item); setIsHousingModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteHousing(item.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const roomColumns = [
    {
      key: "name" as const,
      label: "Room",
      sortable: true,
      render: (v: string) => <span className="font-semibold text-slate-900 dark:text-white">{v}</span>,
    },
    {
      key: "room_type" as const,
      label: "Type",
      sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${v === "boy"
          ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
          : "bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300"
          }`}>
          {v === "boy" ? "Boys" : "Girls"}
        </span>
      ),
    },
    {
      key: "capacity" as const,
      label: "Capacity",
      sortable: true,
      render: (v: number) => <span className="text-slate-600 dark:text-slate-300">{v}</span>,
    },
    {
      key: "beds_occupied" as const,
      label: "Occupied",
      sortable: true,
      render: (v: number) => <span className="font-semibold text-slate-900 dark:text-white">{v}</span>,
    },
    {
      key: "beds_total" as const,
      label: "Total beds",
      sortable: true,
      render: (v: number) => <span className="text-slate-600 dark:text-slate-300">{v}</span>,
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: Room) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingRoom(item); setIsRoomModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRoom(item.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const attendanceColumns = [
    {
      key: "student_name" as const,
      label: "Student",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v || "—"}</span>,
    },
    {
      key: "date" as const,
      label: "Date",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v}</span>,
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (v: string) => {
        const map: Record<string, "active" | "inactive"> = {
          present: "active",
          absent: "inactive",
          authorized: "inactive",
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${v === "present"
            ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
            : v === "authorized"
              ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
              : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
            }`}>
            {v === "present" ? "Present" : v === "absent" ? "Absent" : "Authorized Exit"}
          </span>
        );
      },
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: Attendance) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingAttendance(item); setIsAttendanceModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAttendance(item.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const exitColumns = [
    {
      key: "student_name" as const,
      label: "Student",
      sortable: true,
      render: (v: string) => <span className="font-medium text-slate-900 dark:text-white">{v || "—"}</span>,
    },
    {
      key: "reason" as const,
      label: "Reason",
      sortable: false,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300 text-sm">{v}</span>,
    },
    {
      key: "exit_date" as const,
      label: "Exit",
      sortable: true,
      render: (v: string) => (
        <span className="text-slate-600 dark:text-slate-300">
          {v ? new Date(v).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "—"}
        </span>
      ),
    },
    {
      key: "return_date" as const,
      label: "Return",
      sortable: true,
      render: (v: string) => (
        <span className="text-slate-600 dark:text-slate-300">
          {v ? new Date(v).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }) : "—"}
        </span>
      ),
    },
    {
      key: "approved" as const,
      label: "Approved",
      sortable: true,
      render: (v: boolean) => <StatusBadge status={v ? "active" : "inactive"} />,
    },
    {
      key: "approved_by_name" as const,
      label: "By",
      sortable: false,
      render: (v: string | null) => <span className="text-slate-600 dark:text-slate-300">{v || "—"}</span>,
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: ExitPermission) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingExit(item); setIsExitModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteExit(item.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const bedColumns = [
    {
      key: "number" as const,
      label: "Bed Number",
      sortable: true,
      render: (v: string) => <span className="font-semibold text-slate-900 dark:text-white">{v}</span>,
    },
    {
      key: "room_name" as const,
      label: "Room",
      sortable: true,
      render: (v: string) => <span className="text-slate-600 dark:text-slate-300">{v || "—"}</span>,
    },
    {
      key: "status" as const,
      label: "Status",
      sortable: true,
      render: (v: string) => <StatusBadge status={v === "free" ? "active" : "inactive"} />,
    },
    {
      key: "id" as any,
      label: "Actions",
      render: (_: any, item: Bed) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingBed(item); setIsBedModalOpen(true); }}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteBed(item.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="space-y-6 p-6 animate-in fade-in duration-500">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-xl shadow-lg">
              <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            Boarding
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Management of boarding students, rooms, attendances and exits
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Housed Students"
            value={dashboard?.students_housed ?? 0}
            subtitle={`Occupancy Rate: ${dashboard?.occupancy_rate ?? 0}%`}
            icon={<Users className="w-6 h-6" />}
          />
          <KpiCard
            title="Available Beds"
            value={dashboard?.beds_free ?? 0}
            subtitle={`${dashboard?.beds_occupied ?? 0} occupied / ${dashboard?.beds_total ?? 0} total`}
            icon={<BedDouble className="w-6 h-6" />}
          />
          <KpiCard
            title="Present Today"
            value={dashboard?.students_present ?? 0}
            subtitle="Daily Attendance"
            icon={<CalendarCheck className="w-6 h-6" />}
          />
          <KpiCard
            title="Pending Exits"
            value={dashboard?.pending_exits ?? 0}
            subtitle={`${dashboard?.exits_today ?? 0} exits today`}
            icon={<LogOut className="w-6 h-6" />}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <TabsTrigger value="assignments" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-950 text-xs sm:text-sm">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="rooms" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-950 text-xs sm:text-sm">
              Rooms
            </TabsTrigger>
            <TabsTrigger value="attendance" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-950 text-xs sm:text-sm">
              Attendances
            </TabsTrigger>
            <TabsTrigger value="exits" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-950 text-xs sm:text-sm">
              Exits
            </TabsTrigger>
            <TabsTrigger value="beds" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-950 text-xs sm:text-sm">
              Beds
            </TabsTrigger>
          </TabsList>

          {/* ── Assignments Tab ── */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Students assigned to rooms and beds
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => { setEditingHousing(null); setIsHousingModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Assignment
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredHousings.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredHousings.filter((h) => h.is_active).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Boys</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {filteredHousings.filter((h) => h.room_type === "boy").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Girls</p>
                <p className="text-2xl font-bold text-pink-600 dark:text-pink-400 mt-1">
                  {filteredHousings.filter((h) => h.room_type === "girl").length}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Search student..."
                value={housingSearch}
                onChange={(e) => setHousingSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={housingStatusFilter} onValueChange={(v) => setHousingStatusFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredHousings} columns={housingColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Rooms Tab ── */}
          <TabsContent value="rooms" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rooms</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Rooms and boarding capacity
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => { setEditingRoom(null); setIsRoomModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Room
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Rooms</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredRooms.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total beds</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {filteredRooms.reduce((s, r) => s + r.beds_total, 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Occupied</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {filteredRooms.reduce((s, r) => s + r.beds_occupied, 0)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Available</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredRooms.reduce((s, r) => s + (r.beds_total - r.beds_occupied), 0)}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={roomTypeFilter} onValueChange={(v) => setRoomTypeFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="boy">Boys</SelectItem>
                  <SelectItem value="girl">Girls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredRooms} columns={roomColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Attendance Tab ── */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendances</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Daily tracking of boarding attendances
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => { setEditingAttendance(null); setIsAttendanceModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Attendance
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Present</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredAttendances.filter((a) => a.status === "present").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Absent</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {filteredAttendances.filter((a) => a.status === "absent").length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Authorized Exits</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {filteredAttendances.filter((a) => a.status === "authorized").length}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={attendanceStatusFilter} onValueChange={(v) => setAttendanceStatusFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="authorized">Authorized Exit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredAttendances} columns={attendanceColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Exit Permissions Tab ── */}
          <TabsContent value="exits" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Authorized Exits</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Boarding students exit requests and authorizations
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => { setEditingExit(null); setIsExitModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Exit Request
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{filteredExits.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Approved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {filteredExits.filter((e) => e.approved).length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                <p className="text-sm text-muted-foreground dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {filteredExits.filter((e) => !e.approved).length}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Select value={exitApprovedFilter} onValueChange={(v) => setExitApprovedFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Approval status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredExits} columns={exitColumns} itemsPerPage={10} />
            </div>
          </TabsContent>

          {/* ── Beds Tab ── */}
          <TabsContent value="beds" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Beds</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage individual beds across all rooms
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => { setEditingBed(null); setIsBedModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Bed
              </Button>
            </div>

            <div className="flex gap-4">
              <Select value={bedRoomFilter} onValueChange={setBedRoomFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={bedStatusFilter} onValueChange={(v) => setBedStatusFilter(v as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
              <DataTable data={filteredBeds} columns={bedColumns} itemsPerPage={10} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      {/* Room Modal */}
      <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? "Edit Room" : "New Room"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRoomSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name</Label>
              <Input id="name" name="name" defaultValue={editingRoom?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" defaultValue={editingRoom?.capacity} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room_type">Room Type</Label>
              <Select name="room_type" defaultValue={editingRoom?.room_type || "boy"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boy">Boys</SelectItem>
                  <SelectItem value="girl">Girls</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{editingRoom ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Housing Modal */}
      <Dialog open={isHousingModalOpen} onOpenChange={(open) => {
        setIsHousingModalOpen(open);
        if (open) {
          const initId = editingHousing ? String(editingHousing.student) : "";
          setSelectedStudentId(initId);
          setStudentSearch("");
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHousing ? "Edit Assignment" : "New Assignment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleHousingSubmit} className="space-y-4">
            {/* ── Searchable Student Picker ── */}
            <div className="space-y-2">
              <Label htmlFor="student-search">Student</Label>
              <input type="hidden" name="student" value={selectedStudentId} />
              <div className="relative" ref={studentDropdownRef}>
                <Input
                  id="student-search"
                  placeholder="Search by name or enrollment number…"
                  value={studentSearch || selectedStudentLabel}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setSelectedStudentId("");
                    setStudentDropdownOpen(true);
                  }}
                  onFocus={() => setStudentDropdownOpen(true)}
                  autoComplete="off"
                  className="w-full"
                />
                {studentDropdownOpen && filteredStudentOptions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                    {filteredStudentOptions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-950 flex items-center justify-between gap-2 ${
                          selectedStudentId === String(s.id) ? "bg-purple-100 dark:bg-purple-900 font-semibold" : ""
                        }`}
                        onClick={() => {
                          setSelectedStudentId(String(s.id));
                          setStudentSearch("");
                          setStudentDropdownOpen(false);
                        }}
                      >
                        <span className="truncate">{s.full_name || "—"}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{s.enrollment_number}</span>
                      </button>
                    ))}
                  </div>
                )}
                {studentDropdownOpen && filteredStudentOptions.length === 0 && studentSearch && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg px-3 py-2 text-sm text-slate-500">
                    No students found
                  </div>
                )}
              </div>
              {selectedStudentId && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ Selected: {selectedStudentLabel}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Select name="room" defaultValue={editingHousing ? String(editingHousing.room) : undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bed">Bed</Label>
                <Select name="bed" defaultValue={editingHousing ? String(editingHousing.bed) : undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Bed" />
                  </SelectTrigger>
                  <SelectContent>
                    {beds.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.number} ({b.status})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fees">Fees</Label>
                <Select name="fees" defaultValue={editingHousing ? String(editingHousing.fees) : undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Fees" />
                  </SelectTrigger>
                  <SelectContent>
                    {fees.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.label} ({f.amount})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period_category">Period</Label>
                <Select name="period_category" defaultValue={editingHousing ? String((editingHousing as any).period_category) : "4"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Monthly</SelectItem>
                    <SelectItem value="2">Quarterly</SelectItem>
                    <SelectItem value="3">Semiannually</SelectItem>
                    <SelectItem value="4">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select name="is_active" defaultValue={String(editingHousing?.is_active ?? true)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{editingHousing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendance Modal */}
      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAttendance ? "Edit Attendance" : "New Attendance"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAttendanceSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select name="student" defaultValue={editingAttendance ? String(editingAttendance.student) : undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={editingAttendance?.date || new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={editingAttendance?.status || "present"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="authorized">Authorized Exit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{editingAttendance ? "Update" : "Record"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exit Modal */}
      <Dialog open={isExitModalOpen} onOpenChange={setIsExitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExit ? "Edit Exit Request" : "New Exit Request"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExitSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select name="student" defaultValue={editingExit ? String(editingExit.student) : undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" name="reason" defaultValue={editingExit?.reason} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exit_date">Exit Date</Label>
                <Input id="exit_date" name="exit_date" type="datetime-local" defaultValue={editingExit?.exit_date?.slice(0, 16)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return_date">Return Date</Label>
                <Input id="return_date" name="return_date" type="datetime-local" defaultValue={editingExit?.return_date?.slice(0, 16)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approved">Approved</Label>
              <Select name="approved" defaultValue={String(editingExit?.approved ?? false)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Approved</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{editingExit ? "Update" : "Submit"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bed Modal */}
      <Dialog open={isBedModalOpen} onOpenChange={setIsBedModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBed ? "Edit Bed" : "New Bed"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBedSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Select name="room" defaultValue={editingBed ? String(editingBed.room) : undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Bed Number</Label>
              <Input id="number" name="number" defaultValue={editingBed?.number} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={editingBed?.status || "free"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{editingBed ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete Dialog ─────────────────────────────────────────── */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                {confirmDialog.title}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-13">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog((d) => ({ ...d, open: false }));
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

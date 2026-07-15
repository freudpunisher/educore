"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

type ModuleAccess = {
  manage: boolean;
  view: boolean;
};

type RoleRow = {
  role_id: number;
  role_code: string;
  role_name: string;
  modules: Record<string, ModuleAccess>;
};

type AccessData = {
  modules: string[];
  roles: RoleRow[];
};

const MODULE_LABELS: Record<string, string> = {
  users: "Users (Students & Employees)",
  academics: "Academics (Pedagogy, Planning, Tracking, Attendance...)",
  finance: "Finance",
  transport: "Transport",
  food: "Restaurant",
  store: "Storage",
  boarding: "Boarding",
  daycare: "Daycare",
  audit: "Audit Logs",
  system: "Settings",
  reports: "Reports",
};

export function PermissionsTab() {
  const [data, setData] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<
    Array<{ role_id: number; module: string; can_manage: boolean }>
  >([]);

  const fetchAccess = async () => {
    try {
      const res = await api.get<any>("users/module-access/");
      const payload = res?.data ?? res;
      if (!payload || !payload.modules || !payload.roles) {
        console.error("Unexpected response format:", payload);
        toast.error("Invalid response format from server");
        return;
      }
      setData(payload);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load permissions data";
      toast.error(msg);
      console.error("Module access fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccess();
  }, []);

  const handleToggle = (roleId: number, module: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setPendingChanges((prev) => {
      const filtered = prev.filter(
        (c) => !(c.role_id === roleId && c.module === module)
      );
      return [...filtered, { role_id: roleId, module, can_manage: newValue }];
    });
    setDirty(true);

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        roles: prev.roles.map((r) =>
          r.role_id === roleId
            ? {
                ...r,
                modules: {
                  ...r.modules,
                  [module]: { ...r.modules[module], manage: newValue },
                },
              }
            : r
        ),
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        pendingChanges.map((change) =>
          api.patch("users/module-access/", change)
        )
      );
      setPendingChanges([]);
      setDirty(false);
      toast.success("Permissions updated successfully");
    } catch {
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Failed to load permissions data.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Module Access Permissions</CardTitle>
        <Button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Toggle <Badge variant="outline">Manage</Badge> access per role and
          module. Roles without manage access have view-only access.
        </p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card min-w-[160px]">
                  Role
                </TableHead>
                {data.modules.map((mod) => (
                  <TableHead key={mod} className="text-center min-w-[100px]">
                    <span className="text-[10px] uppercase font-bold">
                      {MODULE_LABELS[mod] || mod}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.roles.map((role) => (
                <TableRow key={role.role_id}>
                  <TableCell className="sticky left-0 bg-card font-medium">
                    <div className="flex items-center gap-2">
                      <span>{role.role_name}</span>
                      <Badge variant="secondary" className="text-[9px]">
                        {role.role_code}
                      </Badge>
                    </div>
                  </TableCell>
                  {data.modules.map((mod) => {
                    const access = role.modules[mod];
                    const isPending = pendingChanges.some(
                      (c) =>
                        c.role_id === role.role_id && c.module === mod
                    );
                    return (
                      <TableCell key={mod} className="text-center">
                        <Switch
                          checked={access?.manage ?? false}
                          onCheckedChange={() =>
                            handleToggle(
                              role.role_id,
                              mod,
                              access?.manage ?? false
                            )
                          }
                          className={
                            isPending ? "animate-pulse" : ""
                          }
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

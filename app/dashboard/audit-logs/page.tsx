"use client";

import { useState } from "react";
import { 
  FileText, 
  Search, 
  Download, 
  Filter, 
  RefreshCcw,
  AlertTriangle,
  Info,
  ShieldAlert
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs, useAuditAnalytics } from "@/hooks/use-audit";
import { useDebounce } from "@/hooks/use-debounce";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const MODULES = [
  { value: "auth", label: "Authentification" },
  { value: "academics", label: "Académique" },
  { value: "finance", label: "Finance" },
  { value: "users", label: "Utilisateurs" },
  { value: "transport", label: "Transport" },
  { value: "store", label: "Magasin" },
];

const ACTIONS = [
  { value: "LOGIN", label: "Connexion" },
  { value: "LOGOUT", label: "Déconnexion" },
  { value: "CREATE", label: "Création" },
  { value: "UPDATE", label: "Modification" },
  { value: "DELETE", label: "Suppression" },
  { value: "VIEW", label: "Consultation" },
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [module, setModule] = useState<string>("all");
  const [action, setAction] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [dateGte, setDateGte] = useState("");
  const [dateLte, setDateLte] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const { data: auditResponse, isLoading, refetch } = useAuditLogs({
    page,
    search: debouncedSearch || undefined,
    module: module === "all" ? undefined : module,
    action: action === "all" ? undefined : action,
    status: status === "all" ? undefined : status,
    date_gte: dateGte || undefined,
    date_lte: dateLte || undefined,
  });

  const { data: analytics } = useAuditAnalytics();

  const logs = auditResponse?.results || [];
  const totalCount = auditResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / 15);

  const handleExport = () => {
    // URL d'exportation vers le backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const params = new URLSearchParams({
      days: "30",
      format: "csv"
    });
    window.open(`${baseUrl}/audit/audit-logs/export/?${params.toString()}`, "_blank");
  };

  const getCriticalityBadge = (level: string) => {
    switch (level) {
      case "CRITICAL":
        return <Badge variant="destructive" className="flex gap-1 items-center"><ShieldAlert className="w-3 h-3"/> Critique</Badge>;
      case "WARNING":
        return <Badge variant="warning" className="flex gap-1 items-center"><AlertTriangle className="w-3 h-3"/> Alerte</Badge>;
      default:
        return <Badge variant="secondary" className="flex gap-1 items-center"><Info className="w-3 h-3"/> Info</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "SUCCESS" 
      ? <Badge variant="success">Succès</Badge> 
      : <Badge variant="destructive">Échec</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Journal d'Audit & Traçabilité
          </h1>
          <p className="text-muted-foreground">
            Suivi complet des accès et actions des utilisateurs sur la plateforme.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Actualiser
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Exporter CSV
          </Button>
        </div>
      </div>

      {/* Analytics Mini Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{analytics?.total_actions || 0}</div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Actions totales (7j)</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{analytics?.critical_actions || 0}</div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Actions critiques</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{analytics?.suspicious_activities || 0}</div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Activités suspectes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">Stable</div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">État du système</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtres et Recherche
          </CardTitle>
          <CardDescription>Affinez les résultats pour trouver des actions spécifiques.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Utilisateur, desc..." 
                  className="pl-8" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Module</label>
              <Select value={module} onValueChange={setModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les modules</SelectItem>
                  {MODULES.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  {ACTIONS.map(a => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="SUCCESS">Succès</SelectItem>
                  <SelectItem value="FAILURE">Échec</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Depuis le</label>
              <Input type="date" value={dateGte} onChange={(e) => setDateGte(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jusqu'au</label>
              <Input type="date" value={dateLte} onChange={(e) => setDateLte(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[180px]">Date & Heure</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead className="max-w-[300px]">Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Criticité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Aucun log trouvé correspondant à vos critères.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className={log.is_critical ? "bg-red-50/30" : ""}>
                    <TableCell className="font-medium">
                      {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{log.username}</span>
                        <span className="text-xs text-muted-foreground">{log.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action_display}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{log.module}</span>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate" title={log.description}>
                      {log.description}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-xs font-mono">{log.ip_address || "N/A"}</TableCell>
                    <TableCell>{getCriticalityBadge(log.criticality)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <div className="p-4 border-t">
            <Pagination 
              currentPage={page} 
              totalCount={totalCount} 
              pageSize={15} 
              onPageChange={setPage} 
            />
          </div>
        )}
      </Card>
    </div>
  );
}

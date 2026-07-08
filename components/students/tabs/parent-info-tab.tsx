"use client";

import { StudentDetail } from "@/types/student";
import {
    Phone, Mail, Briefcase, MapPin, HeartHandshake,
    UserCircle2, Users, Home, BookOpen, Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarDays, Hash, BadgeCheck } from "lucide-react";

interface ParentInfoTabProps {
    student: StudentDetail;
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string | null;
}) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0">
            <div className="p-2 bg-primary/8 rounded-xl text-primary/70 flex-shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/55">
                    {label}
                </p>
                <p className="font-semibold text-sm text-foreground truncate">{value}</p>
            </div>
        </div>
    );
}

function ParentCard({
    title,
    colorClass,
    iconColorClass,
    name,
    phone,
    job,
    empty,
}: {
    title: string;
    colorClass: string;
    iconColorClass: string;
    name?: string | null;
    phone?: string | null;
    job?: string | null;
    empty: string;
}) {
    if (!name && !phone && !job) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-muted-foreground">
                    <UserCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-semibold">Aucune information enregistrée</p>
                    <p className="text-xs opacity-60 mt-0.5">pour le {empty}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`overflow-hidden bg-gradient-to-br ${colorClass} to-transparent border-border/60 shadow-sm`}>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${iconColorClass}`}>
                        <UserCircle2 className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/55 mb-0.5">
                            {title}
                        </p>
                        <p className="text-lg font-black text-foreground leading-tight mb-4">
                            {name || "—"}
                        </p>

                        <div className="space-y-2.5">
                            {phone ? (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="p-1.5 bg-background/60 rounded-lg flex-shrink-0 shadow-sm">
                                        <Phone className="h-3.5 w-3.5 text-primary/70" />
                                    </div>
                                    <a
                                        href={`tel:${phone}`}
                                        className="font-medium hover:text-primary transition-colors"
                                    >
                                        {phone}
                                    </a>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground/45">
                                    <div className="p-1.5 bg-muted/40 rounded-lg flex-shrink-0">
                                        <Phone className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="italic text-xs">Aucun téléphone</span>
                                </div>
                            )}

                            {job && (
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <div className="p-1.5 bg-background/60 rounded-lg flex-shrink-0 shadow-sm">
                                        <Briefcase className="h-3.5 w-3.5 text-primary/70" />
                                    </div>
                                    <span className="font-medium">{job}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ParentInfoTab({ student }: ParentInfoTabProps) {
    const s = student as any;

    const hasAddress =
        s.address_parent_quarter || s.address_parent_commune || s.address_parent_province;

    const addressParts = [
        s.address_parent_quarter,
        s.address_parent_commune,
        s.address_parent_province,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Father & Mother */}
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-primary" />
                    Informations des parents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ParentCard
                        title="Père"
                        colorClass="from-blue-500/10"
                        iconColorClass="bg-blue-500/15 text-blue-600"
                        name={s.father_full_name}
                        phone={s.father_phone_number}
                        job={s.father_job_name}
                        empty="père"
                    />
                    <ParentCard
                        title="Mère"
                        colorClass="from-rose-500/10"
                        iconColorClass="bg-rose-500/15 text-rose-600"
                        name={s.mother_full_name}
                        phone={s.mother_phone_number}
                        job={s.mother_job_name}
                        empty="mère"
                    />
                </div>
            </div>

            {/* Home address */}
            {hasAddress && (
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                        <Home className="h-4 w-4 text-primary" />
                        Adresse du domicile
                    </h3>
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex-shrink-0">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    {s.address_parent_quarter && (
                                        <p className="text-sm font-semibold text-foreground">
                                            Quartier : {s.address_parent_quarter}
                                        </p>
                                    )}
                                    {s.address_parent_commune && (
                                        <p className="text-sm text-muted-foreground">
                                            Commune : {s.address_parent_commune}
                                        </p>
                                    )}
                                    {s.address_parent_province && (
                                        <p className="text-sm text-muted-foreground">
                                            Province : {s.address_parent_province}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Student personal & dossier info */}
            <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Dossier de l'élève
                </h3>
                <Card className="shadow-sm">
                    <CardContent className="p-6 divide-y divide-border/50">
                        <InfoRow
                            icon={<Hash className="h-4 w-4" />}
                            label="Numéro d'inscription"
                            value={student.enrollment_number}
                        />
                        <InfoRow
                            icon={<CalendarDays className="h-4 w-4" />}
                            label="Date de naissance"
                            value={
                                student.date_of_birth
                                    ? format(new Date(student.date_of_birth), "MMMM dd, yyyy")
                                    : undefined
                            }
                        />
                        <InfoRow
                            icon={<MapPin className="h-4 w-4" />}
                            label="Lieu de naissance"
                            value={s.place_of_birth}
                        />
                        <InfoRow
                            icon={<Globe className="h-4 w-4" />}
                            label="Nationalité"
                            value={s.nationality}
                        />
                        <InfoRow
                            icon={<BookOpen className="h-4 w-4" />}
                            label="Religion"
                            value={s.religion}
                        />
                        <InfoRow
                            icon={<Phone className="h-4 w-4" />}
                            label="Contact parent (dossier)"
                            value={student.parent_contact as string | undefined}
                        />
                        <InfoRow
                            icon={<Mail className="h-4 w-4" />}
                            label="Email parent (dossier)"
                            value={student.parent_email as string | undefined}
                        />
                        <InfoRow
                            icon={<BadgeCheck className="h-4 w-4" />}
                            label="Statut de validation"
                            value={student.is_validate ? "Validé" : "En attente de validation"}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

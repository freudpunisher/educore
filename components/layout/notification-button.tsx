"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    CreditCard,
    CalendarCheck,
    AlertTriangle,
    Info,
    Megaphone,
    ShieldAlert,
    CircleX,
    Trash2,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import {
    useDeleteNotification,
    useMarkAllAsRead,
    useMarkAsRead,
    useNotifications,
    useUnreadCount,
} from "@/hooks/use-notifications";
import type { Notification, NotificationType } from "@/types/notifications";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Icônes et couleurs par type
// ---------------------------------------------------------------------------
const TYPE_ICON: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
    INFO: Info,
    SUCCESS: Check,
    WARNING: AlertTriangle,
    ERROR: CircleX,
    PAYMENT: CreditCard,
    ATTENDANCE: CalendarCheck,
    DISCIPLINE: ShieldAlert,
    ANNOUNCEMENT: Megaphone,
    SYSTEM: Bell,
};

const TYPE_COLOR: Record<NotificationType, string> = {
    INFO: "text-sky-500",
    SUCCESS: "text-emerald-500",
    WARNING: "text-amber-500",
    ERROR: "text-rose-500",
    PAYMENT: "text-emerald-500",
    ATTENDANCE: "text-indigo-500",
    DISCIPLINE: "text-orange-500",
    ANNOUNCEMENT: "text-violet-500",
    SYSTEM: "text-slate-500",
};

function formatTimeAgo(iso: string): string {
    if (!iso) return "";
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days} j`;
    return date.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Sous-composant : ligne de notification
// ---------------------------------------------------------------------------
function NotificationRow({
    notification,
    onRead,
    onDelete,
}: {
    notification: Notification;
    onRead: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    const router = useRouter();
    const Icon = TYPE_ICON[notification.type] ?? Bell;
    const color = TYPE_COLOR[notification.type] ?? "text-slate-500";

    const handleClick = () => {
        if (!notification.is_read) onRead(notification.id);
        if (notification.link) router.push(notification.link);
    };

    return (
        <div
            className={cn(
                "group relative flex gap-3 p-3 transition-colors cursor-pointer",
                "hover:bg-muted/60",
                !notification.is_read && "bg-primary/5"
            )}
            onClick={handleClick}
        >
            <div className={cn("mt-0.5 shrink-0", color)}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={cn(
                            "text-sm leading-snug",
                            !notification.is_read ? "font-semibold" : "font-medium"
                        )}
                    >
                        {notification.title}
                    </p>
                    {!notification.is_read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        aria-label="Supprimer la notification"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Composant principal : cloche du navbar
// ---------------------------------------------------------------------------
export function NotificationButton() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const { data: unread, isLoading: loadingCount } = useUnreadCount();
    const { data: notifications, isLoading: loadingList } = useNotifications({
        page_size: 20,
    });

    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const deleteNotification = useDeleteNotification();

    const unreadCount = unread?.unread_count ?? 0;
    const list = notifications ?? [];

    const handleMarkAll = async () => {
        try {
            const res = await markAllAsRead.mutateAsync();
            toast.success("Tout marqué comme lu", `${res.updated} notification(s)`);
        } catch {
            toast.error("Erreur", "Impossible de marquer les notifications.");
        }
    };

    const handleRead = (id: number) => {
        markAsRead.mutate(id);
    };

    const handleDelete = (id: number) => {
        deleteNotification.mutate(id);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    {unreadCount > 0 ? (
                        <Bell className="w-5 h-5" />
                    ) : (
                        <Bell className="w-5 h-5" />
                    )}
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className={cn(
                                "absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1",
                                "flex items-center justify-center rounded-full text-[10px] font-bold",
                                "border-2 border-card"
                            )}
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-96 p-0 shadow-lg"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                                {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                            </Badge>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAll}
                        disabled={unreadCount === 0 || markAllAsRead.isPending}
                        className="h-7 text-xs"
                    >
                        {markAllAsRead.isPending ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                            <CheckCheck className="w-3 h-3 mr-1" />
                        )}
                        Tout marquer
                    </Button>
                </div>

                <Separator />

                {/* Body */}
                <ScrollArea className="h-[420px]">
                    {loadingList || loadingCount ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : list.length === 0 ? (
                        <Empty className="border-0 py-10">
                            <EmptyHeader>
                                <BellOff className="w-10 h-10 mx-auto text-muted-foreground/40" />
                                <EmptyTitle className="text-sm">Aucune notification</EmptyTitle>
                                <EmptyDescription className="text-xs">
                                    Vous serez prévenu ici des nouveaux événements.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="divide-y">
                            {list.map((n) => (
                                <NotificationRow
                                    key={n.id}
                                    notification={n}
                                    onRead={handleRead}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <Separator />

                {/* Footer */}
                <div className="p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full justify-center text-xs"
                    >
                        <Link href="/dashboard/notifications">
                            Voir toutes les notifications
                        </Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

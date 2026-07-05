"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
    notificationCountSchema,
    notificationSchema,
    type Notification,
} from "@/types/notifications";

const ENDPOINT = "/notifications/";

// Clés de cache regroupées pour invalidation facile
export const notificationKeys = {
    all: ["notifications"] as const,
    list: (params?: Record<string, unknown>) =>
        [...notificationKeys.all, "list", params ?? {}] as const,
    unread: () => [...notificationKeys.all, "unread"] as const,
    stats: () => [...notificationKeys.all, "stats"] as const,
};

/**
 * Récupère la liste paginée des notifications de l'utilisateur courant.
 */
export function useNotifications(params?: { page?: number; page_size?: number }) {
    return useQuery({
        queryKey: notificationKeys.list(params),
        queryFn: async () => {
            const { data } = await axiosInstance.get(ENDPOINT, { params });
            const results = (data?.results ?? data) as unknown[];
            return results.map((n) => notificationSchema.parse(n)) as Notification[];
        },
        refetchOnWindowFocus: true,
        staleTime: 30_000,
    });
}

/**
 * Compteur non-lues — optimisé pour le polling rapide de la pastille.
 */
export function useUnreadCount(pollIntervalMs = 30_000) {
    return useQuery({
        queryKey: notificationKeys.unread(),
        queryFn: async () => {
            const { data } = await axiosInstance.get(`${ENDPOINT}unread_count/`);
            return notificationCountSchema.parse(data);
        },
        refetchInterval: pollIntervalMs,
        refetchOnWindowFocus: true,
        staleTime: 10_000,
    });
}

/**
 * Marque une notification comme lue.
 */
export function useMarkAsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await axiosInstance.post(
                `${ENDPOINT}${id}/mark_read/`
            );
            return notificationSchema.parse(data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

/**
 * Marque toutes les notifications comme lues.
 */
export function useMarkAllAsRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await axiosInstance.post(
                `${ENDPOINT}mark_all_read/`
            );
            return data as { updated: number };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

/**
 * Supprime une notification.
 */
export function useDeleteNotification() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await axiosInstance.delete(`${ENDPOINT}${id}/`);
            return id;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

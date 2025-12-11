
export interface NotificationItem {
    id: string;
    taskId: string;
    titulo: string;
    eventType: string; // 'COMMENT_EDIT' | 'STATUS_CHANGE' etc.
    payload: Record<string, any> | null;
    createdAt: string;
}

export interface NotificationListResponse {
    items: NotificationItem[];
    total: number;
}

export interface MarkAsReadParams {
    taskId?: string;
    notificationId?: string;
}

export interface MarkAsReadResponse {
    affected: number;
}

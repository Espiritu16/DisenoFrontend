import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'error' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<AppNotification[]>([]);

  show(kind: NotificationKind, title: string, message?: string): string {
    const id = crypto.randomUUID();
    const next: AppNotification = { id, kind, title, message };
    this.notifications.update((items) => [...items, next]);
    return id;
  }

  showSuccess(title: string, message?: string): string {
    return this.show('success', title, message);
  }

  showError(title: string, message?: string): string {
    return this.show('error', title, message);
  }

  close(id: string): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }
}

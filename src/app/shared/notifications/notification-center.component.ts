import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.css'
})
export class NotificationCenterComponent {
  constructor(public notifications: NotificationService) {}

  close(id: string): void {
    this.notifications.close(id);
  }
}

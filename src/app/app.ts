import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationCenterComponent } from './shared/notifications/notification-center.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationCenterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}

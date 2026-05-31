import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotWidgetComponent } from './shared/chatbot/chatbot-widget.component';
import { NotificationCenterComponent } from './shared/notifications/notification-center.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationCenterComponent, ChatbotWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}

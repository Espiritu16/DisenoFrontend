import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotWidgetComponent } from './shared/chatbot/chatbot-widget.component';
import { NotificationCenterComponent } from './shared/notifications/notification-center.component';
import { BotonDemo } from '../demo/boton-demo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationCenterComponent, ChatbotWidgetComponent, BotonDemo],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
